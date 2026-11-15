import type { Metadata } from "next";
import { Suspense } from "react";
import { FiPlus, FiTag } from "react-icons/fi";
import { createRole } from "@/app/_actions/roles";
import { requireUser } from "@/lib/auth";
import { getOrganization, getRoles } from "@/lib/organizationApi";
import { orgTopic } from "@/lib/realtime";
import { hasPermission } from "@/lib/roles";
import LiveRefresh from "../../../../_components/realtime/LiveRefresh";
import RoleDetail from "../../../../_components/roles/RoleDetail";
import RoleForm from "../../../../_components/roles/RoleForm";
import RoleList, { NEW_ROLE } from "../../../../_components/roles/RoleList";
import { mutedText, panel, sectionTitle } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Vai trò | AmigoACT" };

// A role was created, edited, moved, or deleted, or someone was given one.
const ROLE_EVENTS = ["roles.changed", "members.changed"] as const;

type Props = PageProps<"/org/[slug]/roles">;

// List and detail: the roles in rank order on one side, the chosen role (or the
// new role form) on the other with the full width for its permissions. Phones
// and tablets show the list first and the detail under it.
async function RolesContent({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  await requireUser(`/org/${slug}/roles`);
  const [organization, roles] = await Promise.all([
    getOrganization(slug),
    getRoles(slug),
  ]);
  if (!organization) {
    return null;
  }
  if (!roles) {
    return (
      <p className={mutedText}>Chỉ thành viên mới xem được danh sách này.</p>
    );
  }
  const { viewer } = organization;
  const canCreate = hasPermission(viewer, "roles.create");
  // Nobody hands out a permission they do not hold. The owner holds all of them.
  const grantable = roles.catalog.filter((code) => hasPermission(viewer, code));
  const wanted = typeof query.role === "string" ? query.role : null;
  const creating = canCreate && wanted === NEW_ROLE;
  const role = creating
    ? null
    : (roles.items.find((item) => item.id === wanted) ??
      roles.items[0] ??
      null);
  const selected = creating ? NEW_ROLE : (role?.id ?? null);

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <LiveRefresh topic={orgTopic(organization.id)} types={ROLE_EVENTS} />
      <section
        className={`${panel} flex flex-col gap-3 p-4 sm:p-5 xl:sticky xl:top-20`}
      >
        <h2 className={`${sectionTitle} flex items-center gap-2`}>
          <FiTag aria-hidden="true" />
          Vai trò
        </h2>
        <p className={mutedText}>
          Xếp theo thứ bậc, cao nhất ở trên. Chủ sở hữu đứng trên mọi vai trò.
        </p>
        <RoleList
          roles={roles.items}
          selected={selected}
          canCreate={canCreate}
        />
      </section>
      <section
        id="role-detail"
        className={`${panel} flex scroll-mt-20 flex-col gap-4 p-4 sm:p-6`}
      >
        {creating ? (
          <>
            <h2 className="flex items-center gap-2 border-b border-slate-200 pb-4 text-lg font-bold dark:border-slate-800">
              <FiPlus aria-hidden="true" />
              Vai trò mới
            </h2>
            <p className={mutedText}>
              Vai trò mới nằm ở cuối danh sách. Đưa lên bằng nút mũi tên khi
              cần.
            </p>
            <RoleForm
              action={createRole.bind(null, slug)}
              grantable={grantable}
              submitLabel="Tạo vai trò"
            />
          </>
        ) : role ? (
          <RoleDetail
            slug={slug}
            role={role}
            roles={roles}
            viewer={viewer}
            grantable={grantable}
          />
        ) : (
          <p className={mutedText}>Chọn hoặc tạo một vai trò.</p>
        )}
      </section>
    </div>
  );
}

export default function RolesPage(props: Props) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <RolesContent {...props} />
    </Suspense>
  );
}
