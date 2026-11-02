import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { getMyOrganizations, listOrganizations } from "@/lib/organizationApi";
import { parseOffset, ROLE_LABELS } from "@/lib/organizations";
import EmptyState from "../../_components/EmptyState";
import OrganizationCard from "../../_components/organizations/OrganizationCard";
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

async function MyOrganizations() {
  const organizations = await getMyOrganizations();
  if (organizations.length === 0) {
    return null;
  }
  return (
    <section className="flex flex-col gap-3">
      <h2 className={sectionTitle}>Tổ chức của bạn</h2>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {organizations.map((organization) => (
          <OrganizationCard
            key={organization.id}
            organization={organization}
            badge={
              organization.role ? ROLE_LABELS[organization.role] : "Chờ duyệt"
            }
          />
        ))}
      </div>
    </section>
  );
}

async function Directory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const search = firstValue(params.q);
  const offset = parseOffset(params.offset);
  const page = await listOrganizations(search, offset);
  const path = search
    ? `/organizations?q=${encodeURIComponent(search)}`
    : "/organizations";

  return (
    <section className="flex flex-col gap-3">
      <h2 className={sectionTitle}>Khám phá tổ chức</h2>
      <Form action="/organizations" className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Tìm theo tên tổ chức</span>
          <input
            type="search"
            name="q"
            defaultValue={search}
            maxLength={100}
            placeholder="Tìm theo tên tổ chức"
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
        <p className={mutedText}>Không tải được danh sách. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title="Chưa có tổ chức nào"
          description={
            search
              ? "Không có tổ chức nào khớp với từ khóa này."
              : "Hãy là người đầu tiên tạo tổ chức."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {page.items.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
            />
          ))}
        </div>
      )}
      <PageLinks
        path={path}
        offset={offset}
        nextOffset={page?.next_offset ?? null}
      />
    </section>
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
      <Suspense fallback={null}>
        <MyOrganizations />
      </Suspense>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <Directory searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
