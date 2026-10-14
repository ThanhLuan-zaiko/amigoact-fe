import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { FiSave, FiUser } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextArea } from "../../core/components/TextArea.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useUpdateProfile } from "../hooks.ts";
import {
  PROFILE_TOAST,
  fieldText,
  profileMessage,
  toastProfileBlocked,
  toastProfileError,
} from "../messages.tsx";
import { profileFieldErrors, profilePayload } from "../validate.ts";
import type { VolunteerProfile } from "../api.ts";

const STATUS_OPTIONS = [
  { value: "", label: "Chưa cập nhật" },
  { value: "studying", label: "Đang học" },
  { value: "graduated", label: "Đã tốt nghiệp" },
  { value: "suspended", label: "Tạm ngưng" },
  { value: "working", label: "Đang đi làm" },
];

export function VolunteerProfileCard({
  profile,
}: {
  profile: VolunteerProfile;
}): ReactElement {
  const update = useUpdateProfile(PROFILE_TOAST.saved);
  const [studentCode, setStudentCode] = useState(profile.student_code ?? "");
  const [className, setClassName] = useState(profile.class_name ?? "");
  const [year, setYear] = useState(profile.enrollment_year?.toString() ?? "");
  const [school, setSchool] = useState(profile.school_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [interests, setInterests] = useState(profile.interests.join(", "));
  const [status, setStatus] = useState(profile.status ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const isStudent = status === "studying" || status === "suspended";
  const needsSchool = isStudent || status === "graduated";

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setError(null);
    const draft = { status, studentCode, className, year, school, bio, interests };
    const errors = profileFieldErrors(draft);
    const formCode = errors.form;
    const fields = { ...errors };
    delete fields.form;
    setFieldErrors(fields);
    if (formCode) setError(profileMessage(formCode));
    const codes = Object.values(errors);
    if (codes.length > 0) {
      toastProfileBlocked(PROFILE_TOAST.blocked, codes);
      return;
    }
    update.mutate(profilePayload(draft), {
      onError: (err) => setError(toastProfileError(err)),
    });
  };

  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiUser className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Hồ sơ tình nguyện viên
        </h2>
      </div>
      <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate onSubmit={onSubmit}>
        <SelectField
          label="Trạng thái"
          name="status"
          value={status}
          onChange={setStatus}
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
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          error={fieldText(fieldErrors, "student_code")}
          placeholder="VD: SV2022001"
        />
        <TextField
          label="Lớp"
          name="class_name"
          required={isStudent}
          maxLength={60}
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          error={fieldText(fieldErrors, "class_name")}
          placeholder="VD: CTK43"
        />
        <TextField
          label="Năm nhập học"
          name="enrollment_year"
          inputMode="numeric"
          maxLength={4}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          error={fieldText(fieldErrors, "enrollment_year")}
          placeholder="VD: 2022"
        />
        <TextField
          label="Trường"
          name="school_name"
          required={needsSchool}
          maxLength={160}
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          error={fieldText(fieldErrors, "school_name")}
          placeholder="VD: Đại học Bách Khoa"
        />
        <TextField
          label="Sở thích (phân cách bằng dấu phẩy)"
          name="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          error={fieldText(fieldErrors, "interests")}
          hint="Tối đa 20 mục. Sau khi lưu, danh sách được sắp xếp lại."
          placeholder="VD: biển, dã ngoại, lập trình"
          className="sm:col-span-2"
        />
        <TextArea
          label="Giới thiệu bản thân"
          name="bio"
          rows={4}
          maxLength={2000}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Chia sẻ đôi nét về bạn với các nhà tổ chức…"
          className="sm:col-span-2"
        />
        {error && (
          <p role="alert" className="text-xs text-red-600 sm:col-span-2 dark:text-red-400">
            {error}
          </p>
        )}
        <div className="sm:col-span-2">
          <Button
            type="submit"
            variant="primary"
            disabled={update.isPending}
            icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
          >
            {update.isPending ? "Đang lưu…" : "Lưu hồ sơ"}
          </Button>
        </div>
      </form>
    </Section>
  );
}
