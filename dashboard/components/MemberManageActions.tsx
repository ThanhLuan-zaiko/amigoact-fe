import { useState } from "react";
import type { ReactElement } from "react";
import { FiLock, FiUnlock, FiUserPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { useUpdateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardOrg } from "../api.ts";

interface MemberManageActionsProps {
  org: DashboardOrg;
  selfId: string | undefined;
  canInvite: boolean;
  inviting: boolean;
  onToggleInvite: () => void;
}

export function MemberManageActions({
  org,
  selfId,
  canInvite,
  inviting,
  onToggleInvite,
}: MemberManageActionsProps): ReactElement | null {
  const updateOrg = useUpdateOrg();
  const [serverCode, setServerCode] = useState<string | null>(null);
  const isOwner = org.owner_id === selfId;
  if (!isOwner && !canInvite) return null;

  async function togglePolicy(): Promise<void> {
    if (!isOwner) return;
    setServerCode(null);
    try {
      await updateOrg.mutateAsync({
        id: org.id,
        input: {
          name: org.name,
          description: org.description,
          join_policy: org.join_policy === "open" ? "invite" : "open",
        },
      });
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {isOwner && (
          <Button
            type="button"
            variant="secondary"
            disabled={updateOrg.isPending}
            onClick={() => void togglePolicy()}
            icon={
              org.join_policy === "open" ? (
                <FiUnlock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <FiLock className="h-4 w-4" aria-hidden="true" />
              )
            }
          >
            {org.join_policy === "open" ? "Đang mở — chuyển chỉ mời" : "Đang chỉ mời — mở gia nhập"}
          </Button>
        )}
        {canInvite && (
          <Button
            type="button"
            variant={inviting ? "primary" : "secondary"}
            onClick={onToggleInvite}
            aria-pressed={inviting}
            icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Mời
          </Button>
        )}
      </div>
      {serverCode && (
        <div aria-live="polite">
          <ErrorState
            title="Không đổi được chính sách"
            message={toVietnameseDashboardMessage(serverCode)}
          />
        </div>
      )}
    </div>
  );
}
