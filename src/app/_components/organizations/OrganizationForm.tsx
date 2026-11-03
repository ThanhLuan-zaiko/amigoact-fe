"use client";

import type { ReactNode } from "react";
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
import { RequiredLegend } from "../account/RequiredMarks";
import { useAccountForm } from "../account/useAccountForm";
import SelectMenu, { optionsFrom } from "../SelectMenu";
import { panel, sectionTitle } from "../ui";
import OrganizationLegalFields from "./OrganizationLegalFields";
import PictureField from "./PictureField";

type OrganizationFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  // Editing starts from the saved values. Creating starts empty.
  organization?: OrganizationDetail;
};

// Sections are split by a divider, not by cards, so the form stays flat.
function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-slate-200 pt-6 first-of-type:border-t-0 first-of-type:pt-0 dark:border-slate-800">
      <h2 className={sectionTitle}>{title}</h2>
      {children}
    </section>
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
    <form {...formProps} className={`${panel} flex flex-col gap-6 p-4 sm:p-6`}>
      <FormMessage state={state} />
      <RequiredLegend />
      <FormSection title="Thông tin chung">
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
          <SelectMenu
            label="Loại tổ chức"
            name="org_type"
            defaultValue={organization?.org_type ?? "organization"}
            options={optionsFrom(ORG_TYPE_LABELS)}
          />
          <SelectMenu
            label="Cách tham gia"
            name="join_policy"
            defaultValue={organization?.join_policy ?? "invite"}
            options={optionsFrom(JOIN_POLICY_LABELS)}
          />
        </div>
      </FormSection>
      <FormSection title="Ảnh">
        <PictureField
          label="Logo"
          name="logo"
          currentUrl={organization?.logo_url}
          shape="square"
          error={errors?.logo}
        />
        <PictureField
          label="Ảnh bìa"
          name="cover"
          currentUrl={organization?.cover_url}
          shape="wide"
          error={errors?.cover}
        />
      </FormSection>
      <FormSection title="Liên hệ">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Email liên hệ"
            name="email"
            type="email"
            defaultValue={organization?.email}
            errors={errors}
          />
          <TextField
            label="Số điện thoại"
            name="phone"
            type="tel"
            defaultValue={organization?.phone}
            errors={errors}
          />
        </div>
        <TextField
          label="Website"
          name="website"
          type="url"
          defaultValue={organization?.website}
          maxLength={300}
          hint="Bắt đầu bằng http:// hoặc https://"
          errors={errors}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Địa chỉ"
            name="address"
            defaultValue={organization?.address}
            maxLength={500}
            errors={errors}
          />
          <TextField
            label="Thành phố"
            name="city"
            defaultValue={organization?.city}
            maxLength={120}
            errors={errors}
          />
        </div>
      </FormSection>
      <FormSection title="Pháp lý">
        <OrganizationLegalFields organization={organization} errors={errors} />
      </FormSection>
      <div>
        <SubmitButton pending={pending} icon={organization ? FiSave : FiPlus}>
          {organization ? "Lưu thay đổi" : "Tạo tổ chức"}
        </SubmitButton>
      </div>
    </form>
  );
}
