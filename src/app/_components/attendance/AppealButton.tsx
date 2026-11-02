"use client";

import { useState } from "react";
import { FiFlag, FiSend, FiX } from "react-icons/fi";
import { createAppeal } from "@/app/_actions/attendance";
import { FormMessage, SubmitButton, TextAreaField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton } from "../ui";

function AppealForm({
  registrationId,
  onClose,
}: {
  registrationId: string;
  onClose: () => void;
}) {
  const { state, pending, formProps } = useAccountForm(
    createAppeal.bind(null, registrationId),
  );
  return (
    <form {...formProps} className="flex w-full flex-col gap-2">
      <FormMessage state={state} />
      <TextAreaField
        label="Lý do khiếu nại"
        name="reason"
        rows={3}
        maxLength={1000}
        errors={state.fieldErrors}
      />
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending} icon={FiSend}>
          Gửi
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

export default function AppealButton({
  registrationId,
}: {
  registrationId: string;
}) {
  const [open, setOpen] = useState(false);
  if (open) {
    return (
      <AppealForm
        registrationId={registrationId}
        onClose={() => setOpen(false)}
      />
    );
  }
  return (
    <button
      type="button"
      aria-label="Khiếu nại điểm danh"
      title="Khiếu nại điểm danh"
      onClick={() => setOpen(true)}
      className={iconButton}
    >
      <FiFlag aria-hidden="true" />
    </button>
  );
}
