import { useCallback, useRef, useState } from "react";
import { ApiError } from "../core/api.ts";
import { isSupportedMedia } from "../dashboard/schemas.ts";
import { orgMediaUrl } from "../dashboard/api.ts";
import {
  articleBlocks,
  cleanBlocks,
  emptyBlock,
  hasArticleContent,
  insertAt,
  mediaLookup,
  moveItem,
  withKeys,
  type EditorBlock,
  type MediaLookup,
} from "./article.ts";
import type {
  BlockType,
  OrgPost,
  PostKind,
  PostStatus,
  PostVisibility,
} from "./board-api.ts";
import {
  useCreatePost,
  useCreateRevision,
  usePublishPost,
  useUpdatePost,
  useUploadPostMedia,
} from "./board-hooks.ts";

export type EditorStatus = PostStatus | "new";
export type SaveMode = "draft" | "publish";
export type UploadState = "uploading" | "failed";

// Client-only codes surfaced through the workspace copy table.
export const EDITOR_CODES = {
  empty: "POST_CONTENT_REQUIRED",
  title: "POST_TITLE_REQUIRED",
  uploading: "UPLOAD_IN_PROGRESS",
  badFile: "UNSUPPORTED_MEDIA",
} as const;

export const COVER_KEY = "cover";

function startingBlocks(initial: OrgPost | null): EditorBlock[] {
  const blocks = initial ? withKeys(articleBlocks(initial)) : [];
  return blocks.length > 0 ? blocks : [emptyBlock("paragraph")];
}

// Whole article editing state: blocks, cover, inline uploads (board post
// media, never the org gallery) and the
// create/update/publish save pipeline. onPublished fires once a save
// lands the article on the board (write page navigates to the reader).
export function useArticleEditor(
  orgId: string,
  initial: OrgPost | null,
  onPublished?: (post: OrgPost) => void,
  canAnnounce = false,
) {
  const [postId, setPostId] = useState<string | null>(initial?.post_id ?? null);
  const [status, setStatus] = useState<EditorStatus>(initial?.status ?? "new");
  const [revisionOf, setRevisionOf] = useState<string | null>(
    initial?.revision_of ?? null,
  );
  const [wasPublished] = useState(initial?.published_at != null);
  // Managers default to "announcement" (org news is their fast path);
  // plain members get "discussion" since announce is blocked for them.
  const [kind, setKindState] = useState<PostKind>(
    initial?.kind ?? (canAnnounce ? "announcement" : "discussion"),
  );
  // Audience axis: defaults mirror the kind default (announcement ->
  // public, discussion -> members); an existing post keeps its own.
  const [visibility, setVisibilityState] = useState<PostVisibility>(
    initial?.visibility ??
      ((initial?.kind ?? (canAnnounce ? "announcement" : "discussion")) ===
      "announcement"
        ? "public"
        : "members"),
  );
  const [title, setTitleState] = useState(initial?.title ?? "");
  const [coverId, setCoverId] = useState<string | null>(initial?.cover_media_id ?? null);
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => startingBlocks(initial));
  const [lookup, setLookup] = useState<MediaLookup>(() => mediaLookup(initial?.media ?? []));
  const [uploads, setUploads] = useState<Record<string, UploadState>>({});
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(initial?.updated_at ?? null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const editTick = useRef(0);
  const upload = useUploadPostMedia(orgId);
  const create = useCreatePost(orgId);
  const update = useUpdatePost(orgId);
  const publish = usePublishPost(orgId);
  const revise = useCreateRevision(orgId);

  const touch = useCallback(() => {
    editTick.current += 1;
    setDirty(true);
  }, []);

  const changeBlocks = useCallback(
    (fn: (prev: EditorBlock[]) => EditorBlock[]) => {
      setBlocks(fn);
      touch();
    },
    [touch],
  );

  function setUpload(key: string, state: UploadState | null): void {
    setUploads((prev) => {
      const next = { ...prev };
      if (state === null) delete next[key];
      else next[key] = state;
      return next;
    });
  }

  async function uploadFile(key: string, file: File): Promise<string | null> {
    setUpload(key, "uploading");
    try {
      const media = await upload.mutateAsync(file);
      setLookup((prev) => ({
        ...prev,
        [media.id]: { url: orgMediaUrl(media.file_url), mime: media.mime },
      }));
      setUpload(key, null);
      return media.id;
    } catch (error) {
      setUpload(key, "failed");
      setErrorCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
      return null;
    }
  }

  function acceptable(file: File, family: "image" | "video"): boolean {
    if (!isSupportedMedia(file)) return false;
    // Empty mime is only allowed for image extensions (heic, tiff...).
    const type = file.type.split(";")[0].trim().toLowerCase();
    return type === "" ? family === "image" : type.startsWith(`${family}/`);
  }

  // Insert one media block per file at `index`, uploading in order.
  async function insertMedia(index: number, family: "image" | "video", files: File[]) {
    const ok = files.filter((file) => acceptable(file, family));
    setErrorCode(ok.length < files.length ? EDITOR_CODES.badFile : null);
    if (ok.length === 0) return;
    const fresh = ok.map(() => emptyBlock(family));
    changeBlocks((prev) => insertAt(prev, index, fresh));
    for (const [i, file] of ok.entries()) {
      const assetId = await uploadFile(fresh[i].key, file);
      if (assetId !== null) patchBlock(fresh[i].key, { asset_id: assetId });
    }
  }

  async function replaceMedia(key: string, file: File): Promise<void> {
    const block = blocks.find((item) => item.key === key);
    if (!block || (block.type !== "image" && block.type !== "video")) return;
    if (!acceptable(file, block.type)) {
      setErrorCode(EDITOR_CODES.badFile);
      return;
    }
    const assetId = await uploadFile(key, file);
    if (assetId !== null) patchBlock(key, { asset_id: assetId });
  }

  async function changeCover(file: File | null): Promise<void> {
    if (file === null) {
      setCoverId(null);
      touch();
      return;
    }
    if (!acceptable(file, "image")) {
      setErrorCode(EDITOR_CODES.badFile);
      return;
    }
    const assetId = await uploadFile(COVER_KEY, file);
    if (assetId !== null) {
      setCoverId(assetId);
      touch();
    }
  }

  function patchBlock(key: string, patch: Partial<EditorBlock>): void {
    changeBlocks((prev) =>
      prev.map((block) =>
        block.key === key ? ({ ...block, ...patch } as EditorBlock) : block,
      ),
    );
  }

  function insertBlock(index: number, type: BlockType): void {
    const block = emptyBlock(type);
    changeBlocks((prev) => insertAt(prev, index, [block]));
    setFocusKey(block.key);
  }

  function removeBlock(key: string): void {
    changeBlocks((prev) => {
      const next = prev.filter((block) => block.key !== key);
      return next.length > 0 ? next : [emptyBlock("paragraph")];
    });
    setUpload(key, null);
  }

  function moveBlock(key: string, delta: number): void {
    changeBlocks((prev) =>
      moveItem(prev, prev.findIndex((block) => block.key === key), delta),
    );
  }

  function validate(mode: SaveMode): string | null {
    if (Object.values(uploads).includes("uploading")) return EDITOR_CODES.uploading;
    const content = cleanBlocks(blocks);
    if (mode === "draft") {
      return title.trim() || hasArticleContent(content) || coverId
        ? null
        : EDITOR_CODES.empty;
    }
    if (!hasArticleContent(content)) return EDITOR_CODES.empty;
    if (kind === "announcement" && !title.trim()) return EDITOR_CODES.title;
    return null;
  }

  // Draft saves keep the post private; a draft save on a published post
  // stages a private revision (the live version stays up). Publish
  // creates/updates and then flips a draft onto the board; for a
  // revision the server folds it back onto the original post. Returns
  // the saved post or null.
  async function save(mode: SaveMode): Promise<OrgPost | null> {
    const problem = validate(mode);
    setErrorCode(problem);
    if (problem !== null) return null;
    const tick = editTick.current;
    const payload = {
      title: title.trim(),
      blocks: cleanBlocks(blocks),
      cover_media_id: coverId,
    };
    try {
      let saved: OrgPost;
      if (postId === null) {
        saved = await create.mutateAsync({
          ...payload,
          kind,
          visibility,
          status: mode === "publish" ? "published" : "draft",
        });
      } else {
        let target = postId;
        let parent = revisionOf;
        if (mode === "draft" && status === "published") {
          const rev = await revise.mutateAsync(postId);
          target = rev.post_id;
          parent = postId;
          setRevisionOf(parent);
        }
        saved = await update.mutateAsync({
          postId: target,
          input: {
            ...payload,
            kind: status === "draft" && parent === null ? kind : undefined,
            // Revisions inherit the live post's audience server-side, so
            // the field stays out of their payload entirely.
            visibility: parent === null ? visibility : undefined,
          },
        });
        if (mode === "publish" && saved.status === "draft") {
          saved = await publish.mutateAsync(target);
        }
      }
      setPostId(saved.post_id);
      setStatus(saved.status);
      if (saved.status === "published") setRevisionOf(null);
      setSavedAt(saved.updated_at ?? new Date().toISOString());
      if (editTick.current === tick) setDirty(false);
      if (saved.status === "published") onPublished?.(saved);
      return saved;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
      return null;
    }
  }

  return {
    postId,
    status,
    revisionOf,
    wasPublished,
    kind,
    visibility,
    title,
    coverId,
    blocks,
    lookup,
    uploads,
    dirty,
    savedAt,
    errorCode,
    focusKey,
    saving:
      create.isPending ||
      update.isPending ||
      publish.isPending ||
      revise.isPending,
    setKind: (next: PostKind) => {
      setKindState(next);
      touch();
    },
    setVisibility: (next: PostVisibility) => {
      setVisibilityState(next);
      touch();
    },
    setTitle: (next: string) => {
      setTitleState(next);
      touch();
    },
    clearError: () => setErrorCode(null),
    patchBlock,
    insertBlock,
    insertMedia,
    replaceMedia,
    removeBlock,
    moveBlock,
    changeCover,
    save,
  };
}

export type ArticleEditorState = ReturnType<typeof useArticleEditor>;
