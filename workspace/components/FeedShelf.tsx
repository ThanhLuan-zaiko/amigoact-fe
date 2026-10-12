import type { ReactElement } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import type { PostKind, PostPage } from "../board-api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ArticleCard } from "./ArticleCard.tsx";
import { DeskCard } from "./DeskCard.tsx";
import { KindFilterCard } from "./KindFilterCard.tsx";

const FULL_ROW = "col-span-1 md:col-span-6 lg:col-span-12";

interface FeedShelfProps {
  orgId: string;
  selfId?: string;
  canManage: boolean;
  canAnnounce: boolean;
  feed: UseQueryResult<PostPage, ApiError>;
  kind: PostKind | undefined;
  onKind: (kind: PostKind | undefined) => void;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  writeHref: string;
}

// Published tab content: the pinned feature rail (page 1 only), a filter
// tile flowing in the same bento grid, then the magazine-style article
// cards with numbered pagination and shared loading/error/empty states.
export function FeedShelf({
  orgId,
  selfId,
  canManage,
  canAnnounce,
  feed,
  kind,
  onKind,
  page,
  totalPages,
  onPage,
  writeHref,
}: FeedShelfProps): ReactElement {
  const pinned = feed.data?.pinned ?? [];
  const pinnedIds = new Set(pinned.map((post) => post.post_id));
  const items = (feed.data?.items ?? []).filter(
    (post) => !pinnedIds.has(post.post_id),
  );
  const total = feed.data?.total ?? 0;
  const empty = pinned.length === 0 && items.length === 0 && total === 0;

  if (feed.isPending) {
    return (
      <div className={FULL_ROW}>
        <LoadingState label="Đang tải bảng tin…" />
      </div>
    );
  }
  if (feed.isError) {
    return (
      <div className={FULL_ROW}>
        <ErrorState
          title="Không tải được bảng tin"
          message={toVietnameseWorkspaceMessage(
            feed.error instanceof ApiError
              ? feed.error.code
              : "REQUEST_FAILED",
          )}
          actionLabel="Thử lại"
          onAction={() => void feed.refetch()}
        />
      </div>
    );
  }
  return (
    <>
      {pinned.map((post) => (
        <ArticleCard
          key={post.post_id}
          orgId={orgId}
          post={post}
          selfId={selfId}
          canManage={canManage}
          canAnnounce={canAnnounce}
          featured
        />
      ))}
      {(!empty || kind !== undefined) && page === 1 && (
        <KindFilterCard kind={kind} onKind={onKind} />
      )}
      {empty && kind === undefined && (
        <>
          <BentoCard className="md:col-span-6 lg:col-span-8">
            <EmptyState
              title="Chưa có bài viết nào"
              message="Bảng tin đang trống. Hãy viết bài đầu tiên cho tổ chức."
            />
          </BentoCard>
          <DeskCard writeHref={writeHref} />
        </>
      )}
      {empty && kind !== undefined && (
        <BentoCard className="md:col-span-6 lg:col-span-8">
          <EmptyState
            title="Không có bài viết phù hợp"
            message="Thử chọn loại bài khác để xem toàn bộ bảng tin."
            actionLabel="Xem tất cả"
            onAction={() => onKind(undefined)}
          />
        </BentoCard>
      )}
      {items.map((post) => (
        <ArticleCard
          key={post.post_id}
          orgId={orgId}
          post={post}
          selfId={selfId}
          canManage={canManage}
          canAnnounce={canAnnounce}
        />
      ))}
      {totalPages > 1 && (
        <div className={`${FULL_ROW} flex flex-wrap items-center justify-between gap-2`}>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {`Trang ${page} / ${totalPages} · ${total} bài viết`}
          </p>
          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </div>
      )}
    </>
  );
}
