import { useEffect, useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiSave, FiType, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { UnsavedGuard } from "../../core/components/UnsavedGuard.tsx";
import { CONTACT_KEYS, useContactForm } from "../contact-form.ts";
import { useUpdateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { emptyOrgForm, validateOrgField, validateUpdateForm } from "../schemas.ts";
import type { OrgFieldErrors, UpdateFieldErrors } from "../schemas.ts";
import type { DashboardOrg } from "../api.ts";
import { BusinessOrgFields } from "./BusinessOrgFields.tsx";
import type { BusinessKey } from "./BusinessOrgFields.tsx";
import { OrgContactFields } from "./OrgContactFields.tsx";
import { OrgPolicyChips } from "./OrgPolicyChips.tsx";

// Legal fields use snake_case state but camelCase error keys.
const LEGAL_ERROR_KEYS: Record<BusinessKey, keyof OrgFieldErrors> = {
  tax_code: "taxCode",
  legal_rep_name: "legalRepName",
  legal_rep_id: "legalRepId",
  legal_rep_position: "legalRepPosition",
};

interface OrgEditCardProps {
  org: DashboardOrg;
  /** Called after a successful save - no confirm, nothing left to lose. */
  onDone: () => void;
  /** Called by "Cancel" - the host decides whether to confirm discard. */
  onCancel: () => void;
  /** Reports dirty so the host (modal) can gate its own close controls. */
  onDirtyChange?: (dirty: boolean) => void;
}

// Single scrollable form (was a 2-step wizard that hid the contact block).
// Business legal identity is editable; the backend audits every change.
export function OrgEditCard({ org, onDone, onCancel, onDirtyChange }: OrgEditCardProps): ReactElement {
  const update = useUpdateOrg("Đã lưu thay đổi.");
  // Persisted snapshot the form diffs against; re-seeded after each save so
  // "dirty" always means "differs from what's actually on the server".
  const [baseline, setBaseline] = useState(() => ({
    name: org.name,
    description: org.description ?? "",
    policy: org.join_policy,
    legal: {
      tax_code: org.tax_code ?? "",
      legal_rep_name: org.legal_rep_name ?? "",
      legal_rep_id: org.legal_rep_id ?? "",
      legal_rep_position: org.legal_rep_position ?? "",
    },
    contact: {
      email: org.email ?? "",
      phone: org.phone ?? "",
      website: org.website ?? "",
      address: org.address ?? "",
      city: org.city ?? "",
      country: org.country ?? "",
      legal_name: org.legal_name ?? "",
      license_number: org.license_number ?? "",
    },
  }));
  const [form, setForm] = useState({
    name: baseline.name,
    description: baseline.description,
  });
  const [legal, setLegal] = useState<Record<BusinessKey, string>>({
    ...baseline.legal,
  });
  const [legalErrors, setLegalErrors] = useState<OrgFieldErrors>({});
  const contact = useContactForm({ ...baseline.contact });
  const [policy, setPolicy] = useState(baseline.policy);
  const [errors, setErrors] = useState<UpdateFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const isBusiness = org.kind === "business";
  const dirty =
    form.name !== baseline.name ||
    form.description !== baseline.description ||
    policy !== baseline.policy ||
    (Object.keys(LEGAL_ERROR_KEYS) as BusinessKey[]).some(
      (key) => legal[key] !== baseline.legal[key],
    ) ||
    CONTACT_KEYS.some((key) => contact.form[key] !== baseline.contact[key]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  function blurField(key: "name" | "description"): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const invalid =
      validateUpdateForm({ ...form, ...contact.form })[key] ?? null;
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

  function changeLegal(key: BusinessKey, value: string): void {
    setLegal((prev) => ({ ...prev, [key]: value }));
    setLegalErrors((prev) => {
      const copy = { ...prev };
      delete copy[LEGAL_ERROR_KEYS[key]];
      return copy;
    });
  }

  function validateLegal(): OrgFieldErrors {
    const probe = { ...emptyOrgForm(), kind: "business" as const, ...legal };
    const result: OrgFieldErrors = {};
    for (const key of Object.keys(LEGAL_ERROR_KEYS) as BusinessKey[]) {
      const invalid = validateOrgField(probe, key);
      if (invalid) result[LEGAL_ERROR_KEYS[key]] = invalid;
    }
    return result;
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateUpdateForm({ ...form, ...contact.form });
    const invalidLegal = isBusiness ? validateLegal() : {};
    setErrors(validation);
    setLegalErrors(invalidLegal);
    setTouched({ name: true, description: true });
    contact.validateAll();
    setServerCode(null);
    if (
      Object.keys(validation).length > 0 ||
      Object.keys(invalidLegal).length > 0
    )
      return;
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
          ...(isBusiness
            ? {
                tax_code: nullable(legal.tax_code),
                legal_rep_name: nullable(legal.legal_rep_name),
                legal_rep_id: nullable(legal.legal_rep_id),
                legal_rep_position: nullable(legal.legal_rep_position),
              }
            : {}),
        },
      });
      setBaseline({
        name: form.name,
        description: form.description,
        policy,
        legal: { ...legal },
        contact: { ...contact.form },
      });
      onDone();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <UnsavedGuard active={dirty} />
      {serverCode && (
        <ErrorState title="Không lưu được" message={toVietnameseDashboardMessage(serverCode)} />
      )}
      <TextField
        label="Tên tổ chức"
        name={`name-${org.id}`}
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        onBlur={() => blurField("name")}
        error={touched.name && errors.name ? toVietnameseDashboardMessage(errors.name) : undefined}
        icon={<FiType className="h-4 w-4" aria-hidden="true" />}
      />
      <TextArea
        label="Mô tả"
        name={`description-${org.id}`}
        rows={3}
        autoGrow
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        onBlur={() => blurField("description")}
        error={touched.description && errors.description ? toVietnameseDashboardMessage(errors.description) : undefined}
      />
      <OrgPolicyChips value={policy} onChange={setPolicy} />
      {isBusiness && (
        <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Thông tin pháp lý
          </p>
          <BusinessOrgFields
            form={legal}
            errors={legalErrors}
            onChange={changeLegal}
          />
        </div>
      )}
      <OrgContactFields
        form={contact.form}
        errors={contact.errors}
        touched={contact.touched}
        onChange={contact.change}
        onBlur={contact.blur}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="primary"
          disabled={update.isPending}
          icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto"
        >
          {update.isPending ? "Đang lưu…" : "Lưu"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
