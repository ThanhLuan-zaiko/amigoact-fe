import { useState } from "react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  publishBlockReason,
  type BoardAbilities,
} from "../board-abilities.tsx";
import type { OrgPost } from "../board-api.ts";
import {
  useCreateRevision,
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
  abilities: BoardAbilities;
  shelf: ArticleShelf;
  // Runs after any successful lifecycle mutation (read page navigates back).
  onDone?: () => void;
}

// Article lifecycle buttons mirroring /manage/orgs: read/edit links, pin
// rail, publish/unpublish, soft delete, restore, two-step hard delete.
// Editing a live post opens its private revision draft; live stays up.
export function ArticleActions({
  orgId,
  post,
  selfId,
  abilities,
  shelf,
  onDone,
}: ArticleActionsProps): ReactElement {
  const publish = usePublishPost(orgId);
  const unpublish = useUnpublishPost(orgId);
  const softDelete = useSoftDeletePost(orgId);
  const hardDelete = useHardDeletePost(orgId);
  const restore = useRestorePost(orgId);
  const pin = useSetPostPinned(orgId);
  const revise = useCreateRevision(orgId);
  const navigate = useNavigate();
  const [confirmErase, setConfirmErase] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy = [publish, unpublish, softDelete, hardDelete, restore, pin, revise]
    .some((mutation) => mutation.isPending);
  const mine = post.author_id === selfId;
  const pinned = post.pinned_at !== null;
  // Own posts need post:create; other people's need the "-any" codes.
  const canDelete = mine ? abilities.create : abilities.deleteAny;
  const publishTitle = publishBlockReason(abilities, post);
  const writeHref = `/manage/board/write?org=${orgId}&post=${post.post_id}`;
  const readHref = `/manage/board/post?org=${orgId}&post=${post.post_id}`;
  // Runs a mutation, then `after` (defaults to the parent's onDone).
  async function run(
    task: Promise<unknown>,
    after: (result: never) => void = () => onDone?.(),
  ): Promise<void> {
    setServerCode(null);
    try {
      after((await task) as never);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  const openRevision = () =>
    run(revise.mutateAsync(post.post_id), (rev: OrgPost) =>
      navigate(`/manage/board/write?org=${orgId}&post=${rev.post_id}`),
    );
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
            {mine && abilities.create && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void openRevision()}
                icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
              >
                {revise.isPending ? "Đang mở…" : "Sửa"}
              </Button>
            )}
            {!mine && abilities.editAny && (
              <Button
                to={writeHref}
                variant="secondary"
                icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
              >
                Sửa
              </Button>
            )}
            {abilities.pin && (
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
            {mine && abilities.create && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => run(unpublish.mutateAsync(post.post_id))}
                icon={<FiArchive className="h-4 w-4" aria-hidden="true" />}
              >
                {unpublish.isPending ? "Đang gỡ…" : "Gỡ xuống"}
              </Button>
            )}
          </>
        )}
        {shelf === "draft" && (
          <>
            {abilities.create && (
              <Button
                to={writeHref}
                variant="primary"
                icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
              >
                Viết tiếp
              </Button>
            )}
            {mine && abilities.create && (
              <Button
                type="button"
                variant="secondary"
                disabled={busy || publishTitle !== undefined}
                title={publishTitle}
                onClick={() => run(publish.mutateAsync(post.post_id))}
                icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
              >
                {publish.isPending
                  ? "Đang đăng…"
                  : post.revision_of !== null
                    ? "Đăng lại"
                    : "Đăng bài"}
              </Button>
            )}
          </>
        )}
        {shelf === "trash" && canDelete && (
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
        {shelf !== "trash" && canDelete && (
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={() => run(softDelete.mutateAsync(post.post_id))}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          >
            {softDelete.isPending ? "Đang xóa…" : "Bỏ vào thùng rác"}
          </Button>
        )}
        {shelf === "trash" && canDelete && (
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
