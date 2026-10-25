import type { ReactElement } from "react";
import { useState } from "react";
import { FiUser } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { fieldText } from "../messages.tsx";
import type { ProfileDraft } from "../validate.ts";
import { useMyOrgs } from "../../dashboard/hooks.ts";
import {
  useCampuses,
  useDepartments,
} from "../../dashboard/structure-hooks.ts";

const STATUS_OPTIONS = [
  { value: "", label: "Chưa cập nhật" },
  { value: "studying", label: "Đang học" },
  { value: "graduated", label: "Đã tốt nghiệp" },
  { value: "suspended", label: "Tạm ngưng" },
  { value: "working", label: "Đang đi làm" },
];

// Profile fields of the volunteer form. Controlled: the page owns the draft
// and the single save. The org picker only narrows the campus and department
// lists, so it stays local and is never saved.
export function VolunteerProfileCard({
  value,
  errors,
  onChange,
}: {
  value: ProfileDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<ProfileDraft>) => void;
}): ReactElement {
  const [orgId, setOrgId] = useState("");
  const myOrgs = useMyOrgs();
  const campuses = useCampuses(orgId || null);
  const departments = useDepartments(orgId || null);
  const isStudent = value.status === "studying" || value.status === "suspended";
  const needsSchool = isStudent || value.status === "graduated";

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiUser className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Thông tin cá nhân
        </h2>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 @md:grid-cols-2">
        <SelectField
          label="Trạng thái"
          name="status"
          value={value.status}
          onChange={(status) => onChange({ status })}
          options={STATUS_OPTIONS}
          hint={
            isStudent
              ? "Cần mã sinh viên, lớp và trường."
              : "Điền ít nhất một thông tin bên dưới."
          }
        />
        <TextField
          label="Mã sinh viên"
          name="student_code"
          required={isStudent}
          maxLength={40}
          value={value.studentCode}
          onChange={(e) => onChange({ studentCode: e.target.value })}
          error={fieldText(errors, "student_code")}
          placeholder="VD: SV2022001"
        />
        <SelectField
          label="Tổ chức (để tra cứu mã SV)"
          name="structure_org"
          value={orgId}
          onChange={(id) => {
            setOrgId(id);
            onChange({ campusId: "", departmentId: "" });
          }}
          options={[
            { value: "", label: "Chọn tổ chức" },
            ...(myOrgs.data?.items ?? []).map((o) => ({
              value: o.id,
              label: o.name,
            })),
          ]}
        />
        <SelectField
          label="Cơ sở"
          name="campus_id"
          value={value.campusId}
          onChange={(campusId) => onChange({ campusId })}
          disabled={!orgId}
          options={[
            { value: "", label: "Chọn cơ sở" },
            ...(campuses.data ?? [])
              .filter((c) => c.status === "active")
              .map((c) => ({ value: c.id, label: c.name })),
            ...(value.campusId &&
            !(campuses.data ?? []).some((c) => c.id === value.campusId)
              ? [{ value: value.campusId, label: "Cơ sở đã lưu" }]
              : []),
          ]}
        />
        <SelectField
          label="Khoa/phòng ban"
          name="department_id"
          value={value.departmentId}
          onChange={(departmentId) => onChange({ departmentId })}
          disabled={!orgId}
          options={[
            { value: "", label: "Chọn khoa/phòng" },
            ...(departments.data ?? [])
              .filter(
                (d) =>
                  d.status === "active" &&
                  (!value.campusId || d.campus_id === value.campusId),
              )
              .map((d) => ({
                value: d.id,
                label: d.code ? `${d.name} (${d.code})` : d.name,
              })),
            ...(value.departmentId &&
            !(departments.data ?? []).some((d) => d.id === value.departmentId)
              ? [{ value: value.departmentId, label: "Khoa đã lưu" }]
              : []),
          ]}
        />
        <TextField
          label="Lớp"
          name="class_name"
          required={isStudent}
          maxLength={60}
          value={value.className}
          onChange={(e) => onChange({ className: e.target.value })}
          error={fieldText(errors, "class_name")}
          placeholder="VD: CTK43"
        />
        <TextField
          label="Năm nhập học"
          name="enrollment_year"
          inputMode="numeric"
          maxLength={4}
          value={value.year}
          onChange={(e) => onChange({ year: e.target.value })}
          error={fieldText(errors, "enrollment_year")}
          placeholder="VD: 2022"
        />
        <TextField
          label="Trường"
          name="school_name"
          required={needsSchool}
          maxLength={160}
          value={value.school}
          onChange={(e) => onChange({ school: e.target.value })}
          error={fieldText(errors, "school_name")}
          placeholder="VD: Đại học Bách Khoa"
        />
        <TextField
          label="Sở thích (phân cách bằng dấu phẩy)"
          name="interests"
          value={value.interests}
          onChange={(e) => onChange({ interests: e.target.value })}
          error={fieldText(errors, "interests")}
          hint="Tối đa 20 mục. Sau khi lưu, danh sách được sắp xếp lại."
          placeholder="VD: biển, dã ngoại, lập trình"
          className="@md:col-span-2"
        />
        <TextArea
          label="Giới thiệu bản thân"
          name="bio"
          rows={4}
          maxLength={2000}
          value={value.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          placeholder="Chia sẻ đôi nét về bạn với các nhà tổ chức…"
          className="@md:col-span-2"
        />
      </div>
    </Section>
  );
}
