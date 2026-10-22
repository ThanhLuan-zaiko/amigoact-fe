import type { ReactElement } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiImage,
  FiMessageCircle,
  FiUser,
} from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { Pagination } from "../core/components/Pagination.tsx";
import { orgMediaUrl, type PublicOrgPost } from "./api.ts";
import {
  ORG_NEWS_PAGE_SIZE,
  usePublicOrg,
  usePublicOrgPosts,
} from "./hooks.ts";
import { toVietnameseOrgsMessage } from "./messages.tsx";

// Guest listing of every published announcement of one org
// (/orgs/:slug/posts); cards link to the public reader at
// /orgs/:slug/posts/:postId. Page number lives in ?page= for deep links.
export function OrgNewsPage(): ReactElement {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const org = usePublicOrg(slug);
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const posts = usePublicOrgPosts(slug, page);
  const profileHref = `/orgs/${slug ?? ""}`;
  const totalPages =
    posts.data === undefined
      ? 0
      : Math.ceil(posts.data.total / ORG_NEWS_PAGE_SIZE);

  const setPage = (n: number): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (n > 1) next.set("page", String(n));
      else next.delete("page");
      return next;
    });
  };

  return (
    <>
      <Section>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            {org.data === undefined
              ? "Tin tức từ tổ chức"
              : `Tin tức từ ${org.data.name}`}
          </h1>
          <Button
            to={profileHref}
            variant="secondary"
            icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Về trang tổ chức
          </Button>
        </div>
      </Section>
      {posts.isPending && (
        <div>
          <LoadingState label="Đang tải tin tức…" />
        </div>
      )}
      {posts.isError && (
        <div>
          <ErrorState
            title="Không tải được tin tức"
            message={toVietnameseOrgsMessage(
              posts.error instanceof ApiError
                ? posts.error.code
                : "REQUEST_FAILED",
            )}
            actionLabel="Thử lại"
            onAction={() => void posts.refetch()}
          />
        </div>
      )}
      {posts.data !== undefined && posts.data.total === 0 && (
        <div>
          <EmptyState
            title="Chưa có tin tức"
            message="Tổ chức chưa đăng thông báo nào trên AmigoACT."
          />
        </div>
      )}
      {posts.data !== undefined &&
        posts.data.items.length > 0 &&
        posts.data.items.map((post) => (
          <NewsCard key={post.id} slug={slug ?? ""} post={post} />
        ))}
      {posts.data !== undefined && totalPages > 1 && (
        <Section>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {`Trang ${page} / ${totalPages} · ${posts.data.total} tin tức`}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPage={setPage}
            />
          </div>
        </Section>
      )}
    </>
  );
}

function NewsCard({
  slug,
  post,
}: {
  slug: string;
  post: PublicOrgPost;
}): ReactElement {
  return (
    <Section className="relative transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 ">
      <div className="flex h-full flex-col">
        {post.cover_url !== null ? (
          <img
            src={orgMediaUrl(post.cover_url)}
            alt=""
            loading="lazy"
            className="aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500">
            <FiImage className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <h2 className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
          {post.title}
        </h2>
        {post.excerpt !== "" && (
          <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {post.excerpt}
          </p>
        )}
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {post.published_at !== null && (
            <span className="flex items-center gap-1">
              <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
              {new Date(post.published_at).toLocaleDateString("vi-VN")}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1">
            <FiMessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {post.comment_count}
          </span>
        </p>
      </div>
      <Link
        to={`/orgs/${slug}/posts/${post.id}`}
        aria-label={post.title}
        className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
      />
    </Section>
  );
}
