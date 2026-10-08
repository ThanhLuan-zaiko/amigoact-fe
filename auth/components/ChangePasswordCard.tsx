import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiKey, FiLock } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useChangePassword } from "../hooks.ts";
import { validateChangeField, type FieldErrors } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";
import { VisibilityToggle } from "./VisibilityToggle.tsx";

export function ChangePasswordCard(): ReactElement {
  const change = useChangePassword();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  function update(key: "current" | "next" | "confirm", value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((current) => {
      const copy = { ...current };
      const single = validateChangeField(next, key);
      if (single) copy[key] = single;
      else delete copy[key];
      if (key === "next") {
        const confirm = validateChangeField(next, "confirm");
        if (confirm) copy.confirm = confirm;
        else delete copy.confirm;
      }
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    (["current", "next", "confirm"] as const).forEach((key) => {
      const single = validateChangeField(form, key);
      if (single) nextErrors[key] = single;
    });
    setErrors(nextErrors);
    setServerCode(null);
    setDone(false);
    if (Object.keys(nextErrors).length > 0) return;
    try {
      await change.mutateAsync({
        current_password: form.current,
        new_password: form.next,
      });
      setForm({ current: "", next: "", confirm: "" });
      setDone(true);
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
          Đổi mật khẩu
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Phiên hiện tại được giữ lại, mọi thiết bị khác sẽ phải đăng nhập lại.
      </p>
      {serverCode && (
        <div className="mt-4">
          <ErrorState
            title="Không thể đổi mật khẩu"
            message={toVietnameseMessage(serverCode)}
          />
        </div>
      )}
      {done && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          Đổi mật khẩu thành công.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        <TextField
          label="Mật khẩu hiện tại"
          name="current"
          type={showPasswords ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Mật khẩu đang dùng"
          value={form.current}
          onChange={(event) => update("current", event.target.value)}
          error={errors.current ? toVietnameseMessage(errors.current) : undefined}
          icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
          trailing={
            <VisibilityToggle
              visible={showPasswords}
              onToggle={() => setShowPasswords((value) => !value)}
            />
          }
        />
        <TextField
          label="Mật khẩu mới"
          name="next"
          type={showPasswords ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự"
          value={form.next}
          onChange={(event) => update("next", event.target.value)}
          error={errors.next ? toVietnameseMessage(errors.next) : undefined}
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
          disabled={change.isPending}
          icon={<FiKey className="h-4 w-4" aria-hidden="true" />}
        >
          {change.isPending ? "Đang đổi…" : "Đổi mật khẩu"}
        </Button>
      </form>
    </BentoCard>
  );
}
