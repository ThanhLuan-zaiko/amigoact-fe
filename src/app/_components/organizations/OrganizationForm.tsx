"use client";

import { FiPlus, FiSave } from "react-icons/fi";
import type { FormState } from "@/lib/account";
import {
  JOIN_POLICY_LABELS,
  ORG_TYPE_LABELS,
  type OrganizationDetail,
} from "@/lib/organizations";
import {
  FormMessage,
  SubmitButton,
  TextAreaField,
  TextField,
} from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { fieldLabel, inputField, panel } from "../ui";

type OrganizationFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  // Editing shows the contact fields too. Creating asks only for the essentials.
  organization?: OrganizationDetail;
};

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: Record<string, string>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={fieldLabel}>{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputField}>
        {Object.entries(options).map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function OrganizationForm({
  action,
  organization,
}: OrganizationFormProps) {
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: false,
  });
  const errors = state.fieldErrors;

  return (
    <form {...formProps} className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <FormMessage state={state} />
      <TextField
        label="Tên tổ chức"
        name="name"
        defaultValue={organization?.name}
        maxLength={120}
        errors={errors}
        required
      />
      <TextAreaField
        label="Giới thiệu"
        name="description"
        defaultValue={organization?.description}
        maxLength={2000}
        errors={errors}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Loại tổ chức"
          name="org_type"
          defaultValue={organization?.org_type ?? "organization"}
          options={ORG_TYPE_LABELS}
        />
        <SelectField
          label="Cách tham gia"
          name="join_policy"
          defaultValue={organization?.join_policy ?? "invite"}
          options={JOIN_POLICY_LABELS}
        />
      </div>
      {organization ? (
        <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Email liên hệ"
              name="email"
              type="email"
              defaultValue={organization.email}
              errors={errors}
            />
            <TextField
              label="Số điện thoại"
              name="phone"
              type="tel"
              defaultValue={organization.phone}
              errors={errors}
            />
          </div>
          <TextField
            label="Website"
            name="website"
            type="url"
            defaultValue={organization.website}
            maxLength={300}
            hint="Bắt đầu bằng http:// hoặc https://"
            errors={errors}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Địa chỉ"
              name="address"
              defaultValue={organization.address}
              maxLength={500}
              errors={errors}
            />
            <TextField
              label="Thành phố"
              name="city"
              defaultValue={organization.city}
              maxLength={120}
              errors={errors}
            />
          </div>
        </div>
      ) : null}
      <div>
        <SubmitButton pending={pending} icon={organization ? FiSave : FiPlus}>
          {organization ? "Lưu thay đổi" : "Tạo tổ chức"}
        </SubmitButton>
      </div>
    </form>
  );
}
