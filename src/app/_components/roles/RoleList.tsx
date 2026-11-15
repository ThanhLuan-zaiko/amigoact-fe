import Link from "next/link";
import { FiChevronRight, FiPlus, FiShield, FiUsers } from "react-icons/fi";
import { ADMINISTRATOR, type RoleInfo } from "@/lib/roles";
import { mutedText } from "../ui";
import RoleDot from "./RoleDot";

export const NEW_ROLE = "new";

const row =
  "flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors";
const idle =
  "border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-900";
const active =
  "border-teal-700 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40";
const newIdle =
  "border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900";

// The roles in rank order, one compact row each. Choosing one opens it in the
// detail panel through ?role=, so the page stays server rendered and linkable.
export default function RoleList({
  roles,
  selected,
  canCreate,
}: {
  roles: RoleInfo[];
  selected: string | null;
  canCreate: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      {canCreate ? (
        <Link
          href={`?role=${NEW_ROLE}#role-detail`}
          aria-current={selected === NEW_ROLE ? "page" : undefined}
          className={`${row} border-dashed font-semibold text-teal-700 dark:text-teal-400 ${selected === NEW_ROLE ? active : newIdle}`}
        >
          <FiPlus aria-hidden="true" />
          Vai trò mới
        </Link>
      ) : null}
      {roles.length === 0 ? (
        <p className={mutedText}>Chưa có vai trò nào.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {roles.map((role, index) => {
            const isAdmin = role.permissions.includes(ADMINISTRATOR);
            const current = selected === role.id;
            return (
              <li key={role.id}>
                <Link
                  href={`?role=${role.id}#role-detail`}
                  aria-current={current ? "page" : undefined}
                  className={`${row} ${current ? active : idle}`}
                >
                  <span
                    className={`${mutedText} w-5 shrink-0 text-right tabular-nums`}
                    title="Thứ bậc"
                  >
                    {index + 1}
                  </span>
                  <RoleDot color={role.color} />
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {role.name}
                  </span>
                  {isAdmin ? (
                    <FiShield
                      aria-label="Quản trị viên"
                      className="shrink-0 text-slate-500 dark:text-slate-400"
                    />
                  ) : null}
                  <span
                    className={`${mutedText} inline-flex shrink-0 items-center gap-1 tabular-nums`}
                    title="Số thành viên"
                  >
                    <FiUsers aria-hidden="true" />
                    {role.member_count}
                  </span>
                  <FiChevronRight
                    aria-hidden="true"
                    className="shrink-0 text-slate-400 xl:hidden"
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
