import type { Metadata } from "next";
import { Suspense } from "react";
import { FiCalendar, FiShield, FiShieldOff, FiUserX } from "react-icons/fi";
import { removeMember, setMemberRole } from "@/app/_actions/organizations";
import { requireUser } from "@/lib/auth";
import { getMembers, getOrganization } from "@/lib/organizationApi";
import {
  formatDate,
  initials,
  type MemberInfo,
  type OrganizationDetail,
  pageOffset,
  ROLE_LABELS,
} from "@/lib/organizations";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import PageLinks from "../../../../_components/organizations/PageLinks";
import {
  mutedText,
  panel,
  sectionTitle,
  splitList,
  splitRow,
  tagChip,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Thành viên | AmigoACT" };

function MemberActions({
  organization,
  member,
  currentUserId,
}: {
  organization: OrganizationDetail;
  member: MemberInfo;
  currentUserId: string;
}) {
  const { slug, viewer } = organization;
  const isOwner = viewer.role === "owner";
  const canRemove =
    viewer.can_manage &&
    member.role !== "owner" &&
    member.user_id !== currentUserId &&
    (isOwner || member.role === "member");
  const canChangeRole = isOwner && member.role !== "owner";

  return (
    <div className="flex flex-wrap items-start gap-2">
      {canChangeRole ? (
        <ActionButton
          action={setMemberRole.bind(
            null,
            slug,
            member.user_id,
            member.role === "admin" ? "member" : "admin",
          )}
          label={
            member.role === "admin" ? "Bỏ quyền quản trị" : "Đặt làm quản trị"
          }
        >
          {member.role === "admin" ? (
            <FiShieldOff aria-hidden="true" />
          ) : (
            <FiShield aria-hidden="true" />
          )}
        </ActionButton>
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

async function MemberList({
  params,
  searchParams,
}: PageProps<"/org/[slug]/members">) {
  const { slug } = await params;
  const offset = pageOffset((await searchParams).page);
  const user = await requireUser(`/org/${slug}/members`);
  const [organization, page] = await Promise.all([
    getOrganization(slug),
    getMembers(slug, offset),
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
            <span className={tagChip}>{ROLE_LABELS[member.role]}</span>
            <MemberActions
              organization={organization}
              member={member}
              currentUserId={user.id}
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
