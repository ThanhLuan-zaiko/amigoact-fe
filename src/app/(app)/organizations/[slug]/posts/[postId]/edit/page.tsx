import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updatePost } from "@/app/_actions/posts";
import { getLinkableActivities } from "@/lib/activityApi";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import { getPostForEdit } from "@/lib/postApi";
import { activityOptions } from "@/lib/postActivity";
import { isPostId, postPath } from "@/lib/posts";
import PostForm from "../../../../../../_components/posts/PostForm";
import { mutedText } from "../../../../../../_components/ui";

export const metadata: Metadata = { title: "Sửa bài viết | AmigoACT" };

type Params = PageProps<"/organizations/[slug]/posts/[postId]/edit">["params"];

async function EditPostContent({ params }: { params: Params }) {
  const { slug, postId } = await params;
  if (!isPostId(postId)) {
    notFound();
  }
  await requireUser(`/organizations/${slug}/posts/${postId}/edit`);
  const [post, organization, activities] = await Promise.all([
    getPostForEdit(postId),
    getOrganization(slug),
    getLinkableActivities(slug),
  ]);
  if (!post || !organization || post.org.slug !== slug) {
    notFound();
  }
  if (!post.viewer?.can_edit) {
    return <p className={mutedText}>Chỉ tác giả mới sửa được bài này.</p>;
  }
  const isDraft = post.status === "draft";

  return (
    <PostForm
      orgSlug={slug}
      activities={activityOptions(activities, post.activity ?? null)}
      action={updatePost.bind(null, slug, postId, isDraft)}
      kinds={[post.kind]}
      organizationName={organization.name}
      cancelHref={isDraft ? `${postPath(slug)}/drafts` : postPath(slug, postId)}
      draftsHref={`${postPath(slug)}/drafts`}
      initial={{
        kind: post.kind,
        visibility: post.visibility,
        title: post.title,
        body: post.body,
        tags: post.tags,
        media: post.media.map(({ id, mime }) => ({ id, mime })),
        activityId: post.activity?.id ?? null,
        isDraft,
      }}
    />
  );
}

export default function EditPostPage({ params }: { params: Params }) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <EditPostContent params={params} />
      </Suspense>
    </div>
  );
}
