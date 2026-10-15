import type { ReactElement } from "react";
import { FiTag, FiType } from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { CreateOrgInput } from "../api.ts";
import type { OrgFieldErrors } from "../schemas.ts";

export type BusinessKey =
  | "tax_code"
  | "legal_rep_name"
  | "legal_rep_id"
  | "legal_rep_position";

interface BusinessOrgFieldsProps {
  form: Pick<CreateOrgInput, BusinessKey>;
  errors: OrgFieldErrors;
  onChange: (key: BusinessKey, value: string) => void;
}

export function BusinessOrgFields({ form, errors, onChange }: BusinessOrgFieldsProps): ReactElement {
  return (
    <>
      <TextField
        label="Mã số thuế"
        name="tax_code"
        placeholder="0312345678"
        value={form.tax_code ?? ""}
        onChange={(event) => onChange("tax_code", event.target.value)}
        error={errors.taxCode ? toVietnameseDashboardMessage(errors.taxCode) : undefined}
        icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Người đại diện pháp luật"
        name="legal_rep_name"
        placeholder="Nguyễn Văn A"
        value={form.legal_rep_name ?? ""}
        onChange={(event) => onChange("legal_rep_name", event.target.value)}
        error={errors.legalRepName ? toVietnameseDashboardMessage(errors.legalRepName) : undefined}
        icon={<FiType className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="CCCD người đại diện"
        name="legal_rep_id"
        placeholder="12 chữ số"
        value={form.legal_rep_id ?? ""}
        onChange={(event) => onChange("legal_rep_id", event.target.value)}
        error={errors.legalRepId ? toVietnameseDashboardMessage(errors.legalRepId) : undefined}
        icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Chức danh (tùy chọn)"
        name="legal_rep_position"
        placeholder="Giám đốc"
        value={form.legal_rep_position ?? ""}
        onChange={(event) => onChange("legal_rep_position", event.target.value)}
        error={errors.legalRepPosition ? toVietnameseDashboardMessage(errors.legalRepPosition) : undefined}
        icon={<FiTag className="h-4 w-4" aria-hidden="true" />}
      />
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Thông tin pháp lý dùng để xác minh tổ chức. Bạn có thể chỉnh sửa sau
        này; mọi thay đổi được ghi vào nhật ký hoạt động.
      </p>
    </>
  );
}
