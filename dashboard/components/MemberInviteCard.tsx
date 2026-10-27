import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiAtSign, FiCheckCircle, FiSend, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useInviteMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { ADMIN_OPTION, MEMBER_OPTION, customRoleOption } from "../messages-roles.tsx";
import { validateInviteEmail } from "../schemas.ts";
import { canGrantRole, hasPermission } from "../members-utils.ts";
import type { OrgRole } from "../members-api.ts";
import { RoleChoice } from "./RoleChoice.tsx";

interface MemberInviteCardProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
  viewerCeiling: number | null;
  orgRoles: OrgRole[];
  onDone: () => void;
}

export function MemberInviteCard({
  orgId,
  viewerRole,
  viewerPermissions,
  viewerCeiling,
  orgRoles,
  onDone,
}: MemberInviteCardProps): ReactElement {
  const invite = useInviteMember(orgId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(MEMBER_OPTION.key);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Roles the viewer may hand out at invite time: admin stays owner-only;
  // a non-owner needs member:role-assign plus the delegation subset.
  const canAssign = hasPermission(viewerRole, viewerPermissions, "member:role-assign");
  const extras = !canAssign
    ? []
    : [
        ...(viewerRole === "owner" ? [ADMIN_OPTION] : []),
        ...orgRoles
          .filter(
            (item) =>
              !item.is_system &&
              canGrantRole(item, viewerRole, viewerPermissions, viewerCeiling),
          )
          .map(customRoleOption),
      ];

  function changeEmail(value: string): void {
    setEmail(value);
    setSent(false);
    setErrorCode(value.trim() ? validateInviteEmail(value) : null);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateInviteEmail(email);
    setErrorCode(validation);
    setServerCode(null);
    setSent(false);
    if (validation) return;
    try {
      await invite.mutateAsync({ email: email.trim().toLowerCase(), role });
      setEmail("");
      setRole(MEMBER_OPTION.key);
      setSent(true);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {serverCode && (
        <ErrorState title="Không gửi được lời mời" message={toVietnameseDashboardMessage(serverCode)} />
      )}
      {sent && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
        >
          <FiCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {toVietnameseDashboardMessage("INVITE_SENT")}
        </p>
      )}
      <TextField
        label="Email thành viên"
        name={`invite-email-${orgId}`}
        type="email"
        placeholder="ten@example.com"
        value={email}
        onChange={(event) => changeEmail(event.target.value)}
        error={errorCode ? toVietnameseDashboardMessage(errorCode) : undefined}
        hint="Người được mời cần có tài khoản và chấp nhận lời mời."
        icon={<FiAtSign className="h-4 w-4" aria-hidden="true" />}
      />
      {extras.length > 0 ? (
        <div role="radiogroup" aria-label="Vai trò khi tham gia" className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Vai trò khi tham gia
          </p>
          {[MEMBER_OPTION, ...extras].map((option) => (
            <RoleChoice
              key={option.key}
              type="radio"
              name={`invite-role-${orgId}`}
              option={option}
              checked={role === option.key}
              onChange={() => setRole(option.key)}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Người được mời sẽ tham gia với vai trò Thành viên.
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onDone}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          {sent ? "Đóng" : "Hủy"}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={invite.isPending}
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
        >
          {invite.isPending ? "Đang gửi…" : "Gửi lời mời"}
        </Button>
      </div>
    </form>
  );
}
