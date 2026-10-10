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

interface MemberInviteCardProps {
  orgId: string;
  canAssignAdmin: boolean;
  onDone: () => void;
}

export function MemberInviteCard({
  orgId,
  canAssignAdmin,
  onDone,
}: MemberInviteCardProps): ReactElement {
  const invite = useInviteMember(orgId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
          className="flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 p-3 text-sm text-zinc-900 dark:border-brand/30 dark:bg-brand/10 dark:text-zinc-100"
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
      {canAssignAdmin && (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Vai trò</p>
          <div role="group" aria-label="Chọn vai trò" className="flex flex-wrap gap-2">
            {(["member", "admin"] as const).map((key) => (
              <Button
                key={key}
                type="button"
                variant={role === key ? "primary" : "secondary"}
                onClick={() => setRole(key)}
                aria-pressed={role === key}
                icon={
                  key === "admin" ? (
                    <FiShield className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <FiUser className="h-4 w-4" aria-hidden="true" />
                  )
                }
              >
                {MEMBER_ROLE_LABELS[key]}
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
