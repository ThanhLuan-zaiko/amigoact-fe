import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiArchive,
  FiBookmark,
  FiBookOpen,
  FiEdit2,
  FiEdit3,
  FiRotateCcw,
  FiSend,
  FiTrash2,
  FiXOctagon,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import type { OrgPost } from "../board-api.ts";
import {
  useHardDeletePost,
  usePublishPost,
  useRestorePost,
  useSetPostPinned,
  useSoftDeletePost,
  useUnpublishPost,
} from "../board-hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";

export type ArticleShelf = "published" | "draft" | "trash";

interface ArticleActionsProps {
  orgId: string;
  post: OrgPost;
  selfId?: string;
  canManage: boolean;
  canAnnounce: boolean;
  shelf: ArticleShelf;
  // Runs after any successful lifecycle mutation (read page navigates back).
  onDone?: () => void;
}

// Article lifecycle buttons mirroring the /manage/orgs card actions:
// read/edit links, pin rail, publish/unpublish, soft delete, restore and
// a two-step permanent delete on the trash shelf.
export function ArticleActions({
  orgId,
  post,
  selfId,
  canManage,
  canAnnounce,
  shelf,
  onDone,
}: ArticleActionsProps): ReactElement {
  const publish = usePublishPost(orgId);
  const unpublish = useUnpublishPost(orgId);
  const softDelete = useSoftDeletePost(orgId);
  const hardDelete = useHardDeletePost(orgId);
  const restore = useRestorePost(orgId);
  const pin = useSetPostPinned(orgId);
  const [confirmErase, setConfirmErase] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy =
    publish.isPending ||
    unpublish.isPending ||
    softDelete.isPending ||
    hardDelete.isPending ||
    restore.isPending ||
    pin.isPending;

  const mine = post.author_id === selfId;
  const pinned = post.pinned_at !== null;
  const announceBlocked =
    post.kind === "announcement" && !canAnnounce;
  const writeHref = `/manage/board/write?org=${orgId}&post=${post.post_id}`;
  const readHref = `/manage/board/post?org=${orgId}&post=${post.post_id}`;

  async function run(task: Promise<unknown>): Promise<void> {
    setServerCode(null);
    try {
      await task;
      onDone?.();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {shelf === "published" && (
          <>
            <Button
              to={readHref}
              variant="secondary"
              icon={<FiBookOpen className="h-4 w-4" aria-hidden="true" />}
            >
              Đọc
            </Button>
            {mine && (
              <Button
                to={writeHref}
                variant="secondary"
                icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
              >
                Sửa
              </Button>
            )}
            {canManage && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  run(pin.mutateAsync({ postId: post.post_id, pinned: !pinned }))
                }
                aria-pressed={pinned}
                icon={<FiBookmark className="h-4 w-4" aria-hidden="true" />}
              >
                {pinned ? "Bỏ ghim" : "Ghim"}
              </Button>
            )}
            {mine && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => run(unpublish.mutateAsync(post.post_id))}
                icon={<FiArchive className="h-4 w-4" aria-hidden="true" />}
              >
                {unpublish.isPending ? "Đang chuyển…" : "Về nháp"}
              </Button>
            )}
          </>
        )}
        {shelf === "draft" && (
          <>
            <Button
              to={writeHref}
              variant="primary"
              icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
            >
              Viết tiếp
            </Button>
            {mine && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy || announceBlocked}
                title={
                  announceBlocked
                    ? "Chỉ quản lý mới đăng được thông báo"
                    : undefined
                }
                onClick={() => run(publish.mutateAsync(post.post_id))}
                icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
              >
                {publish.isPending ? "Đang đăng…" : "Đăng bài"}
              </Button>
            )}
          </>
        )}
        {shelf === "trash" && (mine || canManage) && (
          <Button
            type="button"
            variant="primary"
            disabled={busy}
            onClick={() => run(restore.mutateAsync(post.post_id))}
            icon={<FiRotateCcw className="h-4 w-4" aria-hidden="true" />}
          >
            {restore.isPending ? "Đang khôi phục…" : "Khôi phục"}
          </Button>
        )}
        {shelf !== "trash" && (mine || canManage) && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => run(softDelete.mutateAsync(post.post_id))}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          >
            {softDelete.isPending ? "Đang xóa…" : "Xóa"}
          </Button>
        )}
        {shelf === "trash" && (mine || canManage) && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (!confirmErase) {
                setConfirmErase(true);
                return;
              }
              void run(hardDelete.mutateAsync(post.post_id));
            }}
            aria-pressed={confirmErase}
            icon={
              <FiXOctagon
                className="h-4 w-4 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            }
            className={
              confirmErase
                ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                : undefined
            }
          >
            {hardDelete.isPending
              ? "Đang xóa…"
              : confirmErase
                ? "Bấm lại để xóa vĩnh viễn"
                : "Xóa vĩnh viễn"}
          </Button>
        )}
      </div>
      {serverCode !== null && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseWorkspaceMessage(serverCode)}
        />
      )}
    </div>
  );
}
