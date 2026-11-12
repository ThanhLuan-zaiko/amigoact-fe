import type { Metadata } from "next";
import { Suspense } from "react";
import { createPost } from "@/app/_actions/posts";
import { getLinkableActivities } from "@/lib/activityApi";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import { activityOptions } from "@/lib/postActivity";
import { postKinds, postPath } from "@/lib/posts";
import PostForm from "../../../../../_components/posts/PostForm";
import { mutedText } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Tạo bài viết | AmigoACT" };

async function NewPostContent({
  params,
}: {
  params: PageProps<"/org/[slug]/posts/new">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/org/${slug}/posts/new`);
  const [organization, activities] = await Promise.all([
    getOrganization(slug),
    getLinkableActivities(slug),
  ]);
  if (!organization) {
    return null;
  }
  if (organization.viewer.status !== "active") {
    return (
      <p className={mutedText}>
        Chỉ thành viên của tổ chức mới đăng bài được. Hãy tham gia tổ chức
        trước.
      </p>
    );
  }
  return (
    <PostForm
      orgSlug={slug}
      activities={activityOptions(activities)}
      action={createPost.bind(null, slug)}
      kinds={postKinds(organization.viewer.can_manage)}
      organizationName={organization.name}
      cancelHref={postPath(slug)}
      draftsHref={`${postPath(slug)}/drafts`}
    />
  );
}

export default function NewPostPage({
  params,
}: PageProps<"/org/[slug]/posts/new">) {
  return (
    <div className="w-full max-w-3xl">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <NewPostContent params={params} />
      </Suspense>
    </div>
  );
}
