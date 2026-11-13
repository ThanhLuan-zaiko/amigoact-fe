import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
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

type RoleRowProps = {
  slug: string;
  role: RoleInfo;
  roles: RoleList;
  viewer: { permissions: string[] };
  grantable: string[];
};

// One role: its name, members and permissions, with edit, move and delete for those who may.
export default function RoleRow({
  slug,
  role,
  roles,
  viewer,
  grantable,
}: RoleRowProps) {
  const canUpdate = role.below_you && hasPermission(viewer, "roles.update");
  const canDelete = role.below_you && hasPermission(viewer, "roles.delete");
  const up = canUpdate ? movedOrder(roles.items, role.id, "up") : null;
  const down = canUpdate ? movedOrder(roles.items, role.id, "down") : null;
  const lines = summarize(role.permissions);

  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <RoleDot color={role.color} />
        <p className="min-w-0 flex-1 basis-32 truncate text-sm font-semibold">
          {role.name}
        </p>
        <IconStat icon={FiUsers} label="Số thành viên">
          {role.member_count}
        </IconStat>
        <div className="flex flex-wrap items-start gap-2">
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
      </div>
      {lines.length === 0 ? (
        <p className={mutedText}>Chỉ để nhận diện, không có quyền nào.</p>
      ) : (
        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
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
      {canUpdate ? (
        <details className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
          <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <FiEdit2 aria-hidden="true" />
            Sửa vai trò
          </summary>
          <div className="pt-4">
            <RoleForm
              action={updateRole.bind(null, slug, role.id)}
              role={role}
              grantable={grantable}
              submitLabel="Lưu"
            />
          </div>
        </details>
      ) : null}
    </li>
  );
}
