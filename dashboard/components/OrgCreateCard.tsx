import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiPlusCircle, FiTag, FiType } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { contactPayload, emptyContact, useContactForm } from "../contact-form.ts";
import { useCreateOrg, useUploadOrgMediaFile } from "../hooks.ts";
import { toVietnameseDashboardMessage, ORG_KIND_LABELS } from "../messages.tsx";
import { assignMediaRole, ORG_KINDS, slugifyName, validateOrgField, validateOrgForm } from "../schemas.ts";
import type { PendingMedia } from "../schemas.ts";
import type { CreateOrgInput, JoinPolicy, OrgKind } from "../api.ts";
import type { OrgFieldErrors } from "../schemas.ts";
import { BusinessOrgFields } from "./BusinessOrgFields.tsx";
import { MediaPicker } from "./MediaPicker.tsx";
import { OrgContactFields } from "./OrgContactFields.tsx";
import { OrgCreateNotes } from "./OrgCreateNotes.tsx";
import { OrgPolicyChips } from "./OrgPolicyChips.tsx";

export function OrgCreateCard(): ReactElement {
  const create = useCreateOrg();
  const uploadMedia = useUploadOrgMediaFile();
  const [form, setForm] = useState<CreateOrgInput>({
    name: "",
    slug: "",
    description: "",
    kind: "organization",
    join_policy: "invite",
    tax_code: "",
    legal_rep_name: "",
    legal_rep_id: "",
    legal_rep_position: "",
  });
  const [errors, setErrors] = useState<OrgFieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const contact = useContactForm(emptyContact());

  function update(
    key: "name" | "slug" | "description" | "tax_code" | "legal_rep_name" | "legal_rep_id" | "legal_rep_position",
    value: string,
  ): void {
    const next = { ...form, [key]: value };
    if (key === "name" && (form.slug.length === 0 || form.slug === slugifyName(form.name))) {
      next.slug = slugifyName(value);
    }
    setForm(next);
    const single = validateOrgField(next, key);
    const errorKey =
      key === "tax_code" ? "taxCode" : key === "legal_rep_name" ? "legalRepName" : key === "legal_rep_id" ? "legalRepId" : key;
    setErrors((current) => {
      const copy = { ...current };
      if (single && (errorKey === "name" || errorKey === "slug" || errorKey === "description" || errorKey === "taxCode" || errorKey === "legalRepName" || errorKey === "legalRepId")) copy[errorKey] = single;
      else if (errorKey in copy) delete copy[errorKey as keyof OrgFieldErrors];
      return copy;
    });
  }

  function selectKind(kind: OrgKind): void {
    setForm((current) => ({ ...current, kind }));
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
    setCreatedName(null);
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
      setCreatedName(org.name);
      const files = pendingFiles;
      setPendingFiles([]);      if (files.length > 0) {
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
        setUploadNote(
          failedCode
            ? `${toVietnameseDashboardMessage("UPLOAD_PARTIAL")} (${done}/${files.length}, ${toVietnameseDashboardMessage(failedCode)})`
            : `Đã tải lên ${done}/${files.length} tệp. Mở mục Tệp ở trang Tổ chức để xem.`,
        );
      }
      setForm({
        name: "", slug: "", description: "", kind: form.kind, join_policy: "invite",
        tax_code: "", legal_rep_name: "", legal_rep_id: "", legal_rep_position: "",
      });
      contact.reset();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div data-rise className="flex items-center gap-2">
        <FiPlusCircle className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Tạo tổ chức mới
        </h3>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Dành cho cá nhân, doanh nghiệp, câu lạc bộ hay hội nhóm tự quản.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Chọn loại hình">
        {ORG_KINDS.map((kind) => (
          <Button
            key={kind}
            type="button"
            variant={form.kind === kind ? "primary" : "secondary"}
            onClick={() => selectKind(kind)}
            aria-pressed={form.kind === kind}
            icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
          >
            {ORG_KIND_LABELS[kind]}
          </Button>
        ))}
      </div>
      <div className="mt-3">
        <OrgPolicyChips value={form.join_policy ?? "invite"} onChange={selectPolicy} />
      </div>
      {serverCode && (
        <div className="mt-3">
          <ErrorState
            title="Không thể tạo tổ chức"
            message={toVietnameseDashboardMessage(serverCode)}
          />
        </div>
      )}
      <OrgCreateNotes createdName={createdName} uploading={uploading} uploadNote={uploadNote} />
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
        <TextField
          label="Mô tả"
          name="description"
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
          items={pendingFiles} disabled={create.isPending || uploading}
          onAdd={(picked) =>
            setPendingFiles((prev) => [
              ...prev,
              ...picked.map(({ file, decodable }) => ({
                file,
                role: "gallery" as const,
                cropped: false,
                decodable,
              })),
            ])
          }
          onRemove={(index) => setPendingFiles((prev) => prev.filter((_, i) => i !== index))}
          onRole={(index, role) => setPendingFiles((prev) => assignMediaRole(prev, index, role))}
          onCropApply={(index, file) =>
            setPendingFiles((prev) =>
              prev.map((item, i) => (i === index ? { ...item, file, cropped: true } : item)),
            )
          }
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
    </BentoCard>
  );
}
