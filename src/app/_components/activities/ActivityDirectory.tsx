import Form from "next/form";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import { listPublicActivities } from "@/lib/activityApi";
import { pageOffset } from "@/lib/organizations";
import { listQuery } from "@/lib/tagLinks";
import { viewerTimeZone } from "@/lib/viewerTimeZone";
import EmptyState from "../EmptyState";
import PageLinks from "../organizations/PageLinks";
import { iconButton, inputField, mutedText, sectionTitle } from "../ui";
import ActivityCard from "./ActivityCard";

type DirectoryProps = {
  search: string;
  page: string | string[] | undefined;
};

// Every published activity, shown in place of the posts under the home page's
// "Tất cả" tab (?tab=activities). The cross goes back to the feed. The header
// search is the one search box; its words match the title or the city. It
// replaced the former /explore page, which now redirects here.
export default async function ActivityDirectory({
  search,
  page: pageParam,
}: DirectoryProps) {
  const offset = pageOffset(pageParam);
  const page = await listPublicActivities(search, "", offset);
  const timeZone = await viewerTimeZone();
  const path = `/${listQuery({ tab: "activities", q: search })}`;
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className={`${sectionTitle} min-w-0 truncate`}>
          {search ? `Hoạt động: “${search}”` : "Tất cả hoạt động"}
        </h2>
        <Link
          href="/"
          aria-label="Quay lại bảng tin"
          title="Quay lại bảng tin"
          className={iconButton}
        >
          <FiX aria-hidden="true" />
        </Link>
      </div>
      {/* Phones have no header input. Wider screens use the one in the header. */}
      <Form action="/" className="flex gap-2 md:hidden">
        <input type="hidden" name="tab" value="activities" />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Tìm hoạt động, thành phố</span>
          <input
            id="activity-search"
            type="search"
            name="q"
            defaultValue={search}
            maxLength={100}
            placeholder="Tìm hoạt động, thành phố"
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
          title="Chưa có hoạt động nào"
          description={
            search
              ? "Không có hoạt động nào khớp với tìm kiếm."
              : "Các hoạt động sắp diễn ra sẽ hiện ở đây."
          }
        />
      ) : (
        // One column, like the posts of the "Tất cả" tab beside it.
        <div className="flex flex-col gap-3">
          {page.items.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              timeZone={timeZone}
            />
          ))}
        </div>
      )}
      <PageLinks path={path} offset={offset} total={page?.total ?? 0} />
    </section>
  );
}
