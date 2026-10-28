import { useState } from "react";
import type { ReactElement } from "react";
import { ApiError } from "../../core/api.ts";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { useUpdateOrg } from "../hooks.ts";
import {
  JOIN_POLICY_LABELS,
  toVietnameseDashboardMessage,
} from "../messages.tsx";
import type { DashboardOrg, JoinPolicy } from "../api.ts";

interface MemberManageActionsProps {
  org: DashboardOrg;
  selfId: string | undefined;
}

const POLICY_OPTIONS = (["invite", "review", "open"] as JoinPolicy[]).map(
  (value) => ({ value, label: JOIN_POLICY_LABELS[value] ?? value }),
);

export function MemberManageActions({
  org,
  selfId,
}: MemberManageActionsProps): ReactElement | null {
  const updateOrg = useUpdateOrg("Đã cập nhật chính sách tham gia.");
  const [serverCode, setServerCode] = useState<string | null>(null);
  const isOwner = org.owner_id === selfId;
  if (!isOwner) return null;

  async function changePolicy(value: string): Promise<void> {
    setServerCode(null);
    try {
      await updateOrg.mutateAsync({
        id: org.id,
        input: {
          name: org.name,
          description: org.description,
          join_policy: value as JoinPolicy,
        },
      });
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <SelectField
        label="Chính sách tham gia"
        value={org.join_policy}
        options={POLICY_OPTIONS}
        disabled={updateOrg.isPending}
        onChange={(value) => void changePolicy(value)}
      />
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
