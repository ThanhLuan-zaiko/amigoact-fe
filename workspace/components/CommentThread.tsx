import { useState } from "react";
import type { ReactElement } from "react";
import { FiMessageCircle, FiSend, FiTrash2 } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { useAddComment, useComments, useDeleteComment } from "../hooks.ts";
import type { OrgComment } from "../api.ts";
import type { BoardAbilities } from "../board-abilities.tsx";
import { formatTime, toVietnameseWorkspaceMessage } from "../messages.tsx";

interface CommentThreadProps {
  orgId: string;
  postId: string;
  selfId?: string;
  abilities: BoardAbilities;
}

// Oldest-first thread under one post: paged history, inline composer,
// author-or-moderator deletes. Realtime invalidations land via the board
// subscription on posts:{orgId}.
export function CommentThread({
  orgId,
  postId,
  selfId,
  abilities,
}: CommentThreadProps): ReactElement {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const comments = useComments(orgId, postId, true);
  const add = useAddComment(orgId, postId);
  const remove = useDeleteComment(orgId, postId);

  const pages = comments.data?.pages ?? [];
  const items = pages.flatMap((page) => page.items);

  function submit(): void {
    const body = draft.trim();
    if (!body) return;
    setError(null);
    add.mutate(body, {
      onSuccess: () => setDraft(""),
      onError: (err) =>
        setError(
          err instanceof ApiError
            ? toVietnameseWorkspaceMessage(err.code)
            : toVietnameseWorkspaceMessage("REQUEST_FAILED"),
        ),
    });
  }

  function canDelete(comment: OrgComment): boolean {
    return comment.author_id === selfId || abilities.deleteComment;
  }

  return (
    <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        <FiMessageCircle className="h-4 w-4" aria-hidden="true" />
        Bình luận
      </p>
      {comments.isPending && <LoadingState label="Đang tải bình luận…" />}
      {comments.isError && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {toVietnameseWorkspaceMessage(
            comments.error instanceof ApiError
              ? comments.error.code
              : "REQUEST_FAILED",
          )}
        </p>
      )}
      <ul className="mt-2 flex flex-col gap-2">
        {items.map((comment) => (
          <li
            key={comment.comment_id}
            className="flex items-start justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                {comment.author_name}
                <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                  {formatTime(comment.created_at)}
                </span>
              </p>
              <p className="mt-1 text-sm break-words whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                {comment.body}
              </p>
            </div>
            {canDelete(comment) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(comment.comment_id)}
                aria-label="Xóa bình luận"
                icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
              />
            )}
          </li>
        ))}
      </ul>
      {comments.hasNextPage && (
        <div className="mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void comments.fetchNextPage()}
            disabled={comments.isFetchingNextPage}
          >
            {comments.isFetchingNextPage ? "Đang tải…" : "Xem thêm bình luận"}
          </Button>
        </div>
      )}
      {abilities.comment ? (
        <div className="mt-3 flex flex-col gap-2">
          <TextArea
            label="Viết bình luận"
            name={`comment-${postId}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Viết bình luận…"
            maxLength={2000}
            rows={2}
            autoGrow
            error={error ?? undefined}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              onClick={submit}
              disabled={add.isPending || !draft.trim()}
              icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
            >
              Gửi
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Bạn chưa có quyền bình luận trong tổ chức này.
        </p>
      )}
    </div>
  );
}
