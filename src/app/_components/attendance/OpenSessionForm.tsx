"use client";

import { BsQrCode } from "react-icons/bs";
import { openSession } from "@/app/_actions/attendance";
import type { Shift } from "@/lib/activities";
import { SESSION_MINUTES } from "@/lib/attendance";
import { FormMessage, SubmitButton } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import SelectMenu from "../SelectMenu";
import { panel } from "../ui";

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
          <SelectMenu
            label="Ca"
            name="shift_id"
            defaultValue={shifts[0].id}
            options={shifts.map((shift) => ({
              value: shift.id,
              label: shift.title ?? "",
            }))}
            className="flex-1 basis-40"
          />
        ) : null}
        <SelectMenu
          label="Thời lượng"
          name="minutes"
          defaultValue="120"
          options={SESSION_MINUTES.map((minutes) => ({
            value: String(minutes),
            label: `${minutes} phút`,
          }))}
          className="flex-1 basis-32"
        />
        <SubmitButton pending={pending} icon={BsQrCode}>
          Mở điểm danh
        </SubmitButton>
      </div>
    </form>
  );
}
