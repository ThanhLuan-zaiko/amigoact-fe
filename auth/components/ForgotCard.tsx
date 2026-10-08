import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiKey, FiMail, FiSend } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useForgotPassword } from "../hooks.ts";
import { validateEmailValue } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";

export function ForgotCard(): ReactElement {
  const forgot = useForgotPassword();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function update(value: string): void {
    setEmail(value);
    setEmailError(validateEmailValue(value));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const invalid = validateEmailValue(email);
    setEmailError(invalid);
    setServerCode(null);
    setSent(false);
    if (invalid) return;
    try {
      await forgot.mutateAsync(email.trim().toLowerCase());
      setSent(true);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <BentoCard className="md:col-span-4 md:col-start-2 lg:col-span-6 lg:col-start-4">
      <div className="flex items-center gap-2">
        <FiKey
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Quên mật khẩu
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Nhập email đăng ký. Nếu tài khoản tồn tại, mã đặt lại sẽ được gửi tới
        hộp thư của bạn.
      </p>
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể gửi mã"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      {sent && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          Yêu cầu đã được ghi nhận.{" "}
          <Link to="/reset-password" className="font-semibold hover:underline">
            Nhập mã đặt lại
          </Link>
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
          onChange={(event) => update(event.target.value)}
          error={emailError ? toVietnameseMessage(emailError) : undefined}
          icon={<FiMail className="h-4 w-4" aria-hidden="true" />}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={forgot.isPending}
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
        >
          {forgot.isPending ? "Đang gửi…" : "Gửi mã đặt lại"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Nhớ mật khẩu rồi?{" "}
        <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          Đăng nhập
        </Link>
      </p>
    </BentoCard>
  );
}
