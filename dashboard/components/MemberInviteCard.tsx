import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiAtSign, FiCheckCircle, FiSend, FiShield, FiUser, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useInviteMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage, MEMBER_ROLE_LABELS } from "../messages.tsx";
import { validateInviteEmail } from "../schemas.ts";
import { canGrantRole } from "../members-utils.ts";
import type { OrgRole } from "../members-api.ts";

interface MemberInviteCardProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  onDone: () => void;
}

export function MemberInviteCard({
  orgId,
  viewerRole,
  viewerPermissions,
  orgRoles,
  onDone,
}: MemberInviteCardProps): ReactElement {
  const invite = useInviteMember(orgId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const isOwner = viewerRole === "owner";
  // Roles the viewer may hand out at invite time: admin stays owner-only;
  // a non-owner needs member:role-assign plus the delegation subset.
  const canAssign = isOwner || viewerPermissions.includes("member:role-assign");
  const choices = !canAssign
    ? []
    : [
        ...(isOwner ? ["admin"] : []),
        ...orgRoles
          .filter(
            (item) =>
              !item.is_system &&
              canGrantRole(item, viewerRole, viewerPermissions),
          )
          .map((item) => item.name),
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
      setRole("member");
      setSent(true);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      {serverCode && (
        <ErrorState title="Không gửi được lời mời" message={toVietnameseDashboardMessage(serverCode)} />
      )}
      {sent && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
      {choices.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Vai trò</p>
          <div role="group" aria-label="Chọn vai trò" className="flex flex-wrap gap-2">
            {["member", ...choices].map((key) => (
              <Button
                key={key}
                type="button"
                variant={role === key ? "primary" : "secondary"}
                onClick={() => setRole(key)}
                aria-pressed={role === key}
                icon={
                  key === "member" ? (
                    <FiUser className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FiShield className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {MEMBER_ROLE_LABELS[key] ?? key}
              </Button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={invite.isPending}
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
        >
          {invite.isPending ? "Đang gửi…" : "Gửi lời mời"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onDone}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          Đóng
        </Button>
      </div>
    </form>
  );
}
