import { useState, type ReactElement } from "react";
import {
  FiCheckCircle,
  FiLogIn,
  FiSend,
  FiXCircle,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useSession } from "../../auth/hooks.ts";
import { useRegistrationForm } from "../../activities/hooks.ts";
import { useSlots } from "../../activities/slots-hooks.ts";
import {
  useApply,
  useCancelRegistration,
  useMyRegistrations,
} from "../hooks.ts";
import { FormFields } from "./FormFields.tsx";
import {
  REGISTRATION_STATUS_LABELS,
  toVietnameseRegistrationError,
} from "../messages.tsx";
import { TicketCard } from "./TicketCard.tsx";

interface ApplyCardProps {
  orgId: string;
  activityId: string;
  activityStatus: string;
}

const CANCELLABLE = new Set(["pending", "approved", "waitlisted"]);

export function ApplyCard({
  orgId,
  activityId,
  activityStatus,
}: ApplyCardProps): ReactElement {
  const session = useSession();
  const mine = useMyRegistrations(session.data != null);
  const apply = useApply(activityId);
  const cancel = useCancelRegistration();
  const form = useRegistrationForm(orgId, activityId);
  const slots = useSlots(orgId, activityId);
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
            to="/login"
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

  const failMessage = (err: unknown): string =>
    err instanceof ApiError
      ? toVietnameseRegistrationError(err.code, err.message)
      : "Có lỗi xảy ra.";

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
      setError(failMessage(err));
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
      setError(failMessage(err));
    }
  };

  if (existing && existing.status !== "cancelled") {
    const label =
      REGISTRATION_STATUS_LABELS[existing.status] ?? existing.status;
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Trạng thái đăng ký của bạn:{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {label}
          </span>
        </p>
        {existing.review_note && (
          <p className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
            Ghi chú từ ban tổ chức: {existing.review_note}
          </p>
        )}
        {(existing.status === "approved" ||
          existing.status === "attended") && (
          <TicketCard
            activityId={activityId}
            registrationId={existing.registration_id}
          />
        )}
        {CANCELLABLE.has(existing.status) && (
          <div>
            <Button
              variant="ghost"
              disabled={cancel.isPending}
              onClick={() => void onCancel()}
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

  const applyable =
    activityStatus === "published" || activityStatus === "ongoing";
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
      {(slots.data?.length ?? 0) > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Chọn ca tham gia
          </legend>
          {slots.data!.map((s) => {
            const full =
              s.capacity != null && s.registered >= s.capacity;
            return (
              <label
                key={s.slot_id}
                className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                  slotId === s.slot_id
                    ? "border-zinc-900 dark:border-zinc-100"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="slot"
                    checked={slotId === s.slot_id}
                    onChange={() => setSlotId(s.slot_id)}
                  />
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {s.title}
                  </span>
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.capacity != null
                    ? `${s.registered}/${s.capacity}${full ? " · đầy" : ""}`
                    : `${s.registered} đã đăng ký`}
                </span>
              </label>
            );
          })}
        </fieldset>
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
          {apply.data?.status === "waitlisted"
            ? "Hoạt động đã đầy — bạn được xếp vào danh sách chờ."
            : "Đã gửi đăng ký — chờ ban tổ chức duyệt."}
        </p>
      )}
    </div>
  );
}
