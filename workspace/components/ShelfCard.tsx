import type { BoardAbilities } from "../board-abilities.tsx";
import type { ReactElement } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { FiEdit3, FiTrash2 } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import type { PostPage } from "../board-api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ArticleRow } from "./ArticleRow.tsx";
import type { ArticleShelf } from "./ArticleActions.tsx";

interface ShelfCardProps {
  orgId: string;
  selfId?: string;
  abilities: BoardAbilities;
  shelf: Exclude<ArticleShelf, "published">;
  query: UseQueryResult<PostPage, ApiError>;
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

const EMPTY_COPY: Record<string, { title: string; message: string }> = {
  draft: {
    title: "Chưa có bản nháp",
    message: "Lưu nháp khi viết dở để tiếp tục hoàn thiện bất cứ lúc nào.",
  },
  trash: {
    title: "Thùng rác trống",
    message: "Bài viết đã xóa sẽ nằm ở đây trước khi bị xóa vĩnh viễn.",
  },
};

const TITLES: Record<string, { title: string; hint: string }> = {
  draft: {
    title: "Bản nháp của tôi",
    hint: "Nháp mới, nháp chờ đăng của bài đang hiển thị và bài đã gỡ xuống — chỉ bạn thấy.",
  },
  trash: {
    title: "Thùng rác",
    hint: "Khôi phục để đưa bài viết trở lại, hoặc xóa vĩnh viễn.",
  },
};

// Drafts/trash shelf card: header copy, paged ArticleRow list, and the
// shared loading/error/empty feedback states.
export function ShelfCard({
  orgId,
  selfId,
  abilities,
  shelf,
  query,
  page,
  totalPages,
  onPage,
}: ShelfCardProps): ReactElement {
  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const copy = EMPTY_COPY[shelf];
  const head = TITLES[shelf];
  const icon =
    shelf === "trash" ? (
      <FiTrash2 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
    ) : (
      <FiEdit3 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
    );

  return (
    <Section>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          {head.title}
        </h2>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{head.hint}</p>
      <div className="mt-3" aria-live="polite" aria-busy={query.isPending}>
        {query.isPending && <LoadingState label="Đang tải danh sách…" />}
        {query.isError && (
          <ErrorState
            title="Không tải được danh sách"
            message={toVietnameseWorkspaceMessage(
              query.error instanceof ApiError
                ? query.error.code
                : "REQUEST_FAILED",
            )}
            actionLabel="Thử lại"
            onAction={() => void query.refetch()}
          />
        )}
        {query.data !== undefined && items.length === 0 && (
          <>
            <EmptyState title={copy.title} message={copy.message} />
          </>
        )}
        {items.length > 0 && (
          <>
            <ul className="flex flex-col gap-3">
              {items.map((post) => (
                <ArticleRow
                  key={post.post_id}
                  orgId={orgId}
                  post={post}
                  selfId={selfId}
                  abilities={abilities}
                  shelf={shelf}
                />
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {`Trang ${page} / ${totalPages} · ${total} bài`}
                </p>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPage={onPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Section>
  );
}
