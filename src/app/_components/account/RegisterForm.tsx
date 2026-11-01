"use client";

import Link from "next/link";
import { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import { register } from "@/app/_actions/auth";
import { PASSWORD_HINT } from "@/lib/validation";
import { fieldLabel } from "../ui";
import {
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "./FormParts";
import { useAccountForm } from "./useAccountForm";

const ACCOUNT_TYPES = [
  { value: "individual", label: "Cá nhân" },
  { value: "business", label: "Tổ chức, doanh nghiệp" },
];

export default function RegisterForm() {
  const { state, pending, formProps, passwordProps } = useAccountForm(register);
  const [accountType, setAccountType] = useState("individual");

  return (
    <form {...formProps} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className={`${fieldLabel} mb-1`}>Loại tài khoản</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACCOUNT_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-2 border p-3 text-sm font-semibold ${
                accountType === value
                  ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                  : "border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <input
                type="radio"
                name="account_type"
                value={value}
                checked={accountType === value}
                onChange={() => setAccountType(value)}
                className="accent-teal-700 dark:accent-teal-400"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <TextField
        errors={state.fieldErrors}
        label="Họ và tên"
        name="full_name"
        autoComplete="name"
        maxLength={120}
        required
      />
      <TextField
        errors={state.fieldErrors}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <TextField
        errors={state.fieldErrors}
        label="Số điện thoại (không bắt buộc)"
        name="phone"
        type="tel"
        autoComplete="tel"
      />
      {accountType === "business" ? (
        <>
          <TextField
            errors={state.fieldErrors}
            label="Tên đơn vị"
            name="company_name"
            autoComplete="organization"
            required
          />
          <TextField
            errors={state.fieldErrors}
            label="Mã số thuế"
            name="tax_code"
            required
          />
        </>
      ) : null}
      <PasswordField
        label="Mật khẩu"
        name="password"
        {...passwordProps}
        autoComplete="new-password"
        minLength={8}
        maxLength={128}
        hint={PASSWORD_HINT}
        required
      />
      <PasswordField
        label="Nhập lại mật khẩu"
        name="confirm_password"
        {...passwordProps}
        autoComplete="new-password"
        required
      />
      <FormMessage state={state} />
      <SubmitButton pending={pending} icon={FiUserPlus}>
        Tạo tài khoản
      </SubmitButton>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
