import type { Metadata } from "next";
import Form from "next/form";
import { Suspense } from "react";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { listPublicActivities } from "@/lib/activityApi";
import { pageOffset } from "@/lib/organizations";
import ActivityCard from "../../_components/activities/ActivityCard";
import EmptyState from "../../_components/EmptyState";
import PageLinks from "../../_components/organizations/PageLinks";
import { iconButton, inputField, mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Khám phá | AmigoACT" };

type SearchParams = PageProps<"/explore">["searchParams"];

function firstValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

async function ActivityResults({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = firstValue(params.q);
  const city = firstValue(params.city);
  const offset = pageOffset(params.page);
  const page = await listPublicActivities(search, city, offset);
  const query = new URLSearchParams();
  if (search) {
    query.set("q", search);
  }
  if (city) {
    query.set("city", city);
  }
  const path = query.size > 0 ? `/explore?${query}` : "/explore";

  return (
    <>
      <Form action="/explore" className="flex flex-wrap gap-2">
        <label className="min-w-0 flex-1 basis-48">
          <span className="sr-only">Tìm hoạt động</span>
          <input
            type="search"
            name="q"
            defaultValue={search}
            maxLength={100}
            placeholder="Tìm hoạt động"
            className={inputField}
          />
        </label>
        <label className="relative min-w-0 flex-1 basis-32">
          <span className="sr-only">Thành phố</span>
          <FiMapPin
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            name="city"
            defaultValue={city}
            maxLength={100}
            placeholder="Thành phố"
            className={`${inputField} pl-9`}
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
          title="Chưa có hoạt động nào"
          description={
            search || city
              ? "Không có hoạt động nào khớp với tìm kiếm."
              : "Các hoạt động sắp diễn ra sẽ hiện ở đây."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {page.items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}
      <PageLinks path={path} offset={offset} total={page?.total ?? 0} />
    </>
  );
}

export default function ExplorePage({ searchParams }: PageProps<"/explore">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Khám phá</h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <ActivityResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
