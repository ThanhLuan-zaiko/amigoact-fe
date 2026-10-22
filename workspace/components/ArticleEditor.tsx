import { useEffect, useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { FiImage } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { UnsavedGuard } from "../../core/components/UnsavedGuard.tsx";
import type { OrgPost } from "../board-api.ts";
import { useArticleEditor } from "../editor-hooks.ts";
import { BlockEditor } from "./BlockEditor.tsx";
import { BlockInserter } from "./BlockInserter.tsx";
import { PublishPanel } from "./PublishPanel.tsx";

interface ArticleEditorProps {
  orgId: string;
  initial: OrgPost | null;
  canAnnounce: boolean;
  onPublished: (post: OrgPost) => void;
}

function dragHasFiles(event: DragEvent): boolean {
  return event.dataTransfer.types.includes("Files");
}

// Split a dropped file set into the two media families, keeping the
// original order inside each one; unknown types ride the image lane and
// insertMedia's own filter does the strict validation.
function partitionFiles(files: File[]): { images: File[]; videos: File[] } {
  const images: File[] = [];
  const videos: File[] = [];
  for (const file of files) {
    const type = file.type.split(";")[0].trim().toLowerCase();
    if (type.startsWith("video/")) videos.push(file);
    else if (type === "" || type.startsWith("image/")) images.push(file);
  }
  return { images, videos };
}

// Two-column writing desk: the article body (title + block list with
// insert seams) on the left, the publish rail on the right. The body is
// also a drop zone: files dropped on a seam land at that index, on a
// block they insert before/after it by cursor height, and a single file
// on a media block of the same family replaces its asset.
export function ArticleEditor({
  orgId,
  initial,
  canAnnounce,
  onPublished,
}: ArticleEditorProps): ReactElement {
  const editor = useArticleEditor(orgId, initial, onPublished, canAnnounce);
  const uploading = Object.values(editor.uploads).includes("uploading");
  const [dropActive, setDropActive] = useState(false);

  // The browser's default for a stray file drop is navigating the tab to
  // it; cancel that page-wide so a miss outside the zone can't lose the
  // draft (UnsavedGuard alone can't stop a same-tab file navigation).
  useEffect(() => {
    const cancel = (event: globalThis.DragEvent) => {
      if (event.dataTransfer?.types.includes("Files")) {
        event.preventDefault();
      }
    };
    window.addEventListener("dragover", cancel);
    window.addEventListener("drop", cancel);
    return () => {
      window.removeEventListener("dragover", cancel);
      window.removeEventListener("drop", cancel);
    };
  }, []);

  function handleDrop(event: DragEvent<HTMLDivElement>): void {
    if (!dragHasFiles(event)) return;
    event.preventDefault();
    setDropActive(false);
    const { images, videos } = partitionFiles(
      Array.from(event.dataTransfer.files),
    );
    const dropped = images.length + videos.length;
    if (dropped === 0) return;
    const zone = (event.target as HTMLElement).closest(
      "[data-media-key],[data-insert-index],[data-block-index]",
    );
    const mediaKey = zone?.getAttribute("data-media-key");
    const mediaType = zone?.getAttribute("data-media-type");
    const file = images[0] ?? videos[0];
    const family = images.length === 1 ? "image" : "video";
    if (
      dropped === 1 &&
      file !== undefined &&
      mediaKey !== null &&
      mediaKey !== undefined &&
      mediaType === family
    ) {
      void editor.replaceMedia(mediaKey, file);
      return;
    }
    let index = editor.blocks.length;
    if (zone?.hasAttribute("data-insert-index") === true) {
      index = Number(zone.getAttribute("data-insert-index"));
    } else {
      const blockZone =
        zone?.hasAttribute("data-block-index") === true
          ? zone
          : zone?.closest("[data-block-index]");
      if (blockZone != null) {
        const rect = blockZone.getBoundingClientRect();
        const base = Number(blockZone.getAttribute("data-block-index"));
        index = event.clientY < rect.top + rect.height / 2 ? base : base + 1;
      }
    }
    if (images.length > 0) void editor.insertMedia(index, "image", images);
    if (videos.length > 0) {
      void editor.insertMedia(index + images.length, "video", videos);
    }
  }

  return (
    <>
      {/* save() resets dirty on success, so the guard is already off by
          the time onPublished navigates away. */}
      <UnsavedGuard active={editor.dirty || uploading} />
      <Section>
        <div
          className="relative"
          onDragEnter={(event) => {
            if (dragHasFiles(event)) {
              event.preventDefault();
              setDropActive(true);
            }
          }}
          onDragLeave={(event) => {
            if (!dragHasFiles(event)) return;
            const next = event.relatedTarget;
            if (next instanceof Node && event.currentTarget.contains(next)) {
              return;
            }
            setDropActive(false);
          }}
          onDragOver={(event) => {
            if (dragHasFiles(event)) {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }
          }}
          onDrop={handleDrop}
        >
          <div>
            <TextField
              label="Tiêu đề bài viết"
              name="article-title"
              value={editor.title}
              onChange={(event) => editor.setTitle(event.target.value)}
              placeholder="Tiêu đề thu hút người đọc…"
              maxLength={200}
            />
          </div>
          <div
            className="mt-4 flex flex-col gap-3"
            aria-label="Nội dung bài viết"
          >
            <BlockInserter
              index={0}
              onInsert={editor.insertBlock}
              onMedia={(index, family, files) =>
                void editor.insertMedia(index, family, files)
              }
            />
            {editor.blocks.map((block, index) => (
              <div
                key={block.key}
                data-block-index={index}
                className="flex flex-col gap-3"
              >
                <BlockEditor
                  block={block}
                  index={index}
                  total={editor.blocks.length}
                  lookup={editor.lookup}
                  upload={editor.uploads[block.key]}
                  focused={editor.focusKey === block.key}
                  onPatch={editor.patchBlock}
                  onReplaceMedia={(key, file) => void editor.replaceMedia(key, file)}
                  onMove={editor.moveBlock}
                  onRemove={editor.removeBlock}
                />
                <BlockInserter
                  index={index + 1}
                  onInsert={editor.insertBlock}
                  onMedia={(at, family, files) =>
                    void editor.insertMedia(at, family, files)
                  }
                />
              </div>
            ))}
          </div>
          {dropActive && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-zinc-400 bg-white/80 dark:border-zinc-500 dark:bg-zinc-950/80"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                <FiImage className="h-5 w-5" aria-hidden="true" />
                Thả ảnh hoặc video để chèn vào bài viết
              </p>
            </div>
          )}
        </div>
      </Section>
      <PublishPanel editor={editor} orgId={orgId} canAnnounce={canAnnounce} />
    </>
  );
}
