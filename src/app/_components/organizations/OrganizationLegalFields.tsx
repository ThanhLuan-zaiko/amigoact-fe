import type { FieldErrors } from "@/lib/account";
import {
  LEGAL_STATUS_LABELS,
  type OrganizationDetail,
} from "@/lib/organizations";
import { TextField } from "../account/FormParts";
import { mutedText } from "../ui";

type OrganizationLegalFieldsProps = {
  organization?: OrganizationDetail;
  errors?: FieldErrors;
};

// Optional. Only a platform admin can verify these, so the form never sets the status.
export default function OrganizationLegalFields({
  organization,
  errors,
}: OrganizationLegalFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      {organization ? (
        <p className={mutedText}>
          Trạng thái: {LEGAL_STATUS_LABELS[organization.legal_status]}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Tên pháp lý"
          name="legal_name"
          defaultValue={organization?.legal_name}
          maxLength={200}
          hint="Tên đăng ký trên giấy phép, nếu khác tên hiển thị"
          errors={errors}
        />
        <TextField
          label="Mã số thuế"
          name="tax_code"
          defaultValue={organization?.tax_code}
          maxLength={30}
          hint="10 chữ số, hoặc 13 chữ số với chi nhánh"
          errors={errors}
        />
      </div>
      <TextField
        label="Số giấy phép hoặc quyết định thành lập"
        name="license_number"
        defaultValue={organization?.license_number}
        maxLength={200}
        errors={errors}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Người đại diện pháp luật"
          name="legal_rep_name"
          defaultValue={organization?.legal_rep_name}
          maxLength={200}
          errors={errors}
        />
        <TextField
          label="Chức vụ người đại diện"
          name="legal_rep_position"
          defaultValue={organization?.legal_rep_position}
          maxLength={200}
          errors={errors}
        />
      </div>
    </div>
  );
}
