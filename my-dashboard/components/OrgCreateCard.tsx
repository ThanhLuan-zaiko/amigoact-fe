import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiCheckCircle, FiPlusCircle, FiTag, FiType } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useCreateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage, ORG_KIND_LABELS } from "../messages.tsx";
import { ORG_KINDS, slugifyName, validateOrgField, validateOrgForm } from "../schemas.ts";
import type { CreateOrgInput, OrgKind } from "../api.ts";
import type { OrgFieldErrors } from "../schemas.ts";

export function OrgCreateCard(): ReactElement {
  const create = useCreateOrg();
  const [form, setForm] = useState<CreateOrgInput>({
    name: "",
    slug: "",
    description: "",
    kind: "organization",
  });
  const [errors, setErrors] = useState<OrgFieldErrors>({});
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState<string | null>(null);

  function update(key: "name" | "slug" | "description", value: string): void {
    const next = { ...form, [key]: value };
    if (key === "name" && (form.slug.length === 0 || form.slug === slugifyName(form.name))) {
      next.slug = slugifyName(value);
    }
    setForm(next);
    const single = validateOrgField(next, key);
    setErrors((current) => {
      const copy = { ...current };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  function selectKind(kind: OrgKind): void {
    setForm((current) => ({ ...current, kind }));
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateOrgForm(form);
    setErrors(validation);
    setServerCode(null);
    setCreatedName(null);
    if (Object.keys(validation).length > 0) return;
    try {
      const org = await create.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description.trim(),
        kind: form.kind,
      });
      setCreatedName(org.name);
      setForm({ name: "", slug: "", description: "", kind: form.kind });
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
      {serverCode && (
        <div className="mt-3">
          <ErrorState
            title="Không thể tạo tổ chức"
            message={toVietnameseDashboardMessage(serverCode)}
          />
        </div>
      )}
      {createdName && (
        <p
          role="status"
          className="mt-3 flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 p-3 text-sm text-zinc-900 dark:border-brand/30 dark:bg-brand/10 dark:text-zinc-100"
        >
          <FiCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Đã tạo “{createdName}”. Mời thêm thành viên và mở sự kiện đầu tiên.
        </p>
      )}
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
        <Button
          type="submit"
          variant="primary"
          disabled={create.isPending}
          icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto sm:self-start"
        >
          {create.isPending ? "Đang tạo…" : "Tạo tổ chức"}
        </Button>
      </form>
    </BentoCard>
  );
}
