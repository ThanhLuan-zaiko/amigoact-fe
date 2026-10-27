import { useState, type ReactElement } from "react";
import { useLocation } from "react-router-dom";
import {
  FiCheckCircle,
  FiLogIn,
  FiSend,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useSession } from "../../auth/hooks.ts";
import { loginPath } from "../../auth/next-path.ts";
import { useRegistrationForm } from "../../activities/hooks.ts";
import { useSlots } from "../../activities/slots-hooks.ts";
import {
  useApply,
  useCancelRegistration,
  useMyRegistrations,
} from "../hooks.ts";
import { applyOutcomeCopy, toRegistrationFailure } from "../messages.tsx";
import { ExistingRegistration } from "./ExistingRegistration.tsx";
import { FormFields } from "./FormFields.tsx";
import { SlotPicker } from "./SlotPicker.tsx";

interface ApplyCardProps {
  orgId: string;
  activityId: string;
  activityStatus: string;
  // The card's view of the registration window; undefined until it loads.
  registrationOpen?: boolean;
}

// Registration panel on the event detail page: a login prompt for guests,
// the caller's own registration, or the apply form.
export function ApplyCard({
  orgId,
  activityId,
  activityStatus,
  registrationOpen,
}: ApplyCardProps): ReactElement {
  // Only events that take sign-ups fetch the form and the slots. A closed
  // registration window overrules the status.
  const applyable =
    (activityStatus === "published" || activityStatus === "ongoing") &&
    registrationOpen !== false;
  const session = useSession();
  const location = useLocation();
  const mine = useMyRegistrations(session.data != null);
  const apply = useApply(activityId);
  const cancel = useCancelRegistration();
  const form = useRegistrationForm(orgId, activityId, applyable);
  const slots = useSlots(orgId, activityId, applyable);
  const [note, setNote] = useState("");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  if (!session.data) {
    return (
      <div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Đăng nhập để đăng ký tham gia hoạt động này.
        </p>
        <div className="mt-3">
          <Button
            to={loginPath(`${location.pathname}${location.search}`)}
            icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  const existing = (mine.data ?? []).find(
    (r) => r.activity_id === activityId,
  );
  const slotList = slots.data ?? [];

  const onApply = async (): Promise<void> => {
    setError("");
    try {
      await apply.mutateAsync({
        note: note.trim() || undefined,
        formData:
          (form.data?.length ?? 0) > 0 ? answers : undefined,
        slotId: slotId ?? undefined,
      });
    } catch (err) {
      setError(toRegistrationFailure(err));
    }
  };

  const onCancel = async (): Promise<void> => {
    if (!existing) return;
    setError("");
    try {
      await cancel.mutateAsync({
        activityId,
        registrationId: existing.registration_id,
      });
    } catch (err) {
      setError(toRegistrationFailure(err));
    }
  };

  if (existing && existing.status !== "cancelled") {
    return (
      <ExistingRegistration
        activityId={activityId}
        registration={existing}
        cancelling={cancel.isPending}
        error={error}
        onCancel={() => void onCancel()}
      />
    );
  }

  if (!applyable) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Hoạt động này hiện không nhận đăng ký.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {existing?.status === "cancelled" && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Bạn đã hủy đăng ký trước đó — có thể đăng ký lại.
        </p>
      )}
      <TextField
        label="Lời nhắn (không bắt buộc)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Giới thiệu ngắn về bạn…"
        maxLength={500}
      />
      {slotList.length > 0 && (
        <SlotPicker
          slots={slotList}
          value={slotId}
          onChange={setSlotId}
        />
      )}
      {form.data && form.data.length > 0 && (
        <FormFields
          questions={form.data}
          answers={answers}
          onChange={(qid, v) =>
            setAnswers((prev) => ({ ...prev, [qid]: v }))
          }
        />
      )}
      <div>
        <Button
          disabled={apply.isPending}
          onClick={() => void onApply()}
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
        >
          {apply.isPending ? "Đang gửi…" : "Đăng ký tham gia"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {apply.isSuccess && (
        <p
          role="status"
          className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
        >
          <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
          {applyOutcomeCopy(apply.data?.status)}
        </p>
      )}
    </div>
  );
}
