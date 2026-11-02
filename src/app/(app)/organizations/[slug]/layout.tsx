import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOrganization } from "@/lib/organizationApi";
import OrgHeader from "../../../_components/OrgHeader";
import { mutedText } from "../../../_components/ui";

async function OrganizationHeader({
  params,
}: {
  params: LayoutProps<"/organizations/[slug]">["params"];
}) {
  const { slug } = await params;
  const organization = await getOrganization(slug);
  if (!organization) {
    notFound();
  }
  return <OrgHeader organization={organization} />;
}

export default function OrganizationLayout({
  params,
  children,
}: LayoutProps<"/organizations/[slug]">) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <OrganizationHeader params={params} />
      </Suspense>
      {children}
    </div>
  );
}
