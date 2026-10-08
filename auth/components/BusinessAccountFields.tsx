import type { ReactElement } from "react";
import { FiBriefcase, FiCreditCard, FiHash, FiUser } from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseMessage } from "../messages.tsx";
import type { FieldErrors, RegisterForm } from "../schemas.ts";

interface BusinessFieldsProps {
  form: RegisterForm;
  errors: FieldErrors;
  touched: Record<string, boolean>;
  onUpdate: (key: "companyName" | "taxCode" | "legalRepName" | "legalRepId" | "legalRepPosition", value: string) => void;
  onBlurField: (key: string) => void;
}

function showError(touched: Record<string, boolean>, code: string | undefined, key: string): string | undefined {
  return touched[key] && code ? toVietnameseMessage(code) : undefined;
}

export function BusinessAccountFields({ form, errors, touched, onUpdate, onBlurField }: BusinessFieldsProps): ReactElement {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <TextField
        label="Tên công ty"
        name="companyName"
        placeholder="Công ty TNHH ABC"
        value={form.companyName}
        onChange={(event) => onUpdate("companyName", event.target.value)}
        onBlur={() => onBlurField("companyName")}
        error={showError(touched, errors.companyName, "companyName")}
        icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Mã số thuế"
        name="taxCode"
        inputMode="numeric"
        placeholder="0312345678"
        value={form.taxCode}
        onChange={(event) => onUpdate("taxCode", event.target.value)}
        onBlur={() => onBlurField("taxCode")}
        error={showError(touched, errors.taxCode, "taxCode")}
        icon={<FiHash className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Người đại diện pháp luật"
        name="legalRepName"
        placeholder="Nguyễn Văn A"
        value={form.legalRepName}
        onChange={(event) => onUpdate("legalRepName", event.target.value)}
        onBlur={() => onBlurField("legalRepName")}
        error={showError(touched, errors.legalRepName, "legalRepName")}
        icon={<FiUser className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="CCCD người đại diện"
        name="legalRepId"
        inputMode="numeric"
        placeholder="12 chữ số"
        value={form.legalRepId}
        onChange={(event) => onUpdate("legalRepId", event.target.value)}
        onBlur={() => onBlurField("legalRepId")}
        error={showError(touched, errors.legalRepId, "legalRepId")}
        icon={<FiCreditCard className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Chức danh (tùy chọn)"
        name="legalRepPosition"
        placeholder="Giám đốc"
        value={form.legalRepPosition}
        onChange={(event) => onUpdate("legalRepPosition", event.target.value)}
        icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
      />
    </div>
  );
}
