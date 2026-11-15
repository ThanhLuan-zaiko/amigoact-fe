import {
  FiArrowDown,
  FiArrowUp,
  FiLock,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { deleteRole, reorderRoles, updateRole } from "@/app/_actions/roles";
import {
  hasPermission,
  movedOrder,
  type RoleInfo,
  type RoleList,
  summarize,
} from "@/lib/roles";
import IconStat from "../IconStat";
import ActionButton from "../organizations/ActionButton";
import { mutedText } from "../ui";
import RoleDot from "./RoleDot";
import RoleForm from "./RoleForm";

type RoleDetailProps = {
  slug: string;
  role: RoleInfo;
  roles: RoleList;
  viewer: { permissions: string[] };
  grantable: string[];
};

// One role in the detail panel: its rank controls, then either the edit form at
// full width or, for a role the viewer may not change, a read-only summary.
export default function RoleDetail({
  slug,
  role,
  roles,
  viewer,
  grantable,
}: RoleDetailProps) {
  const canUpdate = role.below_you && hasPermission(viewer, "roles.update");
  const canDelete = role.below_you && hasPermission(viewer, "roles.delete");
  const up = canUpdate ? movedOrder(roles.items, role.id, "up") : null;
  const down = canUpdate ? movedOrder(roles.items, role.id, "down") : null;
  const lines = summarize(role.permissions);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <RoleDot color={role.color} />
        <h2 className="min-w-0 flex-1 basis-40 truncate text-lg font-bold">
          {role.name}
        </h2>
        <IconStat icon={FiUsers} label="Số thành viên">
          {role.member_count}
        </IconStat>
        <div className="flex flex-wrap items-center gap-2">
          {up ? (
            <ActionButton
              action={reorderRoles.bind(null, slug, up)}
              label="Đưa lên"
            >
              <FiArrowUp aria-hidden="true" />
            </ActionButton>
          ) : null}
          {down ? (
            <ActionButton
              action={reorderRoles.bind(null, slug, down)}
              label="Đưa xuống"
            >
              <FiArrowDown aria-hidden="true" />
            </ActionButton>
          ) : null}
          {canDelete ? (
            <ActionButton
              action={deleteRole.bind(null, slug, role.id)}
              label="Xóa vai trò"
              confirmLabel="Xóa vai trò?"
            >
              <FiTrash2 aria-hidden="true" />
            </ActionButton>
          ) : null}
        </div>
      </header>
      {canUpdate ? (
        <RoleForm
          // A fresh form for each role, so switching roles never keeps old ticks.
          key={role.id}
          action={updateRole.bind(null, slug, role.id)}
          role={role}
          grantable={grantable}
          submitLabel="Lưu thay đổi"
        />
      ) : (
        <>
          <p className={`${mutedText} flex items-center gap-2`}>
            <FiLock aria-hidden="true" className="shrink-0" />
            {role.below_you
              ? "Bạn không có quyền sửa vai trò, nên chỉ xem được."
              : "Vai trò này ngang hoặc cao hơn vai trò của bạn, nên bạn chỉ xem được."}
          </p>
          {lines.length === 0 ? (
            <p className={mutedText}>Chỉ để nhận diện, không có quyền nào.</p>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
              {lines.map((line) => (
                <div key={line.module} className="contents">
                  <dt className="font-semibold text-slate-700 dark:text-slate-300">
                    {line.module}
                  </dt>
                  <dd className={mutedText}>{line.actions.join(", ")}</dd>
                </div>
              ))}
            </dl>
          )}
        </>
      )}
    </div>
  );
}
