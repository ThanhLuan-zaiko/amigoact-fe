"use client";

import Link from "next/link";
import { FiLogIn } from "react-icons/fi";
import { login } from "@/app/_actions/auth";
import {
  FormMessage,
  PasswordField,
  SubmitButton,
  TextField,
} from "./FormParts";
import { useAccountForm } from "./useAccountForm";

const linkClass =
  "font-semibold text-teal-700 hover:underline dark:text-teal-400";

export default function LoginForm({ next }: { next?: string }) {
  const { state, pending, formProps, passwordProps } = useAccountForm(login);
  return (
    <form {...formProps} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <TextField
        errors={state.fieldErrors}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
      />
      <PasswordField
        label="Mật khẩu"
        name="password"
        {...passwordProps}
        autoComplete="current-password"
        required
      />
      <Link href="/forgot-password" className={`${linkClass} text-sm`}>
        Quên mật khẩu?
      </Link>
      <FormMessage state={state} />
      <SubmitButton pending={pending} icon={FiLogIn} className={submitClass}>
        Đăng nhập
      </SubmitButton>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Chưa có tài khoản?{" "}
        <Link href="/register" className={linkClass}>
          Đăng ký
        </Link>
      </p>
    </form>
  );
}

const submitClass =
  "inline-flex h-10 w-full items-center justify-center gap-2 border border-teal-700 bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700 dark:border-teal-400 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300 dark:focus-visible:outline-teal-400";
