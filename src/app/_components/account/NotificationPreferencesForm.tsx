"use client";

import { FiSave } from "react-icons/fi";
import { saveNotificationPreferences } from "@/app/_actions/notifications";
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPES,
  type NotificationPreferences,
} from "@/lib/notificationTypes";
import { mutedText, panel, sectionTitle } from "../ui";
import { FormMessage, SubmitButton } from "./FormParts";
import { useAccountForm } from "./useAccountForm";

// The field names avoid "email", which the shared form check reads as an email address.
function CheckRow({
  name,
  value,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  value?: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-slate-900 dark:text-slate-100">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 accent-teal-700 dark:accent-teal-400"
      />
      <span className="flex flex-col gap-1">
        {label}
        {hint ? <span className={mutedText}>{hint}</span> : null}
      </span>
    </label>
  );
}

// Each notification type is received unless it is unticked here.
export default function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferences;
}) {
  const { state, pending, formProps } = useAccountForm(
    saveNotificationPreferences,
    { resetOnSuccess: false },
  );
  const muted = new Set(preferences.muted_types);
  return (
    <form {...formProps} className={`${panel} flex flex-col gap-6 p-4 sm:p-6`}>
      <FormMessage state={state} />
      <fieldset className="flex flex-col gap-3">
        <legend className={sectionTitle}>Kênh nhận</legend>
        <CheckRow
          name="channel_inapp"
          label="Hiện trong chuông thông báo"
          defaultChecked={preferences.inapp}
        />
        <CheckRow
          name="channel_email"
          label="Gửi email"
          hint="Chỉ gửi tới địa chỉ email đã xác minh."
          defaultChecked={preferences.email}
        />
      </fieldset>
      <fieldset className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <legend className={sectionTitle}>Loại thông báo</legend>
        {NOTIFICATION_TYPES.map((type) => (
          <CheckRow
            key={type}
            name="receive"
            value={type}
            label={NOTIFICATION_TYPE_LABELS[type]}
            defaultChecked={!muted.has(type)}
          />
        ))}
      </fieldset>
      <div>
        <SubmitButton pending={pending} icon={FiSave}>
          Lưu cài đặt
        </SubmitButton>
      </div>
    </form>
  );
}
