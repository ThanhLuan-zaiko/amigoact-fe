"use client";

import { useState } from "react";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { adjustHours } from "@/app/_actions/attendance";
import {
  FormMessage,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton } from "../ui";

function AdjustForm({
  activityId,
  userId,
  onClose,
}: {
  activityId: string;
  userId: string;
  onClose: () => void;
}) {
  const { state, pending, formProps } = useAccountForm(
    adjustHours.bind(null, activityId, userId),
  );
  return (
    <form {...formProps} className="flex w-full flex-col gap-2">
      <FormMessage state={state} />
      <TextField
        label="Số giờ thay đổi"
        name="delta_hours"
        numeric="signed-decimal"
        hint="Ví dụ 1.5 hoặc -2"
        errors={state.fieldErrors}
        required
      />
      <TextAreaField
        label="Lý do"
        name="reason"
        rows={2}
        maxLength={1000}
        errors={state.fieldErrors}
      />
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending} icon={FiSave}>
          Lưu
        </SubmitButton>
        <button
          type="button"
          aria-label="Hủy"
          title="Hủy"
          onClick={onClose}
          className={iconButton}
        >
          <FiX aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default function AdjustHours({
  activityId,
  userId,
}: {
  activityId: string;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <AdjustForm
        activityId={activityId}
        userId={userId}
        onClose={() => setOpen(false)}
      />
    );
  }
  return (
    <button
      type="button"
      aria-label="Điều chỉnh giờ"
      title="Điều chỉnh giờ"
      onClick={() => setOpen(true)}
      className={iconButton}
    >
      <FiEdit2 aria-hidden="true" />
    </button>
  );
}
