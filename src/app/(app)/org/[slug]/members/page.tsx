import type { Metadata } from "next";
import { Suspense } from "react";
import { FiCalendar, FiUserX } from "react-icons/fi";
import { removeMember } from "@/app/_actions/organizations";
import { requireUser } from "@/lib/auth";
import { getMembers, getOrganization, getRoles } from "@/lib/organizationApi";
import {
  formatDate,
  initials,
  type MemberInfo,
  type OrganizationDetail,
  pageOffset,
  ROLE_LABELS,
} from "@/lib/organizations";
import { orgTopic } from "@/lib/realtime";
import {
  assignableRoles,
  hasPermission,
  type RoleInfo,
  type RoleList,
} from "@/lib/roles";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import PageLinks from "../../../../_components/organizations/PageLinks";
import LiveRefresh from "../../../../_components/realtime/LiveRefresh";
import MemberRolePicker from "../../../../_components/roles/MemberRolePicker";
import RoleDot from "../../../../_components/roles/RoleDot";
import {
  mutedText,
  panel,
  sectionTitle,
  splitList,
  splitRow,
  tagChip,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Thành viên | AmigoACT" };

// Someone joined, left, was removed, or changed role.
const MEMBER_EVENTS = ["members.changed", "roles.changed"] as const;

function MemberActions({
  organization,
  member,
  currentUserId,
  roles,
}: {
  organization: OrganizationDetail;
  member: MemberInfo;
  currentUserId: string;
  roles: RoleList | null;
}) {
  const { slug, viewer } = organization;
  const isOwner = viewer.role === "owner";
  const others = member.role !== "owner" && member.user_id !== currentUserId;
  // Every role of the member sits below the viewer's top role, so the viewer outranks them.
  const below = new Set(
    (roles?.items ?? []).filter((role) => role.below_you).map((r) => r.id),
  );
  const outranks = isOwner || member.roles.every((role) => below.has(role.id));
  const assignable: RoleInfo[] = roles ? assignableRoles(roles.items) : [];
  const canAssign =
    others &&
    outranks &&
    hasPermission(viewer, "roles.assign") &&
    assignable.length > 0;
  const canRemove =
    others && outranks && hasPermission(viewer, "members.remove");

  return (
    <div className="flex flex-wrap items-start gap-2">
      {canAssign ? (
        <MemberRolePicker
          slug={slug}
          userId={member.user_id}
          roles={assignable}
          held={member.roles}
        />
      ) : null}
      {canRemove ? (
        <ActionButton
          action={removeMember.bind(null, slug, member.user_id)}
          label="Xóa khỏi tổ chức"
          confirmLabel="Xóa khỏi tổ chức?"
        >
          <FiUserX aria-hidden="true" />
        </ActionButton>
      ) : null}
    </div>
  );
}

function MemberRoles({ member }: { member: MemberInfo }) {
  if (member.role === "owner" || member.roles.length === 0) {
    return <span className={tagChip}>{ROLE_LABELS[member.role]}</span>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {member.roles.map((role) => (
        <li key={role.id} className={`${tagChip} gap-1.5`}>
          <RoleDot color={role.color} />
          {role.name}
        </li>
      ))}
    </ul>
  );
}

async function MemberList({
  params,
  searchParams,
}: PageProps<"/org/[slug]/members">) {
  const { slug } = await params;
  const offset = pageOffset((await searchParams).page);
  const user = await requireUser(`/org/${slug}/members`);
  const [organization, page, roles] = await Promise.all([
    getOrganization(slug),
    getMembers(slug, offset),
    getRoles(slug),
  ]);
  if (!organization) {
    return null;
  }
  if (!page) {
    return (
      <p className={mutedText}>Chỉ thành viên mới xem được danh sách này.</p>
    );
  }

  return (
    <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <LiveRefresh topic={orgTopic(organization.id)} types={MEMBER_EVENTS} />
      <h2 className={sectionTitle}>Thành viên</h2>
      <ul className={splitList}>
        {page.items.map((member) => (
          <li
            key={member.user_id}
            className={`flex flex-wrap items-center gap-3 py-3 ${splitRow}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
              {initials(member.full_name)}
            </div>
            <div className="min-w-0 flex-1 basis-40">
              <p className="truncate text-sm font-semibold">
                {member.full_name}
              </p>
              <IconStat icon={FiCalendar} label="Ngày tham gia">
                {formatDate(member.joined_at)}
              </IconStat>
            </div>
            <MemberRoles member={member} />
            <MemberActions
              organization={organization}
              member={member}
              currentUserId={user.id}
              roles={roles}
            />
          </li>
        ))}
      </ul>
      <PageLinks
        path={`/org/${slug}/members`}
        offset={offset}
        total={page.total}
      />
    </section>
  );
}

export default function MembersPage(props: PageProps<"/org/[slug]/members">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <MemberList {...props} />
    </Suspense>
  );
}
