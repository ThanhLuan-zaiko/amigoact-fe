"use client";

import { FiCheck, FiCheckCircle } from "react-icons/fi";
import { checkIn } from "@/app/_actions/attendance";
import { FormMessage, SubmitButton, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { panel, primaryButton } from "../ui";

// A scanned QR opens this page. Checking in still takes a click, so a link
// preview or a prefetch can never mark someone as present.
export function QrCheckIn({ token }: { token: string }) {
  const { state, pending, formProps } = useAccountForm(checkIn);
  if (state.success) {
    return <FormMessage state={state} />;
  }
  return (
    <form {...formProps} className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <SubmitButton
        pending={pending}
        icon={FiCheckCircle}
        className={`${primaryButton} w-full`}
      >
        Điểm danh
      </SubmitButton>
    </form>
  );
}

export function CodeCheckIn() {
  const { state, pending, formProps } = useAccountForm(checkIn);
  return (
    <form {...formProps} className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <FormMessage state={state} />
      <TextField
        label="Mã điểm danh"
        name="code"
        maxLength={6}
        autoComplete="off"
        errors={state.fieldErrors}
        required
      />
      <div>
        <SubmitButton pending={pending} icon={FiCheck}>
          Gửi mã
        </SubmitButton>
      </div>
    </form>
  );
}
