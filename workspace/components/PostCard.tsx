import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiBookmark,
  FiEdit2,
  FiMessageCircle,
  FiTrash2,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  useDeletePost,
  useSetPostPinned,
  useUpdatePost,
} from "../hooks.ts";
import type { OrgPost } from "../api.ts";
import {
  formatTime,
  POST_KIND_LABELS,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";
import { CommentThread } from "./CommentThread.tsx";

interface PostCardProps {
  orgId: string;
  post: OrgPost;
  selfId?: string;
  canManage: boolean;
  open: boolean;
  onToggleComments: () => void;
}

// One board post: kind badge, author/time, body, attachments, and the
// author/moderator action row. The comment thread expands under it.
export function PostCard({
  orgId,
  post,
  selfId,
  canManage,
  open,
  onToggleComments,
}: PostCardProps): ReactElement {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [error, setError] = useState<string | null>(null);
  const update = useUpdatePost(orgId);
  const remove = useDeletePost(orgId);
  const pin = useSetPostPinned(orgId);
  const mine = post.author_id === selfId;
  const pinned = post.pinned_at !== null;

  function saveEdit(): void {
    const trimmed = body.trim();
    if (!trimmed) {
      setError(toVietnameseWorkspaceMessage("REQUIRED"));
      return;
    }
    if (post.kind === "announcement" && !title.trim()) {
      setError("Thông báo cần có tiêu đề.");
      return;
    }
    setError(null);
    update.mutate(
      { postId: post.post_id, input: { title: title.trim(), body: trimmed } },
      {
        onSuccess: () => setEditing(false),
        onError: (err) =>
          setError(
            err instanceof ApiError
              ? toVietnameseWorkspaceMessage(err.code)
              : toVietnameseWorkspaceMessage("REQUEST_FAILED"),
          ),
      },
    );
  }

  return (
    <BentoCard className="md:col-span-6 lg:col-span-8">
      <div data-rise className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {post.author_name}
            </p>
            {post.kind === "announcement" && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                {POST_KIND_LABELS[post.kind]}
              </span>
            )}
            {pinned && (
              <FiBookmark
                className="h-4 w-4 text-zinc-900 dark:text-brand"
                aria-label="Bài viết đã ghim"
              />
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {formatTime(post.created_at)}
            {post.edited_at !== null && " · đã chỉnh sửa"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {canManage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() =>
                pin.mutate({ postId: post.post_id, pinned: !pinned })
              }
              aria-label={pinned ? "Bỏ ghim bài viết" : "Ghim bài viết"}
              icon={<FiBookmark className="h-4 w-4" aria-hidden="true" />}
            />
          )}
          {mine && !editing && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditing(true);
                setTitle(post.title);
                setBody(post.body);
              }}
              aria-label="Sửa bài viết"
              icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
            />
          )}
          {(mine || canManage) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove.mutate(post.post_id)}
              aria-label="Xóa bài viết"
              icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
            />
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-3 flex flex-col gap-3">
          {post.kind === "announcement" && (
            <TextField
              label="Tiêu đề"
              name={`edit-title-${post.post_id}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
            />
          )}
          <TextArea
            label="Nội dung"
            name={`edit-body-${post.post_id}`}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={4}
            maxLength={5000}
            error={error ?? undefined}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditing(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={saveEdit}
              disabled={update.isPending}
            >
              {update.isPending ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {post.title && (
            <h3 className="mt-2 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              {post.title}
            </h3>
          )}
          <p className="mt-2 text-sm break-words whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {post.body}
          </p>
          {post.media.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {post.media.map((item) => (
                <img
                  key={item.asset_id}
                  src={item.file_url}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                />
              ))}
            </div>
          )}
        </>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onToggleComments}
          aria-expanded={open}
          icon={<FiMessageCircle className="h-4 w-4" aria-hidden="true" />}
        >
          {post.comment_count > 0
            ? `Bình luận · ${post.comment_count}`
            : "Bình luận"}
        </Button>
      </div>
      {open && (
        <CommentThread
          orgId={orgId}
          postId={post.post_id}
          selfId={selfId}
          canManage={canManage}
        />
      )}
    </BentoCard>
  );
}
