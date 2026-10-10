import type { ReactElement } from "react";
import {
  FiFileText,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { ContactKey, UpdateFieldErrors, UpdateOrgForm } from "../schemas.ts";

interface FieldSpec {
  key: ContactKey;
  label: string;
  placeholder: string;
  icon: ReactElement;
  type?: string;
}

const FIELDS: FieldSpec[] = [
  {
    key: "email",
    label: "Email liên hệ",
    placeholder: "lienhe@tochuc.vn",
    icon: <FiMail className="h-4 w-4" aria-hidden="true" />,
    type: "email",
  },
  {
    key: "phone",
    label: "Điện thoại liên hệ",
    placeholder: "0901234567",
    icon: <FiPhone className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "website",
    label: "Website",
    placeholder: "https://tochuc.vn",
    icon: <FiGlobe className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "address",
    label: "Địa chỉ",
    placeholder: "Số nhà, đường, phường/xã…",
    icon: <FiMapPin className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "city",
    label: "Tỉnh/Thành phố",
    placeholder: "Đà Nẵng",
    icon: <FiMapPin className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "country",
    label: "Quốc gia",
    placeholder: "Việt Nam",
    icon: <FiGlobe className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "legal_name",
    label: "Tên pháp lý",
    placeholder: "Tên đăng ký trên giấy phép",
    icon: <FiFileText className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "license_number",
    label: "Số giấy phép",
    placeholder: "Số đăng ký hoạt động",
    icon: <FiFileText className="h-4 w-4" aria-hidden="true" />,
  },
];

interface OrgContactFieldsProps {
  form: UpdateOrgForm;
  errors: UpdateFieldErrors;
  touched: Record<string, boolean>;
  onChange: (key: ContactKey, value: string) => void;
  onBlur: (key: ContactKey) => void;
}

export function OrgContactFields({
  form,
  errors,
  touched,
  onChange,
  onBlur,
}: OrgContactFieldsProps): ReactElement {
  return (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <legend className="px-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Thông tin liên hệ & pháp lý
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <TextField
            key={field.key}
            label={field.label}
            name={field.key}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            value={form[field.key]}
            onChange={(event) => onChange(field.key, event.target.value)}
            onBlur={() => onBlur(field.key)}
            error={
              touched[field.key] && errors[field.key]
                ? toVietnameseDashboardMessage(errors[field.key] as string)
                : undefined
            }
            icon={field.icon}
          />
        ))}
      </div>
    </fieldset>
  );
}
