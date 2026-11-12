import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiCompass, FiPlus } from "react-icons/fi";
import { getMyOrganizations } from "@/lib/organizationApi";
import { MAX_OWNED_ORGANIZATIONS } from "@/lib/organizations";
import EmptyState from "../../_components/EmptyState";
import OwnedOrganizationCard from "../../_components/organizations/OwnedOrganizationCard";
import { mutedText, primaryButton } from "../../_components/ui";

export const metadata: Metadata = { title: "Tổ chức của tôi | AmigoACT" };

// Only organizations the viewer owns. Finding other organizations is the home
// page's job (the "Tổ chức" tab).
async function OwnedOrganizations() {
  const mine = await getMyOrganizations();
  const owned = mine.filter(({ role }) => role === "owner");

  if (owned.length === 0) {
    return (
      <EmptyState
        title="Bạn chưa sở hữu tổ chức nào"
        description="Tạo tổ chức của riêng bạn, hoặc khám phá các tổ chức khác ở trang chủ."
      />
    );
  }
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <p className={mutedText}>
        {owned.length}/{MAX_OWNED_ORGANIZATIONS} tổ chức
      </p>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {owned.map((organization) => (
          <OwnedOrganizationCard
            key={organization.id}
            organization={organization}
          />
        ))}
      </div>
    </section>
  );
}

export default function OrganizationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Tổ chức của tôi
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/?tab=orgs"
            aria-label="Khám phá tổ chức"
            title="Khám phá tổ chức"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold transition-colors hover:border-teal-700 hover:text-teal-700 dark:border-slate-800 dark:hover:border-teal-400 dark:hover:text-teal-400"
          >
            <FiCompass aria-hidden="true" />
            <span className="hidden sm:inline">Khám phá</span>
          </Link>
          <Link
            href="/organizations/new"
            aria-label="Tạo tổ chức"
            title="Tạo tổ chức"
            className={primaryButton}
          >
            <FiPlus aria-hidden="true" />
            <span className="hidden sm:inline">Tạo tổ chức</span>
          </Link>
        </div>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <OwnedOrganizations />
      </Suspense>
    </div>
  );
}
