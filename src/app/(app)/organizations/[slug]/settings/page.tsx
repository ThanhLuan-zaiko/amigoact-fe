import type { Metadata } from "next";
import { Suspense } from "react";
import { updateOrganization } from "@/app/_actions/organizations";
import { getHourRule } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { getGallery, getOrganization } from "@/lib/organizationApi";
import HourRuleForm from "../../../../_components/attendance/HourRuleForm";
import GalleryManager from "../../../../_components/organizations/GalleryManager";
import OrganizationForm from "../../../../_components/organizations/OrganizationForm";
import { mutedText } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Cài đặt tổ chức | AmigoACT" };

async function SettingsContent({
  params,
}: {
  params: PageProps<"/organizations/[slug]/settings">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/organizations/${slug}/settings`);
  const organization = await getOrganization(slug);
  if (!organization) {
    return null;
  }
  if (!organization.viewer.can_manage) {
    return <p className={mutedText}>Chỉ ban quản trị mới sửa được tổ chức.</p>;
  }
  const [rule, gallery] = await Promise.all([
    getHourRule(slug),
    getGallery(slug),
  ]);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <OrganizationForm
        action={updateOrganization.bind(null, slug)}
        organization={organization}
      />
      <GalleryManager slug={slug} items={gallery} />
      {rule ? <HourRuleForm slug={slug} rule={rule} /> : null}
    </div>
  );
}

export default function OrganizationSettingsPage({
  params,
}: PageProps<"/organizations/[slug]/settings">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <SettingsContent params={params} />
    </Suspense>
  );
}
