import type { ReactElement } from "react";
import { FiTag, FiType } from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { CreateOrgInput } from "../api.ts";
import type { OrgFieldErrors } from "../schemas.ts";

type BusinessKey = "tax_code" | "legal_rep_name" | "legal_rep_id";

interface BusinessOrgFieldsProps {
  form: CreateOrgInput;
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
    </>
  );
}
