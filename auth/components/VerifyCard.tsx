import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiRefreshCw, FiShield } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useResendVerification, useVerifyEmail } from "../hooks.ts";
import { validateCodeValue, validateEmailValue, validateVerifyField } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";

export function VerifyCard(): ReactElement {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const [email, setEmail] = useState(state?.email ?? "");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  function update(key: "email" | "code", value: string): void {
    const next = key === "email" ? { email: value, code } : { email, code: value };
    if (key === "email") setEmail(value);
    else setCode(value);
    const single = validateVerifyField(next, key);
    setErrors((current) => {
      const copy = { ...current };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    const emailError = validateEmailValue(email);
    if (emailError) nextErrors.email = emailError;
    const codeError = validateCodeValue(code);
    if (codeError) nextErrors.code = codeError;
    setErrors(nextErrors);
    setServerCode(null);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await verify.mutateAsync({
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      navigate("/login", { state: { verified: true }, replace: true });
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  async function handleResend(): Promise<void> {
    const emailError = validateEmailValue(email);
    setErrors((current) => ({ ...current, email: emailError ?? undefined }));
    setResent(false);
    if (emailError) return;
    try {
      await resend.mutateAsync(email.trim().toLowerCase());
      setResent(true);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <BentoCard className="md:col-span-4 md:col-start-2 lg:col-span-6 lg:col-start-4">
      <div className="flex items-center gap-2">
        <FiShield
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Xác minh email
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Nhập mã 6 số đã gửi tới hộp thư của bạn để kích hoạt tài khoản.
      </p>
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể xác minh"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      {resent && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          Đã gửi lại mã mới. Vui lòng kiểm tra hộp thư.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vidu@email.com"
          value={email}
          onChange={(event) => update("email", event.target.value)}
          error={errors.email ? toVietnameseMessage(errors.email) : undefined}
          icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Mã xác minh"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(event) => update("code", event.target.value)}
          error={errors.code ? toVietnameseMessage(errors.code) : undefined}
          icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={verify.isPending}
          icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
        >
          {verify.isPending ? "Đang xác minh…" : "Xác minh"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={resend.isPending}
          onClick={handleResend}
          icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
        >
          {resend.isPending ? "Đang gửi lại…" : "Gửi lại mã"}
        </Button>
      </form>
    </BentoCard>
  );
}
