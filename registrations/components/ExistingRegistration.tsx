import type { ReactElement } from "react";
import { FiXCircle } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { Registration } from "../api.ts";
import { REGISTRATION_STATUS_LABELS } from "../messages.tsx";
import { TicketCard } from "./TicketCard.tsx";

// Statuses the applicant may still withdraw from.
const CANCELLABLE = new Set(["pending", "approved", "waitlisted"]);

interface ExistingRegistrationProps {
  activityId: string;
  registration: Registration;
  cancelling: boolean;
  error: string;
  onCancel: () => void;
}

// The signed-in user's current registration: status, review note, ticket and
// the withdraw action.
export function ExistingRegistration({
  activityId,
  registration,
  cancelling,
  error,
  onCancel,
}: ExistingRegistrationProps): ReactElement {
  const label =
    REGISTRATION_STATUS_LABELS[registration.status] ?? registration.status;
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Trạng thái đăng ký của bạn:{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {label}
        </span>
      </p>
      {registration.review_note && (
        <p className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          Ghi chú từ ban tổ chức: {registration.review_note}
        </p>
      )}
      {(registration.status === "approved" ||
        registration.status === "attended") && (
        <TicketCard
          activityId={activityId}
          registrationId={registration.registration_id}
        />
      )}
      {CANCELLABLE.has(registration.status) && (
        <div>
          <Button
            variant="ghost"
            disabled={cancelling}
            onClick={onCancel}
            icon={<FiXCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Hủy đăng ký
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
