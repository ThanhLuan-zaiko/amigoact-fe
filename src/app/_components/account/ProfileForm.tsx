"use client";

import { FiSave } from "react-icons/fi";
import { updateProfile } from "@/app/_actions/account";
import type { User } from "@/lib/account";
import { fieldLabel, inputField } from "../ui";
import { FormMessage, SubmitButton, TextField } from "./FormParts";
import { useAccountForm } from "./useAccountForm";

const GENDERS = [
  { value: "", label: "Chưa chọn" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
  { value: "unspecified", label: "Không muốn nêu" },
];

export default function ProfileForm({ user }: { user: User }) {
  // The saved values stay on screen, so the form is not cleared after saving.
  const { state, pending, formProps } = useAccountForm(updateProfile, {
    resetOnSuccess: false,
  });
  return (
    <form {...formProps} className="flex flex-col gap-4">
      <FormMessage state={state} />
      <TextField
        errors={state.fieldErrors}
        label="Họ và tên"
        name="full_name"
        defaultValue={user.full_name}
        autoComplete="name"
        maxLength={120}
        required
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          errors={state.fieldErrors}
          label="Số điện thoại"
          name="phone"
          type="tel"
          defaultValue={user.phone}
          autoComplete="tel"
        />
        <TextField
          errors={state.fieldErrors}
          label="Ngày sinh"
          name="date_of_birth"
          type="date"
          defaultValue={user.date_of_birth}
        />
      </div>
      <label className="flex flex-col gap-1">
        <span className={fieldLabel}>Giới tính</span>
        <select
          name="gender"
          defaultValue={user.gender ?? ""}
          className={`${inputField} dark:bg-slate-950`}
        >
          {GENDERS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <TextField
        errors={state.fieldErrors}
        label="Địa chỉ"
        name="address"
        defaultValue={user.address}
        autoComplete="street-address"
        maxLength={500}
      />
      {user.account_type === "business" ? (
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <TextField
            errors={state.fieldErrors}
            label="Tên đơn vị"
            name="company_name"
            defaultValue={user.company_name}
            required
          />
          <TextField
            errors={state.fieldErrors}
            label="Mã số thuế"
            name="tax_code"
            defaultValue={user.tax_code}
            required
          />
          <TextField
            errors={state.fieldErrors}
            label="Người đại diện pháp luật"
            name="legal_rep_name"
            defaultValue={user.legal_rep_name}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              errors={state.fieldErrors}
              label="Số giấy tờ người đại diện"
              name="legal_rep_id"
              defaultValue={user.legal_rep_id}
            />
            <TextField
              errors={state.fieldErrors}
              label="Chức vụ người đại diện"
              name="legal_rep_position"
              defaultValue={user.legal_rep_position}
            />
          </div>
        </div>
      ) : null}
      <div>
        <SubmitButton pending={pending} icon={FiSave}>
          Lưu thay đổi
        </SubmitButton>
      </div>
    </form>
  );
}
