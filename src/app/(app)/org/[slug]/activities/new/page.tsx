import type { Metadata } from "next";
import { Suspense } from "react";
import { createActivity } from "@/app/_actions/activities";
import { requireUser } from "@/lib/auth";
import { getOrganization } from "@/lib/organizationApi";
import { hasPermission } from "@/lib/roles";
import ActivityForm from "../../../../../_components/activities/ActivityForm";
import { mutedText } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Tạo hoạt động | AmigoACT" };

async function NewActivityContent({
  params,
}: {
  params: PageProps<"/org/[slug]/activities/new">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/org/${slug}/activities/new`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!hasPermission(organization.viewer, "activities.create")) {
    return (
      <p className={mutedText}>Chỉ ban quản trị mới tạo được hoạt động.</p>
    );
  }
  return (
    <ActivityForm action={createActivity.bind(null, slug)} orgSlug={slug} />
  );
}

export default function NewActivityPage({
  params,
}: PageProps<"/org/[slug]/activities/new">) {
  return (
    <div className="w-full">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <NewActivityContent params={params} />
      </Suspense>
    </div>
  );
}
