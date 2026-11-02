"use client";

import { BsQrCode } from "react-icons/bs";
import { openSession } from "@/app/_actions/attendance";
import type { Shift } from "@/lib/activities";
import { SESSION_MINUTES } from "@/lib/attendance";
import { FormMessage, SubmitButton } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { fieldLabel, inputField, panel } from "../ui";

type OpenSessionFormProps = {
  activityId: string;
  shifts: Shift[];
};

export default function OpenSessionForm({
  activityId,
  shifts,
}: OpenSessionFormProps) {
  const { state, pending, formProps } = useAccountForm(
    openSession.bind(null, activityId),
  );
  return (
    <form {...formProps} className={`${panel} flex flex-col gap-3 p-4`}>
      <FormMessage state={state} />
      <div className="flex flex-wrap items-end gap-3">
        {shifts.length > 0 ? (
          <label className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
            <span className={fieldLabel}>Ca</span>
            <select name="shift_id" className={inputField}>
              {shifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex min-w-0 flex-1 basis-32 flex-col gap-1">
          <span className={fieldLabel}>Thời lượng</span>
          <select name="minutes" defaultValue="120" className={inputField}>
            {SESSION_MINUTES.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} phút
              </option>
            ))}
          </select>
        </label>
        <SubmitButton pending={pending} icon={BsQrCode}>
          Mở điểm danh
        </SubmitButton>
      </div>
    </form>
  );
}
