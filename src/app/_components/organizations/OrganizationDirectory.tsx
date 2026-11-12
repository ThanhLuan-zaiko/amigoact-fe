import Form from "next/form";
import { FiSearch } from "react-icons/fi";
import { listOtherOrganizations } from "@/lib/organizationApi";
import { pageOffset } from "@/lib/organizations";
import { listQuery } from "@/lib/tagLinks";
import { iconButton, inputField, mutedText } from "../ui";
import OrganizationCard from "./OrganizationCard";
import PageLinks from "./PageLinks";

type DirectoryProps = {
  search: string;
  page: string | string[] | undefined;
};

// The home page's "Tổ chức" tab: every organization the viewer does not own.
// The viewer's own organizations live on /organizations.
export default async function OrganizationDirectory({
  search,
  page: pageParam,
}: DirectoryProps) {
  const offset = pageOffset(pageParam);
  const page = await listOtherOrganizations(search, offset);
  const others = page?.items ?? [];
  const path = `/${listQuery({ tab: "orgs", q: search })}`;
  return (
    <section className="flex min-w-0 flex-col gap-3">
      {/* Phones have no header input. Wider screens use the one in the header. */}
      <Form action="/" className="flex gap-2 md:hidden">
        <input type="hidden" name="tab" value="orgs" />
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
        <p className={mutedText}>Không tải được danh sách. Vui lòng thử lại.</p>
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
  );
}
