import { useId, useState } from "react";
import type { ReactElement } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { permissionLabel, roleLabel } from "../messages-roles.tsx";
import type { OrgRole } from "../members-api.ts";
import { ROLE_DOT_CLASS, toRoleColor } from "../role-colors.ts";

interface RoleRowProps {
  role: OrgRole;
  // Edit/delete buttons only render when the viewer may change this role.
  canEdit: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  // Owner-only seniority controls; undefined hides them.
  onMove?: (direction: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

// Compact role row for the narrow rail: permissions stay folded behind a
// disclosure so a long role list scans by name, not by chip count.
export function RoleRow({
  role,
  canEdit,
  busy,
  onEdit,
  onDelete,
  onMove,
  canMoveUp = false,
  canMoveDown = false,
}: RoleRowProps): ReactElement {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const Chevron = expanded ? FiChevronUp : FiChevronDown;

  return (
    <li className="flex flex-col gap-1 py-3 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${ROLE_DOT_CLASS[toRoleColor(role.color)]}`}
          />
          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {role.is_system ? roleLabel("admin") : role.name}
          </p>
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <FiUsers className="mr-1 inline h-3 w-3" aria-hidden="true" />
            {role.member_count}
          </span>
        </div>
        {(canEdit || onMove !== undefined) && (
          <div className="flex flex-wrap gap-1">
            {onMove !== undefined && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || !canMoveUp}
                  onClick={() => onMove(-1)}
                  aria-label={`Nâng cấp bậc vai trò ${role.name}`}
                  icon={<FiArrowUp className="h-4 w-4" aria-hidden="true" />}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy || !canMoveDown}
                  onClick={() => onMove(1)}
                  aria-label={`Hạ cấp bậc vai trò ${role.name}`}
                  icon={<FiArrowDown className="h-4 w-4" aria-hidden="true" />}
                />
              </>
            )}
            {canEdit && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={onEdit}
                  aria-label={`Sửa vai trò ${role.name}`}
                  icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={onDelete}
                  aria-label={`Xóa vai trò ${role.name}`}
                  icon={<FiTrash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
                />
              </>
            )}
          </div>
        )}
      </div>
      {role.description && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{role.description}</p>
      )}
      {role.permissions.length > 0 && (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
            className="flex min-h-[32px] w-fit items-center gap-1 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-400"
          >
            {`${role.permissions.length} quyền`}
            <Chevron className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          {expanded && (
            <ul id={panelId} className="flex flex-wrap gap-1.5">
              {role.permissions.map((code) => (
                <li
                  key={code}
                  className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                >
                  {permissionLabel(code)}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
