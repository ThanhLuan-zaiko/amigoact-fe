import type { Metadata } from "next";
import { Suspense } from "react";
import { updateOrganization } from "@/app/_actions/organizations";
import { getHourRule } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { getGallery, getOrganization } from "@/lib/organizationApi";
import HourRuleForm from "../../../../_components/attendance/HourRuleForm";
import DeleteOrganizationPanel from "../../../../_components/organizations/DeleteOrganizationPanel";
import GalleryManager from "../../../../_components/organizations/GalleryManager";
import OrganizationForm from "../../../../_components/organizations/OrganizationForm";
import { mutedText } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Cài đặt tổ chức | AmigoACT" };

async function SettingsContent({
  params,
}: {
  params: PageProps<"/org/[slug]/settings">["params"];
}) {
  const { slug } = await params;
  await requireUser(`/org/${slug}/settings`);
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
  // On wide screens the profile form sits on the left, and the pictures, the hour rule and
  // the danger zone sit on the right. On narrower screens everything stacks in this order.
  // The profile form uses the full width and splits itself into two columns on xl. Below it,
  // the pictures and the hour rule sit side by side, and the danger zone spans the page.
  return (
    <div className="flex w-full flex-col gap-4">
      <OrganizationForm
        action={updateOrganization.bind(null, slug)}
        organization={organization}
      />
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <GalleryManager
          slug={slug}
          items={gallery}
          logoUrl={organization.logo_url}
          coverUrl={organization.cover_url}
        />
        {rule ? <HourRuleForm slug={slug} rule={rule} /> : null}
      </div>
      {organization.viewer.role === "owner" ? (
        <DeleteOrganizationPanel
          slug={slug}
          name={organization.name}
          openActivityCount={organization.open_activity_count}
        />
      ) : null}
    </div>
  );
}

export default function OrganizationSettingsPage({
  params,
}: PageProps<"/org/[slug]/settings">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <SettingsContent params={params} />
    </Suspense>
  );
}
