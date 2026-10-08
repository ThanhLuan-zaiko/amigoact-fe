import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiPhone, FiUser, FiUserPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useRiseIn } from "../../core/motion.ts";
import { useLogin, useRegister } from "../hooks.ts";
import { validateRegisterField, validateRegisterForm, type FieldErrors } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";
import { VisibilityToggle } from "./VisibilityToggle.tsx";

export function RegisterCard(): ReactElement {
  const navigate = useNavigate();
  const register = useRegister();
  const login = useLogin();
  const busy = register.isPending || login.isPending;
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const scope = useRiseIn<HTMLDivElement>();

  function update(
    key: "fullName" | "email" | "phone" | "password" | "confirmPassword",
    value: string,
  ): void {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((current) => {
      const copy = { ...current };
      const single = validateRegisterField(next, key);
      if (single) copy[key] = single;
      else delete copy[key];
      if (key === "password") {
        const confirm = validateRegisterField(next, "confirmPassword");
        if (confirm) copy.confirmPassword = confirm;
        else delete copy.confirmPassword;
      }
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateRegisterForm(form);
    setErrors(validation);
    setServerCode(null);
    if (Object.keys(validation).length > 0) return;
    const email = form.email.trim().toLowerCase();
    try {
      await register.mutateAsync({
        email,
        phone: form.phone.replace(/[\s.]/g, ""),
        password: form.password,
        full_name: form.fullName.trim(),
      });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "EMAIL_TAKEN") setErrors({ email: error.code });
        else if (error.code === "PHONE_TAKEN") setErrors({ phone: error.code });
        else setServerCode(error.code);
      } else {
        setServerCode("REQUEST_FAILED");
      }
      return;
    }
    try {
      await login.mutateAsync({ email, password: form.password });
      navigate("/", { replace: true });
    } catch {
      navigate("/login", { state: { registered: true } });
    }
  }

  return (
    <BentoCard className="order-1 md:col-span-6 lg:order-2 lg:col-span-5">
      <div ref={scope} className="flex flex-col">
      <div data-rise className="flex items-center gap-2">
        <FiUserPlus
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Đăng ký
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Tạo tài khoản để tham gia sự kiện và ghi nhận giờ tình nguyện. Mã xác
        minh sẽ được gửi tới email của bạn.
      </p>
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể đăng ký"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      <form data-rise onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <TextField
          label="Họ và tên"
          name="fullName"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
          error={errors.fullName ? toVietnameseMessage(errors.fullName) : undefined}
          icon={<FiUser className="h-4 w-4" aria-hidden="true" />}
        />
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
          label="Số điện thoại"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0912345678"
          value={form.phone}
          onChange={(event) => update("phone", event.target.value)}
          error={errors.phone ? toVietnameseMessage(errors.phone) : undefined}
          icon={<FiPhone className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Mật khẩu"
          name="password"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          hint="Gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
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
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={form.confirmPassword}
          onChange={(event) => update("confirmPassword", event.target.value)}
          error={
            errors.confirmPassword
              ? toVietnameseMessage(errors.confirmPassword)
              : undefined
          }
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
          disabled={busy}
          icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto sm:self-start"
        >
          {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
        </Button>
      </form>
      <p data-rise className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-zinc-900 underline decoration-brand decoration-2 underline-offset-2 hover:bg-brand/15 dark:text-brand">
          Đăng nhập
        </Link>
      </p>
      </div>
    </BentoCard>
  );
}
