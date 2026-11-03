import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import {
  getDeletedOrganizations,
  getMyOrganizations,
  listOtherOrganizations,
} from "@/lib/organizationApi";
import {
  MAX_OWNED_ORGANIZATIONS,
  type MyOrganization,
  pageOffset,
} from "@/lib/organizations";
import DeletedOrganizations from "../../_components/organizations/DeletedOrganizations";
import OrganizationCard from "../../_components/organizations/OrganizationCard";
import OwnedOrganizationCard from "../../_components/organizations/OwnedOrganizationCard";
import PageLinks from "../../_components/organizations/PageLinks";
import {
  iconButton,
  inputField,
  mutedText,
  primaryButton,
  sectionTitle,
} from "../../_components/ui";

export const metadata: Metadata = { title: "Tổ chức | AmigoACT" };

type SearchParams = PageProps<"/organizations">["searchParams"];

function firstValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function OwnedOrganizations({
  organizations,
}: {
  organizations: MyOrganization[];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className={sectionTitle}>Tổ chức của tôi</h2>
        <span className={mutedText}>
          {organizations.length}/{MAX_OWNED_ORGANIZATIONS}
        </span>
      </div>
      {organizations.map((organization) => (
        <OwnedOrganizationCard
          key={organization.id}
          organization={organization}
        />
      ))}
    </section>
  );
}

async function OrganizationsContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = firstValue(params.q);
  const offset = pageOffset(params.page);
  const [page, mine, deleted] = await Promise.all([
    listOtherOrganizations(search, offset),
    getMyOrganizations(),
    getDeletedOrganizations(),
  ]);
  const owned = mine.filter(({ role }) => role === "owner");
  // The side column shows when the viewer owns something or has something in the trash.
  const sideShown = owned.length > 0 || deleted.length > 0;
  const others = page?.items ?? [];
  const path = search
    ? `/organizations?q=${encodeURIComponent(search)}`
    : "/organizations";

  return (
    <div
      className={
        sideShown
          ? "grid grid-cols-1 items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]"
          : "grid grid-cols-1"
      }
    >
      {sideShown ? (
        <aside className="flex min-w-0 flex-col gap-8">
          {owned.length > 0 ? (
            <OwnedOrganizations organizations={owned} />
          ) : null}
          {deleted.length > 0 ? (
            <DeletedOrganizations organizations={deleted} />
          ) : null}
        </aside>
      ) : null}
      <section className="flex min-w-0 flex-col gap-3">
        <h2 className={sectionTitle}>Khám phá tổ chức</h2>
        {/* Phones have no header input. Wider screens use the one in the header. */}
        <Form action="/organizations" className="flex gap-2 md:hidden">
          <label className="min-w-0 flex-1">
            <span className="sr-only">Tìm tổ chức</span>
            <input
              id="org-search"
              type="search"
              name="q"
              defaultValue={search}
              maxLength={100}
              placeholder="Tìm tổ chức"
              className={inputField}
            />
          </label>
          <button
            type="submit"
            aria-label="Tìm"
            title="Tìm"
            className={iconButton}
          >
            <FiSearch aria-hidden="true" />
          </button>
        </Form>
        {page === null ? (
          <p className={mutedText}>
            Không tải được danh sách. Vui lòng thử lại.
          </p>
        ) : others.length === 0 ? (
          <p className={`${mutedText} py-4`}>
            {search
              ? "Không có tổ chức nào khác khớp với từ khóa này."
              : "Chưa có tổ chức nào khác."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {others.map((organization) => (
              <OrganizationCard
                key={organization.id}
                organization={organization}
              />
            ))}
          </div>
        )}
        <PageLinks path={path} offset={offset} total={page?.total ?? 0} />
      </section>
    </div>
  );
}

export default function OrganizationsPage({
  searchParams,
}: PageProps<"/organizations">) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Tổ chức</h1>
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
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <OrganizationsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
