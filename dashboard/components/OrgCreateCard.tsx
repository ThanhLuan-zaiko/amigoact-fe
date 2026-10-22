import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlusCircle, FiTag, FiType } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { contactPayload, emptyContact, useContactForm } from "../contact-form.ts";
import { useCreateOrg, useUploadOrgMediaFile } from "../hooks.ts";
import { toVietnameseDashboardMessage, ORG_KIND_LABELS } from "../messages.tsx";
import { useOrgTypes } from "../structure-hooks.ts";
import { usePendingMedia } from "../pending-media.ts";
import { emptyOrgForm, kindSearchParams, ORG_KINDS, orgFormDirty, slugifyName, validateOrgField, validateOrgForm } from "../schemas.ts";
import type { CreateOrgInput, JoinPolicy, OrgKind } from "../api.ts";
import type { OrgFieldErrors } from "../schemas.ts";
import { BusinessOrgFields } from "./BusinessOrgFields.tsx";
import { MediaPicker } from "./MediaPicker.tsx";
import { OrgContactFields } from "./OrgContactFields.tsx";
import { UnsavedGuard } from "../../core/components/UnsavedGuard.tsx";
import { OrgCreateNotes } from "./OrgCreateNotes.tsx";
import { OrgPolicyChips } from "./OrgPolicyChips.tsx";

function uploadNoteFor(failedCode: string | null, done: number, total: number): string {
  if (failedCode) {
    return `${toVietnameseDashboardMessage("UPLOAD_PARTIAL")} (${done}/${total}, ${toVietnameseDashboardMessage(failedCode)})`;
  }
  return `Đã tải lên ${done}/${total} tệp. Mở mục Tệp ở trang Tổ chức để xem.`;
}

type OrgTextField = "name" | "slug" | "description" | "tax_code" | "legal_rep_name" | "legal_rep_id" | "legal_rep_position";

const FIELD_ERROR_KEYS: Record<string, keyof OrgFieldErrors> = {
  tax_code: "taxCode",
  legal_rep_name: "legalRepName",
  legal_rep_id: "legalRepId",
  legal_rep_position: "legalRepPosition",
};

function fieldErrorKey(key: OrgTextField): keyof OrgFieldErrors {
  return FIELD_ERROR_KEYS[key] ?? key;
}

export function OrgCreateCard(): ReactElement {
  const create = useCreateOrg("Đã tạo tổ chức");
  const uploadMedia = useUploadOrgMediaFile();
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get("kind");
  const orgTypes = useOrgTypes();
  const kindOptions: { code: OrgKind; label: string }[] =
    (orgTypes.data ?? []).length > 0
      ? (orgTypes.data ?? []).map((t) => ({ code: t.code as OrgKind, label: t.name }))
      : ORG_KINDS.map((k) => ({ code: k, label: ORG_KIND_LABELS[k] }));
  // ?kind= deep-links the org-type selector (e.g. /manage/orgs/create?kind=business).
  const urlKind: OrgKind = ORG_KINDS.includes(kindParam as OrgKind) ? (kindParam as OrgKind) : "organization";
  const [form, setForm] = useState<CreateOrgInput>(() => ({
    ...emptyOrgForm(),
    kind: urlKind,
  }));
  const [errors, setErrors] = useState<OrgFieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [created, setCreated] = useState<{ name: string; slug: string } | null>(null);
  const media = usePendingMedia();
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const contact = useContactForm(emptyContact());
  // The kind selector mirrors the URL, so a bare tab click is not "data at
  // risk" - the dirty baseline uses the URL kind, not the form default.
  const dirty =
    orgFormDirty({ ...form, kind: urlKind }) ||
    media.pendingFiles.length > 0 ||
    Object.values(contact.form).some((value) => value.trim() !== "");

  function update(key: OrgTextField, value: string): void {
    const next = { ...form, [key]: value };
    if (key === "name" && (form.slug.length === 0 || form.slug === slugifyName(form.name))) {
      next.slug = slugifyName(value);
    }
    setForm(next);
    const single = validateOrgField(next, key);
    const errorKey = fieldErrorKey(key);
    setErrors((current) => {
      const copy = { ...current };
      if (single) copy[errorKey] = single;
      else delete copy[errorKey];
      return copy;
    });
  }

  function selectKind(kind: OrgKind): void {
    setForm((current) => ({ ...current, kind }));
    // replace (not push): tab clicks must not stack history entries - that
    // would both spam Back and defeat UnsavedGuard's sentinel entry.
    setSearchParams((prev) => kindSearchParams(prev, kind), { replace: true });
  }

  function selectPolicy(policy: JoinPolicy): void {
    setForm((current) => ({ ...current, join_policy: policy }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateOrgForm(form);
    const contactErrors = contact.validateAll();
    setErrors(validation);
    setServerCode(null);
    setCreated(null);
    setUploadNote(null);
    if (Object.keys(validation).length > 0 || Object.keys(contactErrors).length > 0) return;
    try {
      const org = await create.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        kind: form.kind,
        join_policy: form.join_policy ?? "invite",
        ...contactPayload(contact.form),
        ...(form.kind === "business"
          ? {
              tax_code: (form.tax_code ?? "").trim(),
              legal_rep_name: (form.legal_rep_name ?? "").trim(),
              legal_rep_id: (form.legal_rep_id ?? "").trim(),
              legal_rep_position: (form.legal_rep_position ?? "").trim() || undefined,
            }
          : {}),
      });
      setCreated({ name: org.name, slug: org.slug });
      const files = media.pendingFiles;
      media.clear();
      if (files.length > 0) {
        setUploading(true);
        let done = 0;
        let failedCode: string | null = null;
        for (const item of files) {
          try {
            await uploadMedia.mutateAsync({ orgId: org.id, file: item.file, role: item.role });
            done += 1;
          } catch (error) {
            failedCode = error instanceof ApiError ? error.code : "REQUEST_FAILED";
            break;
          }
        }
        setUploading(false);
        setUploadNote(uploadNoteFor(failedCode, done, files.length));
      }
      setForm({ ...emptyOrgForm(), kind: form.kind });
      contact.reset();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiPlusCircle className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Tạo tổ chức mới
        </h3>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Dành cho cá nhân, doanh nghiệp, câu lạc bộ hay hội nhóm tự quản.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Chọn loại hình">
        {kindOptions.map((opt) => (
          <Button
            key={opt.code}
            type="button"
            variant={form.kind === opt.code ? "primary" : "secondary"}
            onClick={() => selectKind(opt.code)}
            aria-pressed={form.kind === opt.code}
            icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
          >
            {opt.label}
          </Button>
        ))}
      </div>
      <div className="mt-3"><OrgPolicyChips value={form.join_policy ?? "invite"} onChange={selectPolicy} /></div>
      {serverCode && (
        <div className="mt-3">
          <ErrorState title="Không thể tạo tổ chức" message={toVietnameseDashboardMessage(serverCode)} />
        </div>
      )}
      <OrgCreateNotes created={created} uploading={uploading} uploadNote={uploadNote} />
      <form onSubmit={handleSubmit} noValidate className="mt-3 flex flex-col gap-3">
        <TextField
          label="Tên tổ chức"
          name="name"
          placeholder="Ví dụ: Câu lạc bộ Tình nguyện Ánh Dương"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          error={errors.name ? toVietnameseDashboardMessage(errors.name) : undefined}
          icon={<FiType className="h-4 w-4" aria-hidden="true" />}
        />
        <TextField
          label="Slug"
          name="slug"
          placeholder="vi-du-cau-lac-bo"
          value={form.slug}
          onChange={(event) => update("slug", event.target.value)}
          error={errors.slug ? toVietnameseDashboardMessage(errors.slug) : undefined}
          hint="Dùng trong đường dẫn công khai của tổ chức."
          icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
        />
        <TextArea
          label="Mô tả"
          name="description"
          rows={3}
          autoGrow
          placeholder="Sứ mệnh, hoạt động chính, cách tham gia…"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          error={errors.description ? toVietnameseDashboardMessage(errors.description) : undefined}
        />
        {form.kind === "business" && (
          <BusinessOrgFields form={form} errors={errors} onChange={update} />
        )}
        <OrgContactFields
          form={contact.form}
          errors={contact.errors}
          touched={contact.touched}
          onChange={contact.change}
          onBlur={contact.blur}
        />
        <MediaPicker
          items={media.pendingFiles}
          disabled={create.isPending || uploading}
          onAdd={media.add}
          onRemove={media.remove}
          onRole={media.setRole}
          onCropApply={media.applyCrop}
        />
        <Button
          type="submit"
          variant="primary"
          disabled={create.isPending || uploading}
          icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto sm:self-start"
        >
          {create.isPending ? "Đang tạo…" : uploading ? "Đang tải tệp…" : "Tạo tổ chức"}
        </Button>
      </form>
      <UnsavedGuard active={dirty || uploading} />
    </Section>
  );
}
