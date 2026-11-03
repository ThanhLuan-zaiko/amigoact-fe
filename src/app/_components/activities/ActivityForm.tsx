"use client";

import { FiPlus, FiSave } from "react-icons/fi";
import type { FormState } from "@/lib/account";
import { type ActivityDetail, toLocalInput } from "@/lib/activities";
import {
  FormMessage,
  FormSection,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../account/FormParts";
import { RequiredLegend } from "../account/RequiredMarks";
import { useAccountForm } from "../account/useAccountForm";
import { fieldLabel, panel } from "../ui";

type ActivityFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  activity?: ActivityDetail;
};

function CheckField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className={`${fieldLabel} flex items-center gap-2`}>
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-teal-700 dark:accent-teal-400"
      />
      {label}
    </label>
  );
}

export default function ActivityForm({ action, activity }: ActivityFormProps) {
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: false,
  });
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
              />
              <TextField
                label="Kết thúc"
                name="end_at"
                type="datetime-local"
                defaultValue={toLocalInput(activity?.end_at ?? null)}
                errors={errors}
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
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Địa điểm"
                name="location"
                defaultValue={activity?.location}
                maxLength={200}
                errors={errors}
              />
              <TextField
                label="Thành phố"
                name="city"
                defaultValue={activity?.city}
                maxLength={120}
                errors={errors}
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
      <div>
        <SubmitButton pending={pending} icon={activity ? FiSave : FiPlus}>
          {activity ? "Lưu" : "Tạo bản nháp"}
        </SubmitButton>
      </div>
    </form>
  );
}
