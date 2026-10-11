import { useState } from "react";
import type { FormEvent, MouseEvent as ReactMouseEvent, ReactElement } from "react";
import { FiArrowLeft, FiArrowRight, FiSave, FiType, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { StepProgress } from "../../core/components/StepProgress.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useContactForm } from "../contact-form.ts";
import { useUpdateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { validateUpdateForm } from "../schemas.ts";
import type { UpdateFieldErrors } from "../schemas.ts";
import type { DashboardOrg, JoinPolicy } from "../api.ts";
import { OrgContactFields } from "./OrgContactFields.tsx";
import { OrgPolicyChips } from "./OrgPolicyChips.tsx";

const STEP_LABELS = ["Thông tin cơ bản", "Liên hệ & pháp lý"];

interface OrgEditCardProps {
  org: DashboardOrg;
  onDone: () => void;
}

export function OrgEditCard({ org, onDone }: OrgEditCardProps): ReactElement {
  const update = useUpdateOrg();
  const [form, setForm] = useState({
    name: org.name,
    description: org.description ?? "",
  });
  const contact = useContactForm({
    email: org.email ?? "",
    phone: org.phone ?? "",
    website: org.website ?? "",
    address: org.address ?? "",
    city: org.city ?? "",
    country: org.country ?? "",
    legal_name: org.legal_name ?? "",
    license_number: org.license_number ?? "",
  });
  const [policy, setPolicy] = useState<JoinPolicy>(org.join_policy);
  const [errors, setErrors] = useState<UpdateFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const isLast = step === STEP_LABELS.length;
  const stepValidation = validateUpdateForm({ ...form, ...contact.form });
  const canContinue = !stepValidation.name && !stepValidation.description;

  function blurField(key: "name" | "description"): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const invalid = stepValidation[key] ?? null;
    setErrors((prev) => {
      const copy = { ...prev };
      if (invalid) copy[key] = invalid;
      else delete copy[key];
      return copy;
    });
  }

  function nullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  // preventDefault: swapping this button for a `type="submit"` one mid-gesture
  // lets Chromium retarget the click's activation onto the new submitter and
  // auto-submit the form (modal closes instantly). Suppressing the default
  // action blocks that retargeted activation.
  function goNext(event?: ReactMouseEvent<HTMLButtonElement>): void {
    event?.preventDefault();
    setTouched({ name: true, description: true });
    const part: UpdateFieldErrors = {};
    if (stepValidation.name) part.name = stepValidation.name;
    if (stepValidation.description) part.description = stepValidation.description;
    setErrors((prev) => ({ ...prev, ...part }));
    if (Object.keys(part).length === 0) setStep(2);
  }

  function goBack(event?: ReactMouseEvent<HTMLButtonElement>): void {
    event?.preventDefault();
    setServerCode(null);
    setStep(1);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!isLast) {
      goNext();
      return;
    }
    const validation = stepValidation;
    setErrors(validation);
    setTouched({ name: true, description: true });
    contact.validateAll();
    setServerCode(null);
    if (Object.keys(validation).length > 0) {
      if (validation.name || validation.description) setStep(1);
      return;
    }
    try {
      await update.mutateAsync({
        id: org.id,
        input: {
          name: form.name.trim(),
          description: form.description.trim(),
          join_policy: policy,
          // Backend replaces contact fields wholesale: null clears a value.
          email: nullable(contact.form.email),
          phone: nullable(contact.form.phone),
          website: nullable(contact.form.website),
          address: nullable(contact.form.address),
          city: nullable(contact.form.city),
          country: nullable(contact.form.country),
          legal_name: nullable(contact.form.legal_name),
          license_number: nullable(contact.form.license_number),
          is_personal: org.is_personal,
        },
      });
      onDone();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <StepProgress step={step} total={STEP_LABELS.length} label={STEP_LABELS[step - 1]} />
      {serverCode && (
        <ErrorState title="Không lưu được" message={toVietnameseDashboardMessage(serverCode)} />
      )}
      {step === 1 && (
        <>
          <TextField
            label="Tên tổ chức"
            name={`name-${org.id}`}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            onBlur={() => blurField("name")}
            error={touched.name && errors.name ? toVietnameseDashboardMessage(errors.name) : undefined}
            icon={<FiType className="h-4 w-4" aria-hidden="true" />}
          />
          <TextField
            label="Mô tả"
            name={`description-${org.id}`}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            onBlur={() => blurField("description")}
            error={touched.description && errors.description ? toVietnameseDashboardMessage(errors.description) : undefined}
          />
          <OrgPolicyChips value={policy} onChange={setPolicy} />
        </>
      )}
      {step === 2 && (
        <OrgContactFields
          form={contact.form}
          errors={contact.errors}
          touched={contact.touched}
          onChange={contact.change}
          onBlur={contact.blur}
        />
      )}
      {!isLast && !canContinue && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Điền đầy đủ thông tin hợp lệ để tiếp tục.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {step > 1 && (
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
            disabled={update.isPending}
            icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            {update.isPending ? "Đang lưu…" : "Lưu"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            onClick={goNext}
            disabled={!canContinue}
            icon={<FiArrowRight className="h-4 w-4" aria-hidden="true" />}
            className="w-full sm:w-auto"
          >
            Tiếp tục
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={(event) => {
            event.preventDefault();
            onDone();
          }}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
