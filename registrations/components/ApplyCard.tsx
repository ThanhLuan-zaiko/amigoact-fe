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
import {
  useApply,
  useCancelRegistration,
  useMyRegistrations,
} from "../hooks.ts";
import {
  REGISTRATION_STATUS_LABELS,
  toVietnameseRegistrationError,
} from "../messages.tsx";
import { TicketCard } from "./TicketCard.tsx";

interface ApplyCardProps {
  activityId: string;
  activityStatus: string;
}

const CANCELLABLE = new Set(["pending", "approved", "waitlisted"]);

export function ApplyCard({
  activityId,
  activityStatus,
}: ApplyCardProps): ReactElement {
  const session = useSession();
  const mine = useMyRegistrations(session.data != null);
  const apply = useApply(activityId);
  const cancel = useCancelRegistration();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (!session.data) {
    return (
      <div data-rise>
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
      await apply.mutateAsync({ note: note.trim() || undefined });
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
      <div data-rise className="flex flex-col gap-3">
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
    <div data-rise className="flex flex-col gap-3">
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
