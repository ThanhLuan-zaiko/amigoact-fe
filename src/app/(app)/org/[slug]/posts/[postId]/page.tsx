import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getAccessToken } from "@/lib/auth";
import { pickPostSideTab, postSideTabs } from "@/lib/postActivity";
import { getPost } from "@/lib/postApi";
import { isPostId } from "@/lib/posts";
import { viewerTimeZone } from "@/lib/viewerTimeZone";
import PostCard from "../../../../../_components/PostCard";
import CommentSection from "../../../../../_components/posts/CommentSection";
import OrgOtherPosts from "../../../../../_components/posts/OrgOtherPosts";
import PostActions from "../../../../../_components/posts/PostActions";
import PostActivityPanel from "../../../../../_components/posts/PostActivityPanel";
import PostSideTabs from "../../../../../_components/posts/PostSideTabs";
import { mutedText, panel } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Bài viết | AmigoACT" };

type Props = PageProps<"/org/[slug]/posts/[postId]">;

// The post on one side and, from xl, a panel of tabs on the other: its activity,
// the comments, and the organization's other posts. Phones stack the panel under
// the post. The panel stays in view below the sticky organization row.
async function PostContent({ params, searchParams }: Props) {
  const [{ slug, postId }, query] = await Promise.all([params, searchParams]);
  if (!isPostId(postId)) {
    notFound();
  }
  const [post, token, timeZone] = await Promise.all([
    getPost(postId),
    getAccessToken(),
    viewerTimeZone(),
  ]);
  // A post of another organization under this address is treated as missing.
  if (!post || post.slug !== slug) {
    notFound();
  }
  // The open tab and the sign-up button depend on the current time
  // (canSignUp), so the post renders per request.
  await connection();
  const draft = post.status === "draft";
  const tabs = postSideTabs(post.activity);
  const tab = pickPostSideTab(
    typeof query.tab === "string" ? query.tab : null,
    post.activity,
  );

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <PostCard
        post={post}
        linked={false}
        showActivity={draft}
        actions={<PostActions post={post} />}
        timeZone={timeZone}
      />
      {draft ? (
        <p className={mutedText}>
          Đây là bản nháp, chỉ bạn nhìn thấy. Đăng bài để mọi người bình luận.
        </p>
      ) : (
        <section
          className={`${panel} overflow-hidden xl:sticky xl:top-40 xl:max-h-[calc(100dvh-11rem)] xl:overflow-y-auto`}
        >
          <PostSideTabs
            tabs={tabs}
            current={tab}
            commentCount={post.commentCount}
          />
          {tab === "activity" && post.activity ? (
            <PostActivityPanel
              activity={post.activity}
              postPictureUrls={(post.media ?? []).map((item) => item.src)}
              timeZone={timeZone}
            />
          ) : tab === "posts" ? (
            <Suspense
              fallback={<p className={`${mutedText} p-4`}>Đang tải…</p>}
            >
              <OrgOtherPosts slug={slug} postId={postId} />
            </Suspense>
          ) : (
            <Suspense
              fallback={
                <p className={`${mutedText} p-4`}>Đang tải bình luận…</p>
              }
            >
              <CommentSection
                slug={slug}
                postId={postId}
                canComment={post.viewer.can_comment}
                signedIn={Boolean(token)}
              />
            </Suspense>
          )}
        </section>
      )}
    </div>
  );
}

export default function PostPage(props: Props) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <PostContent {...props} />
    </Suspense>
  );
}
