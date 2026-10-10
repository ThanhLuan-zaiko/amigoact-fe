import type { ReactElement } from "react";
import { FiLock, FiUnlock } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { JOIN_POLICY_LABELS } from "../messages.tsx";
import type { JoinPolicy } from "../api.ts";

interface OrgPolicyChipsProps {
  value: JoinPolicy;
  onChange: (policy: JoinPolicy) => void;
}

export function OrgPolicyChips({ value, onChange }: OrgPolicyChipsProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Chính sách tham gia</p>
      <div role="group" aria-label="Chính sách tham gia" className="flex flex-wrap gap-2">
        {(["invite", "open"] as const).map((policy) => (
          <Button
            key={policy}
            type="button"
            variant={value === policy ? "primary" : "secondary"}
            onClick={() => onChange(policy)}
            aria-pressed={value === policy}
            icon={
              policy === "open" ? (
                <FiUnlock className="h-4 w-4" aria-hidden="true" />
              ) : (
                <FiLock className="h-4 w-4" aria-hidden="true" />
              )
            }
          >
            {JOIN_POLICY_LABELS[policy]}
          </Button>
        ))}
      </div>
    </div>
  );
}
