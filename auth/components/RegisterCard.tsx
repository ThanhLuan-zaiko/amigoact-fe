import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiUserPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { StepProgress } from "../../core/components/StepProgress.tsx";
import { pushToast } from "../../core/toast.ts";
import { useRegisterFlow, type RegisterFlowOutcome } from "../hooks.ts";
import { validateRegisterField, validateRegisterForm, type FieldErrors, type RegisterForm } from "../schemas.ts";
import { toVietnameseMessage } from "../messages.tsx";
import { AccountTypeStep } from "./AccountTypeStep.tsx";
import { AvatarField } from "./AvatarField.tsx";
import { BusinessAccountFields } from "./BusinessAccountFields.tsx";
import { PersonalInfoStep } from "./PersonalInfoStep.tsx";

const PERSONAL_KEYS = ["fullName", "email", "phone", "password", "confirmPassword"] as const;
const BUSINESS_KEYS = ["companyName", "taxCode", "legalRepName", "legalRepId"] as const;

const STEP_LABELS = ["Chọn loại tài khoản", "Thông tin cá nhân", "Thông tin doanh nghiệp"];

export function RegisterCard(): ReactElement {
  const navigate = useNavigate();
  const flow = useRegisterFlow("Đã cập nhật ảnh đại diện.");
  const busy = flow.isPending;
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [form, setForm] = useState<RegisterForm>({
    fullName: "", email: "", phone: "", password: "", confirmPassword: "",
    accountType: "individual", companyName: "", taxCode: "",
    legalRepName: "", legalRepId: "", legalRepPosition: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [step, setStep] = useState(1);
  const total = form.accountType === "business" ? 3 : 2;
  const current = Math.min(step, total);
  const isLast = current === total;
  const stepKeys = current === 1 ? [] : current === 2 ? PERSONAL_KEYS : BUSINESS_KEYS;
  const stepValidation = validateRegisterForm(form);
  const canContinue = (stepKeys as readonly string[]).every((key) => !stepValidation[key]);

  function update(key: Parameters<typeof validateRegisterField>[1], value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((prev) => {
      const copy = { ...prev };
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

  function markTouched(...keys: string[]): void {
    setTouched((prev) => {
      const copy = { ...prev };
      for (const key of keys) copy[key] = true;
      return copy;
    });
  }

  function blurField(key: string): void {
    markTouched(key);
    const single = validateRegisterField(form, key as Parameters<typeof validateRegisterField>[1]);
    setErrors((prev) => {
      const copy = { ...prev };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  function goNext(): void {
    if (current === 1) {
      setStep(2);
      return;
    }
    const validation = validateRegisterForm(form);
    const keys = current === 2 ? PERSONAL_KEYS : BUSINESS_KEYS;
    const part: FieldErrors = {};
    for (const key of keys) if (validation[key]) part[key] = validation[key];
    markTouched(...keys);
    setErrors((prev) => ({ ...prev, ...part }));
    if (Object.keys(part).length > 0) return;
    if (!isLast) setStep(current + 1);
  }

  function goBack(): void {
    setServerCode(null);
    setStep(Math.max(1, current - 1));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }
    const validation = validateRegisterForm(form);
    setErrors(validation);
    setServerCode(null);
    if (Object.keys(validation).length > 0) {
      if (validation.fullName || validation.email || validation.phone || validation.password || validation.confirmPassword) setStep(2);
      return;
    }
    let outcome: RegisterFlowOutcome;
    try {
      outcome = await flow.mutateAsync({ form, avatar: avatarFile });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "EMAIL_TAKEN") { setErrors({ email: error.code }); markTouched("email"); setStep(2); }
        else if (error.code === "PHONE_TAKEN") { setErrors({ phone: error.code }); markTouched("phone"); setStep(2); }
        else setServerCode(error.code);
      } else {
        setServerCode("REQUEST_FAILED");
      }
      return;
    }
    if (outcome.dest === "login") {
      navigate("/login", { state: { registered: true } });
      return;
    }
    if (outcome.avatarError) {
      pushToast({
        tone: "error",
        title: "Chưa lưu được ảnh đại diện.",
        message: `${toVietnameseMessage(outcome.avatarError)} Bạn có thể tải lại trong Hồ sơ tình nguyện.`,
      });
    }
    navigate("/", { replace: true });
  }

  return (
    <Section>
      <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
          <FiUserPlus className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          Đăng ký
        </h1>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Tạo tài khoản để tham gia sự kiện và ghi nhận giờ tình nguyện. Mã xác
        minh sẽ được gửi tới email của bạn.
      </p>
      <StepProgress step={current} total={total} label={STEP_LABELS[current - 1]} />
      {serverCode && (
        <div className="mt-4">
          <ErrorState title="Không thể đăng ký" message={toVietnameseMessage(serverCode)} />
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
        {current === 1 && (
          <AccountTypeStep value={form.accountType} onSelect={(value) => update("accountType", value)} />
        )}
        {current === 2 && (
          <>
            <PersonalInfoStep
              form={form}
              errors={errors}
              touched={touched}
              showPasswords={showPasswords}
              onUpdate={update}
              onBlurField={blurField}
              onTogglePasswords={() => setShowPasswords((value) => !value)}
            />
            <AvatarField
              file={avatarFile}
              onChange={setAvatarFile}
              disabled={busy}
            />
          </>
        )}
        {current === 3 && (
          <BusinessAccountFields form={form} errors={errors} touched={touched} onUpdate={update} onBlurField={blurField} />
        )}
        {!isLast && current > 1 && !canContinue && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Điền đầy đủ thông tin hợp lệ để tiếp tục.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {current > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
            >
              Quay lại
            </Button>
          )}
          {isLast ? (
            <Button
              type="submit"
              variant="primary"
              disabled={busy || !canContinue}
              icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
              className="w-full sm:w-auto"
            >
              {busy ? "Đang tạo tài khoản…" : "Đăng ký"}
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={goNext}
              disabled={current > 1 && !canContinue}
              icon={<FiArrowRight className="h-4 w-4" aria-hidden="true" />}
              className="w-full sm:w-auto"
            >
              Tiếp tục
            </Button>
          )}
        </div>
      </form>
      <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
        Đã có tài khoản?{" "}
        <Link to="/login" className="text-zinc-900 underline decoration-zinc-400 decoration-2 underline-offset-2 hover:bg-zinc-100 dark:text-zinc-100 dark:decoration-zinc-500 dark:hover:bg-zinc-900">
          Đăng nhập
        </Link>
      </p>
      </div>
    </Section>
  );
}
