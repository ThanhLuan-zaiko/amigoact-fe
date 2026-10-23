import type { ReactElement } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { FiHash, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { Section } from "../../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import type { PostKind, PostPage } from "../board-api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ArticleCard } from "./ArticleCard.tsx";
import { KindFilterCard } from "./KindFilterCard.tsx";

const FULL_ROW = " ";

interface FeedShelfProps {
  orgId: string;
  selfId?: string;
  canManage: boolean;
  canAnnounce: boolean;
  feed: UseQueryResult<PostPage, ApiError>;
  kind: PostKind | undefined;
  onKind: (kind: PostKind | undefined) => void;
  tagSlug?: string;
  tagName?: string;
  onClearTag: () => void;
  onClearFilters: () => void;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

// Published tab content: the pinned feature rail (page 1 only), a filter
// tile flowing in the same feed column, then the magazine-style article
// cards with numbered pagination and shared loading/error/empty states.
export function FeedShelf({
  orgId,
  selfId,
  canManage,
  canAnnounce,
  feed,
  kind,
  onKind,
  tagSlug,
  tagName,
  onClearTag,
  onClearFilters,
  page,
  totalPages,
  onPage,
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
      {tagSlug !== undefined && (
        <Section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="inline-flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              <FiHash className="h-4 w-4" aria-hidden="true" />
              {`Đang lọc theo thẻ #${tagName ?? tagSlug}`}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={onClearTag}
              icon={<FiX className="h-4 w-4" aria-hidden="true" />}
            >
              Bỏ lọc
            </Button>
          </div>
        </Section>
      )}
      {(!empty || kind !== undefined || tagSlug !== undefined) && page === 1 && (
        <KindFilterCard kind={kind} onKind={onKind} />
      )}
      {empty && kind === undefined && tagSlug === undefined && (
        <Section>
          <EmptyState
            title="Chưa có bài viết nào"
            message="Bảng tin đang trống. Hãy viết bài đầu tiên cho tổ chức."
          />
        </Section>
      )}
      {empty && (kind !== undefined || tagSlug !== undefined) && (
        <Section>
          <EmptyState
            title={
              tagSlug !== undefined
                ? "Không có bài viết gắn thẻ này"
                : "Không có bài viết phù hợp"
            }
            message={
              tagSlug !== undefined
                ? "Thẻ này chưa gắn với bài viết nào trên bảng tin."
                : "Thử chọn loại bài khác để xem toàn bộ bảng tin."
            }
            actionLabel="Xem tất cả"
            onAction={onClearFilters}
          />
        </Section>
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
