"use client";

import { useState } from "react";
import { FiSlash, FiX } from "react-icons/fi";
import { revokeCertificate } from "@/app/_actions/certificates";
import { reasonError } from "@/lib/certificates";
import { FormMessage, SubmitButton, TextAreaField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton, neutralButton } from "../ui";

function RevokeForm({ id, onClose }: { id: string; onClose: () => void }) {
  const { state, pending, formProps } = useAccountForm(
    revokeCertificate.bind(null, id),
    {
      validate: (form): Record<string, string> => {
        const input = form.elements.namedItem("reason");
        const message = reasonError(
          input instanceof HTMLTextAreaElement ? input.value : "",
        );
        return message ? { reason: message } : {};
      },
    },
  );
  return (
    <form {...formProps} className="flex w-full flex-col gap-2">
      <FormMessage state={state} />
      <TextAreaField
        label="Lý do thu hồi"
        name="reason"
        rows={2}
        maxLength={1000}
        hint="Từ 5 ký tự. Người nhận không thấy lý do trên trang xác minh."
        errors={state.fieldErrors}
        required
      />
      <div className="flex items-center gap-2">
        <SubmitButton
          pending={pending}
          icon={FiSlash}
          className={neutralButton}
        >
          Thu hồi
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

// Revoking needs a reason, so the button opens a short form in place.
export default function RevokeButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  if (open) {
    return <RevokeForm id={id} onClose={() => setOpen(false)} />;
  }
  return (
    <button
      type="button"
      aria-label="Thu hồi chứng nhận"
      title="Thu hồi chứng nhận"
      onClick={() => setOpen(true)}
      className={iconButton}
    >
      <FiSlash aria-hidden="true" />
    </button>
  );
}
