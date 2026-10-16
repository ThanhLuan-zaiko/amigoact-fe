import { useState, type ReactElement } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useAdjustHours } from "../rules-hooks.ts";

interface AdjustBoxProps {
  orgId: string;
  activityId: string;
  onError: (message: string) => void;
  onDone: (message: string) => void;
  failMessage: (err: unknown) => string;
}

export function AdjustBox({
  orgId,
  activityId,
  onError,
  onDone,
  failMessage,
}: AdjustBoxProps): ReactElement {
  const adjust = useAdjustHours(orgId);
  const [student, setStudent] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");

  const submit = async (): Promise<void> => {
    const value = Number.parseFloat(delta);
    if (
      !student.trim() || !Number.isFinite(value) || value === 0 ||
      reason.trim().length < 3
    ) {
      onError("Nhập mã SV, giờ điều chỉnh khác 0 và lý do.");
      return;
    }
    try {
      await adjust.mutateAsync({
        student_id: student.trim(),
        activity_id: activityId,
        delta_hours: value,
        reason: reason.trim(),
      });
      onDone("Đã tạo điều chỉnh — chờ duyệt.");
      setStudent("");
      setDelta("");
      setReason("");
    } catch (err) {
      onError(failMessage(err));
    }
  };

  return (
    <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Điều chỉnh giờ (có lý do, chờ duyệt)
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
        <TextField
          label="Mã sinh viên"
          value={student}
          onChange={(e) => setStudent(e.target.value)}
          placeholder="UUID của tình nguyện viên"
          className="flex-1"
        />
        <TextField
          label="Giờ điều chỉnh"
          type="number"
          step={0.5}
          value={delta}
          onChange={(e) => setDelta(e.target.value)}
          placeholder="± giờ"
          className="sm:w-28"
        />
        <TextField
          label="Lý do"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Vd: sai giờ check-out"
          className="flex-1"
        />
        <Button
          variant="secondary"
          disabled={adjust.isPending}
          onClick={() => void submit()}
          icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
        >
          Điều chỉnh
        </Button>
      </div>
    </div>
  );
}
