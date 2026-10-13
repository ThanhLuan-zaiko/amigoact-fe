import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLock, FiLogIn, FiMail } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useRiseIn } from "../../core/motion.ts";
import { useLogin } from "../hooks.ts";
import { validateLoginField, validateLoginForm, type FieldErrors } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";
import { VisibilityToggle } from "./VisibilityToggle.tsx";

export function LoginCard(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as
    | { email?: string; verified?: boolean; registered?: boolean }
    | null;
  const login = useLogin();
  const [form, setForm] = useState({
    email: state?.email ?? "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const scope = useRiseIn<HTMLDivElement>();
  const canSubmit = Object.keys(validateLoginForm(form)).length === 0;

  function update(key: "email" | "password", value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    const single = validateLoginField(next, key);
    setErrors((current) => {
      const copy = { ...current };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  function blurField(key: "email" | "password"): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const single = validateLoginField(form, key);
    setErrors((current) => {
      const copy = { ...current };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateLoginForm(form);
    setErrors(validation);
    setTouched({ email: true, password: true });
    setServerCode(null);
    if (Object.keys(validation).length > 0) return;
    const email = form.email.trim().toLowerCase();
    try {
      await login.mutateAsync({ email, password: form.password });
      navigate("/", { replace: true });
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <Section>
      <div ref={scope} className="flex flex-col">
      <div data-rise className="flex items-center gap-2">
        <FiLogIn
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Đăng nhập
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Chào mừng trở lại. Nhập email và mật khẩu để tiếp tục.
      </p>
      {(state?.verified || state?.registered) && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-brand/40 bg-brand/10 p-3 text-sm text-zinc-900 dark:border-brand/30 dark:bg-brand/10 dark:text-zinc-100"
        >
          {state?.verified
            ? "Xác minh thành công. Mời bạn đăng nhập."
            : "Đăng ký thành công. Mời bạn đăng nhập."}
        </p>
      )}
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể đăng nhập"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      <form data-rise onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vidu@email.com"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          onBlur={() => blurField("email")}
          error={touched.email && errors.email ? toVietnameseMessage(errors.email) : undefined}
          icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Mật khẩu"
          name="password"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Mật khẩu của bạn"
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          onBlur={() => blurField("password")}
          error={touched.password && errors.password ? toVietnameseMessage(errors.password) : undefined}
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
          disabled={login.isPending || !canSubmit}
          icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto sm:self-start"
        >
          {login.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>
      <div data-rise className="mt-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
        <Link
          to="/forgot-password"
          className="text-zinc-900 underline decoration-brand decoration-2 underline-offset-2 hover:bg-brand/15 dark:text-brand"
        >
          Quên mật khẩu?
        </Link>
        <Link
          to="/register"
          className="text-zinc-900 underline decoration-brand decoration-2 underline-offset-2 hover:bg-brand/15 dark:text-brand"
        >
          Chưa có tài khoản? Đăng ký
        </Link>
      </div>
      </div>
    </Section>
  );
}
