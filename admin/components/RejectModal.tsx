import { useState } from "react";
import type { ReactElement } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useRejectOrg } from "../hooks.ts";
import { adminMessage } from "../messages.tsx";
import type { AdminOrgItem } from "../api.ts";

interface RejectModalProps {
  org: AdminOrgItem | null;
  onClose: () => void;
}

export function RejectModal({ org, onClose }: RejectModalProps): ReactElement {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const reject = useRejectOrg();

  async function submit(): Promise<void> {
    if (!org) return;
    setError("");
    try {
      await reject.mutateAsync({ id: org.id, reason });
      setReason("");
      onClose();
    } catch (err) {
      setError(
        adminMessage(err instanceof ApiError ? err.code : "REQUEST_FAILED"),
      );
    }
  }

  return (
    <Modal
      open={org !== null}
      title={`Từ chối "${org?.name ?? ""}"`}
      onClose={onClose}
    >
      <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
        <FiAlertTriangle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Tổ chức sẽ nhận thông báo kèm lý do từ chối để cập nhật hồ sơ.
        </p>
      </div>
      <div className="mt-3">
        <TextField
          label="Lý do từ chối"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: Thiếu ảnh giấy phép"
          maxLength={500}
          hint="Không bắt buộc — chủ tổ chức sẽ thấy nội dung này."
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Huỷ
        </Button>
        <Button
          variant="primary"
          disabled={reject.isPending}
          onClick={() => void submit()}
        >
          {reject.isPending ? "Đang xử lý…" : "Từ chối xác minh"}
        </Button>
      </div>
    </Modal>
  );
}
