import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useResetPassword } from "../hooks.ts";
import {
  validateResetField,
  type FieldErrors,
} from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";
import { VisibilityToggle } from "./VisibilityToggle.tsx";

export function ResetCard(): ReactElement {
  const navigate = useNavigate();
  const reset = useResetPassword();
  const [form, setForm] = useState({ email: "", code: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  function update(key: "email" | "code" | "password" | "confirm", value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((current) => {
      const copy = { ...current };
      const single = validateResetField(next, key);
      if (single) copy[key] = single;
      else delete copy[key];
      if (key === "password") {
        const confirm = validateResetField(next, "confirm");
        if (confirm) copy.confirm = confirm;
        else delete copy.confirm;
      }
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    (["email", "code", "password", "confirm"] as const).forEach((key) => {
      const single = validateResetField(form, key);
      if (single) nextErrors[key] = single;
    });
    setErrors(nextErrors);
    setServerCode(null);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await reset.mutateAsync({
        email: form.email.trim().toLowerCase(),
        code: form.code.trim(),
        new_password: form.password,
      });
      navigate("/login", { replace: true });
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiRefreshCw
          className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Đặt lại mật khẩu
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Nhập mã 6 số trong email rồi chọn mật khẩu mới cho tài khoản.
      </p>
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể đặt lại"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vidu@email.com"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email ? toVietnameseMessage(errors.email) : undefined}
          icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Mã đặt lại"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={form.code}
          onChange={(event) => update("code", event.target.value)}
          error={errors.code ? toVietnameseMessage(errors.code) : undefined}
          icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Mật khẩu mới"
          name="password"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          error={errors.password ? toVietnameseMessage(errors.password) : undefined}
          icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
          trailing={
            <VisibilityToggle
              visible={showPasswords}
              onToggle={() => setShowPasswords((value) => !value)}
            />
          }
        />
        <TextField
          label="Nhập lại mật khẩu mới"
          name="confirm"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          value={form.confirm}
          onChange={(event) => update("confirm", event.target.value)}
          error={errors.confirm ? toVietnameseMessage(errors.confirm) : undefined}
          icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
          trailing={
            <VisibilityToggle
              visible={showPasswords}
              onToggle={() => setShowPasswords((value) => !value)}
            />
          }
        />
        <Button
          type="submit"
          variant="primary"
          disabled={reset.isPending}
          icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          {reset.isPending ? "Đang đặt lại…" : "Đặt lại mật khẩu"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Chưa nhận mã?{" "}
        <Link
          to="/forgot-password"
          className="text-zinc-900 underline decoration-zinc-400 decoration-2 underline-offset-2 hover:bg-zinc-100 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:bg-zinc-900"
        >
          Gửi lại mã
        </Link>
      </p>
    </Section>
  );
}
