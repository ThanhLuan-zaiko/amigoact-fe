import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiSave, FiType, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useUpdateOrg } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { validateUpdateForm, type UpdateFieldErrors } from "../schemas.ts";
import type { DashboardOrg } from "../api.ts";

interface OrgEditCardProps {
  org: DashboardOrg;
  onDone: () => void;
}

export function OrgEditCard({ org, onDone }: OrgEditCardProps): ReactElement {
  const update = useUpdateOrg();
  const [form, setForm] = useState({ name: org.name, description: org.description ?? "" });
  const [errors, setErrors] = useState<UpdateFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);

  function blurField(key: "name" | "description"): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    const next = { ...form };
    const single = validateUpdateForm(next)[key];
    setErrors((prev) => {
      const copy = { ...prev };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateUpdateForm(form);
    setErrors(validation);
    setTouched({ name: true, description: true });
    setServerCode(null);
    if (Object.keys(validation).length > 0) return;
    try {
      await update.mutateAsync({
        id: org.id,
        input: { name: form.name.trim(), description: form.description.trim() },
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
