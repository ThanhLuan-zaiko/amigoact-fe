"use client";

import { useState } from "react";
import { FiSave, FiSend } from "react-icons/fi";
import type { FieldErrors, FormState } from "@/lib/account";
import { type ActivityDetail, toLocalInput } from "@/lib/activities";
import { FIELD_MESSAGES } from "@/lib/validation";
import {
  FormMessage,
  FormSection,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../account/FormParts";
import { RequiredLegend } from "../account/RequiredMarks";
import { useAccountForm } from "../account/useAccountForm";
import { fieldLabel, panel, secondaryButton } from "../ui";

type ActivityFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  activity?: ActivityDetail;
};

function CheckField({
  label,
  name,
  defaultChecked,
  onChange,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className={`${fieldLabel} flex items-center gap-2`}>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        className="h-4 w-4 accent-teal-700 dark:accent-teal-400"
      />
      {label}
    </label>
  );
}

// Textareas are not covered by the generic checks, so the description is checked here.
function validateExtra(form: HTMLFormElement): FieldErrors {
  const description = form.elements.namedItem("description");
  const empty =
    description instanceof HTMLTextAreaElement &&
    description.value.trim() === "";
  return empty ? { description: FIELD_MESSAGES.required } : {};
}

export default function ActivityForm({ action, activity }: ActivityFormProps) {
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: false,
    validate: validateExtra,
  });
  // A remote activity has no place, so the place is required only for the others.
  const [remote, setRemote] = useState(activity?.is_remote ?? false);
  const errors = state.fieldErrors;

  return (
    <form {...formProps} className={`${panel} flex flex-col gap-6 p-4 sm:p-6`}>
      <FormMessage state={state} />
      <RequiredLegend />
      {/* Two columns from xl. The order on a phone is the same as the order on the left, then the right. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Nội dung">
            <TextField
              label="Tên hoạt động"
              name="title"
              defaultValue={activity?.title}
              maxLength={200}
              errors={errors}
              required
            />
            <TextAreaField
              label="Mô tả"
              name="description"
              defaultValue={activity?.description}
              rows={5}
              maxLength={5000}
              errors={errors}
              required
            />
          </FormSection>
          <FormSection title="Thời gian">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Bắt đầu"
                name="start_at"
                type="datetime-local"
                defaultValue={toLocalInput(activity?.start_at ?? null)}
                errors={errors}
                required
              />
              <TextField
                label="Kết thúc"
                name="end_at"
                type="datetime-local"
                defaultValue={toLocalInput(activity?.end_at ?? null)}
                errors={errors}
                required
              />
              <TextField
                label="Hạn đăng ký"
                name="registration_deadline"
                type="datetime-local"
                defaultValue={toLocalInput(
                  activity?.registration_deadline ?? null,
                )}
                errors={errors}
              />
              <TextField
                label="Giờ tình nguyện"
                name="hours_awarded"
                defaultValue={activity?.hours_awarded?.toString()}
                errors={errors}
                required
              />
            </div>
          </FormSection>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Địa điểm">
            <CheckField
              label="Trực tuyến"
              name="is_remote"
              defaultChecked={activity?.is_remote ?? false}
              onChange={setRemote}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Địa điểm"
                name="location"
                defaultValue={activity?.location}
                maxLength={200}
                errors={errors}
                required={!remote}
              />
              <TextField
                label="Thành phố"
                name="city"
                defaultValue={activity?.city}
                maxLength={120}
                errors={errors}
                required
              />
            </div>
            <TextField
              label="Địa chỉ"
              name="address"
              defaultValue={activity?.address}
              maxLength={500}
              errors={errors}
            />
          </FormSection>
          <FormSection title="Đăng ký">
            <TextField
              label="Số chỗ"
              name="max_participants"
              defaultValue={activity?.max_participants?.toString()}
              hint="Bỏ trống nếu không giới hạn. Khi có ca, số chỗ tính theo từng ca."
              errors={errors}
            />
            <CheckField
              label="Cần duyệt người đăng ký"
              name="requires_approval"
              defaultChecked={activity?.requires_approval ?? false}
            />
          </FormSection>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {activity ? (
          <SubmitButton pending={pending} icon={FiSave}>
            Lưu
          </SubmitButton>
        ) : (
          <>
            <SubmitButton
              pending={pending}
              icon={FiSend}
              name="intent"
              value="publish"
            >
              Đăng ngay
            </SubmitButton>
            <SubmitButton
              pending={pending}
              icon={FiSave}
              name="intent"
              value="draft"
              className={secondaryButton}
            >
              Lưu nháp
            </SubmitButton>
          </>
        )}
      </div>
    </form>
  );
}
