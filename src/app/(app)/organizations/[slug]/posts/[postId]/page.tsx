import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAccessToken } from "@/lib/auth";
import { getPost } from "@/lib/postApi";
import { isPostId } from "@/lib/posts";
import PostCard from "../../../../../_components/PostCard";
import CommentSection from "../../../../../_components/posts/CommentSection";
import PostActions from "../../../../../_components/posts/PostActions";
import { mutedText } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Bài viết | AmigoACT" };

type Params = PageProps<"/organizations/[slug]/posts/[postId]">["params"];

async function PostContent({ params }: { params: Params }) {
  const { slug, postId } = await params;
  if (!isPostId(postId)) {
    notFound();
  }
  const [post, token] = await Promise.all([getPost(postId), getAccessToken()]);
  // A post of another organization under this address is treated as missing.
  if (!post || post.slug !== slug) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <PostCard
        post={post}
        linked={false}
        actions={<PostActions post={post} />}
      />
      {post.status === "draft" ? (
        <p className={mutedText}>
          Đây là bản nháp, chỉ bạn nhìn thấy. Đăng bài để mọi người bình luận.
        </p>
      ) : (
        <Suspense fallback={<p className={mutedText}>Đang tải bình luận…</p>}>
          <CommentSection
            slug={slug}
            postId={postId}
            canComment={post.viewer.can_comment}
            signedIn={Boolean(token)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default function PostPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <PostContent params={params} />
    </Suspense>
  );
}
