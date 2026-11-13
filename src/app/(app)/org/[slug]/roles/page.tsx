import type { Metadata } from "next";
import { Suspense } from "react";
import { FiPlus, FiTag } from "react-icons/fi";
import { createRole } from "@/app/_actions/roles";
import { requireUser } from "@/lib/auth";
import { getOrganization, getRoles } from "@/lib/organizationApi";
import { orgTopic } from "@/lib/realtime";
import { hasPermission } from "@/lib/roles";
import LiveRefresh from "../../../../_components/realtime/LiveRefresh";
import RoleForm from "../../../../_components/roles/RoleForm";
import RoleRow from "../../../../_components/roles/RoleRow";
import { mutedText, panel, sectionTitle } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Vai trò | AmigoACT" };

// A role was created, edited, moved, or deleted, or someone was given one.
const ROLE_EVENTS = ["roles.changed", "members.changed"] as const;

async function RolesContent({
  params,
}: {
  params: PageProps<"/org/[slug]/roles">["params"];
}) {
  const { slug } = await params;
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

  return (
    <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <LiveRefresh topic={orgTopic(organization.id)} types={ROLE_EVENTS} />
      <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
        <h2 className={`${sectionTitle} flex items-center gap-2`}>
          <FiTag aria-hidden="true" />
          Vai trò
        </h2>
        <p className={mutedText}>
          Vai trò ở trên có thứ bậc cao hơn. Chủ sở hữu đứng trên mọi vai trò.
        </p>
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {roles.items.map((role) => (
            <RoleRow
              key={role.id}
              slug={slug}
              role={role}
              roles={roles}
              viewer={viewer}
              grantable={grantable}
            />
          ))}
        </ul>
      </section>
      {canCreate ? (
        <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
          <h2 className={`${sectionTitle} flex items-center gap-2`}>
            <FiPlus aria-hidden="true" />
            Vai trò mới
          </h2>
          <p className={mutedText}>
            Vai trò mới nằm ở dưới cùng. Kéo lên bằng nút mũi tên khi cần.
          </p>
          <RoleForm
            action={createRole.bind(null, slug)}
            grantable={grantable}
            submitLabel="Tạo vai trò"
          />
        </section>
      ) : null}
    </div>
  );
}

export default function RolesPage({ params }: PageProps<"/org/[slug]/roles">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <RolesContent params={params} />
    </Suspense>
  );
}
