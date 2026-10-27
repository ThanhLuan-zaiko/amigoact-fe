import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { RoleChoice } from "../../dashboard/components/RoleChoice.tsx";
import type { RoleOption } from "../../dashboard/messages-roles.tsx";

const DURATIONS: RoleOption[] = [
  { key: "5", label: "5 phút", hint: "", detail: "" },
  { key: "60", label: "1 giờ", hint: "", detail: "" },
  { key: "1440", label: "1 ngày", hint: "", detail: "" },
  { key: "10080", label: "7 ngày", hint: "", detail: "" },
];

interface ChatTimeoutDialogProps {
  name: string;
  busy: boolean;
  onConfirm: (minutes: number, reason: string) => void;
  onClose: () => void;
}

// Pick how long a member stays muted. Mount it only while it is needed so
// every opening starts from the defaults.
export function ChatTimeoutDialog({
  name,
  busy,
  onConfirm,
  onClose,
}: ChatTimeoutDialogProps): ReactElement {
  const [minutes, setMinutes] = useState("60");
  const [reason, setReason] = useState("");

  function submit(event: FormEvent): void {
    event.preventDefault();
    onConfirm(Number(minutes), reason.trim());
  }

  return (
    <Modal title={`Tạm cấm chat ${name}`} open onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Trong thời gian này, {name} không gửi được tin nhắn hay tệp ở các phòng chung của tổ chức.
        </p>
        <div role="radiogroup" aria-label="Thời gian cấm chat" className="flex flex-col gap-2">
          {DURATIONS.map((option) => (
            <RoleChoice
              key={option.key}
              type="radio"
              name="chat-timeout-minutes"
              option={option}
              checked={minutes === option.key}
              onChange={() => setMinutes(option.key)}
            />
          ))}
        </div>
        <TextField
          label="Lý do (không bắt buộc)"
          name="chat-timeout-reason"
          value={reason}
          maxLength={200}
          onChange={(event) => setReason(event.target.value)}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={onClose}
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {busy ? "Đang xử lý…" : "Tạm cấm chat"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
