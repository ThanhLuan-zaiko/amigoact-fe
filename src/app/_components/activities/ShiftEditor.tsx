"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiEdit2,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  createShift,
  deleteShift,
  updateShift,
} from "@/app/_actions/activities";
import {
  formatDateTime,
  type Shift,
  seatsText,
  toLocalInput,
} from "@/lib/activities";
import { FormMessage, SubmitButton, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import IconStat from "../IconStat";
import ActionButton from "../organizations/ActionButton";
import { iconButton, panel, sectionTitle } from "../ui";

function ShiftForm({
  activityId,
  shift,
  onCancel,
}: {
  activityId: string;
  shift?: Shift;
  onCancel?: () => void;
}) {
  const { state, pending, formProps } = useAccountForm(
    shift
      ? updateShift.bind(null, activityId, shift.id)
      : createShift.bind(null, activityId),
  );
  const errors = state.fieldErrors;
  return (
    <form {...formProps} className="flex flex-col gap-3">
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Tên ca"
          name="shift_title"
          defaultValue={shift?.title}
          maxLength={120}
          errors={errors}
          required
        />
        <TextField
          label="Số chỗ"
          name="capacity"
          numeric="integer"
          defaultValue={shift?.capacity?.toString()}
          errors={errors}
          required
        />
        <TextField
          label="Bắt đầu"
          name="start_at"
          type="datetime-local"
          defaultValue={toLocalInput(shift?.start_at ?? null)}
          errors={errors}
          required
        />
        <TextField
          label="Kết thúc"
          name="end_at"
          type="datetime-local"
          defaultValue={toLocalInput(shift?.end_at ?? null)}
          errors={errors}
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <SubmitButton pending={pending} icon={shift ? FiSave : FiPlus}>
          {shift ? "Lưu" : "Thêm ca"}
        </SubmitButton>
        {onCancel ? (
          <button
            type="button"
            aria-label="Hủy"
            title="Hủy"
            onClick={onCancel}
            className={iconButton}
          >
            <FiX aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </form>
  );
}

function ShiftRow({ activityId, shift }: { activityId: string; shift: Shift }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li className="py-3">
        <ShiftForm
          activityId={activityId}
          shift={shift}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
        <p className="truncate text-sm font-semibold">{shift.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <IconStat icon={FiCalendar} label="Thời gian">
            {formatDateTime(shift.start_at)} – {formatDateTime(shift.end_at)}
          </IconStat>
          <IconStat icon={FiUsers} label="Số chỗ">
            {seatsText(shift.seats_taken, shift.capacity)}
          </IconStat>
        </div>
      </div>
      <button
        type="button"
        aria-label="Sửa ca"
        title="Sửa ca"
        onClick={() => setEditing(true)}
        className={iconButton}
      >
        <FiEdit2 aria-hidden="true" />
      </button>
      <ActionButton
        action={deleteShift.bind(null, activityId, shift.id)}
        label="Xóa ca"
        confirmLabel="Xóa ca này?"
      >
        <FiTrash2 aria-hidden="true" />
      </ActionButton>
    </li>
  );
}

type ShiftEditorProps = {
  activityId: string;
  shifts: Shift[];
};

export default function ShiftEditor({ activityId, shifts }: ShiftEditorProps) {
  return (
    <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <h2 className={sectionTitle}>Ca</h2>
      {shifts.length > 0 ? (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {shifts.map((shift) => (
            <ShiftRow key={shift.id} activityId={activityId} shift={shift} />
          ))}
        </ul>
      ) : null}
      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <ShiftForm key={shifts.length} activityId={activityId} />
      </div>
    </section>
  );
}
