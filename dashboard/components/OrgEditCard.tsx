import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiSave, FiType, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useUpdateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import {
  validateContactField,
  validateUpdateForm,
  type ContactKey,
  type UpdateFieldErrors,
  type UpdateOrgForm,
} from "../schemas.ts";
import type { DashboardOrg, JoinPolicy } from "../api.ts";
import { OrgContactFields } from "./OrgContactFields.tsx";
import { OrgPolicyChips } from "./OrgPolicyChips.tsx";

interface OrgEditCardProps {
  org: DashboardOrg;
  onDone: () => void;
}

export function OrgEditCard({ org, onDone }: OrgEditCardProps): ReactElement {
  const update = useUpdateOrg();
  const [form, setForm] = useState<UpdateOrgForm>({
    name: org.name,
    description: org.description ?? "",
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

  function markField(key: keyof UpdateOrgForm, invalid: string | null): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => {
      const copy = { ...prev };
      if (invalid) copy[key] = invalid;
      else delete copy[key];
      return copy;
    });
  }

  function blurField(key: "name" | "description"): void {
    markField(key, validateUpdateForm(form)[key] ?? null);
  }

  function blurContact(key: ContactKey): void {
    markField(key, validateContactField(form, key));
  }

  function changeContact(key: ContactKey, value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((prev) => {
      const copy = { ...prev };
      const single = validateContactField(next, key);
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  function nullable(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateUpdateForm(form);
    setErrors(validation);
    setTouched({
      name: true, description: true, email: true, phone: true, website: true,
      address: true, city: true, country: true, legal_name: true, license_number: true,
    });
    setServerCode(null);
    if (Object.keys(validation).length > 0) return;
    try {
      await update.mutateAsync({
        id: org.id,
        input: {
          name: form.name.trim(),
          description: form.description.trim(),
          join_policy: policy,
          // Backend replaces contact fields wholesale: null clears a value.
          email: nullable(form.email),
          phone: nullable(form.phone),
          website: nullable(form.website),
          address: nullable(form.address),
          city: nullable(form.city),
          country: nullable(form.country),
          legal_name: nullable(form.legal_name),
          license_number: nullable(form.license_number),
          is_personal: org.is_personal,
        },
      });
      onDone();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-3">
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
      <TextField
        label="Mô tả"
        name={`description-${org.id}`}
        value={form.description}
        onChange={(event) => setForm({ ...form, description: event.target.value })}
        onBlur={() => blurField("description")}
        error={touched.description && errors.description ? toVietnameseDashboardMessage(errors.description) : undefined}
      />
      <OrgContactFields
        form={form}
        errors={errors}
        touched={touched}
        onChange={changeContact}
        onBlur={blurContact}
      />
      <OrgPolicyChips value={policy} onChange={setPolicy} />
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
          onClick={onDone}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
