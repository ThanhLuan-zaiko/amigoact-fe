import type { FormEvent, ReactElement } from "react";
import { useState } from "react";
import { FiSave, FiUser } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useUpdateProfile } from "../hooks.ts";
import { profileMessage } from "../messages.tsx";
import type { VolunteerProfile } from "../api.ts";

const STATUS_OPTIONS = [
  { value: "studying", label: "Đang học" },
  { value: "graduated", label: "Đã tốt nghiệp" },
];

const SELECT_CLASS =
  "min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 " +
  "text-sm text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:border-zinc-700 dark:bg-zinc-950 " +
  "dark:text-zinc-100 dark:focus-visible:outline-brand";

export function VolunteerProfileCard({
  profile,
}: {
  profile: VolunteerProfile;
}): ReactElement {
  const update = useUpdateProfile();
  const [studentCode, setStudentCode] = useState(profile.student_code ?? "");
  const [className, setClassName] = useState(profile.class_name ?? "");
  const [year, setYear] = useState(
    profile.enrollment_year?.toString() ?? "",
  );
  const [school, setSchool] = useState(profile.school_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [interests, setInterests] = useState(profile.interests.join(", "));
  const [status, setStatus] = useState(profile.status ?? "studying");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSubmit = (event: FormEvent): void => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    const parsed = year.trim() === "" ? null : Number(year);
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 1950)) {
      setError("Năm nhập học không hợp lệ.");
      return;
    }
    update.mutate(
      {
        student_code: studentCode.trim() || null,
        class_name: className.trim() || null,
        enrollment_year: parsed,
        school_name: school.trim() || null,
        bio: bio.trim() || null,
        interests: interests
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20),
        status,
      },
      {
        onSuccess: () => setSaved(true),
        onError: (err) =>
          setError(
            profileMessage(
              err instanceof ApiError ? err.code : "REQUEST_FAILED",
            ),
          ),
      },
    );
  };

  return (
    <BentoCard className="md:col-span-6 lg:col-span-8">
      <div className="flex items-center gap-2">
        <FiUser className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Hồ sơ tình nguyện viên
        </h2>
      </div>
      <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <TextField
          label="Mã sinh viên"
          name="student_code"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          placeholder="VD: SV2022001"
        />
        <TextField
          label="Lớp"
          name="class_name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="VD: CTK43"
        />
        <TextField
          label="Năm nhập học"
          name="enrollment_year"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          placeholder="VD: 2022"
        />
        <TextField
          label="Trường"
          name="school_name"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          placeholder="VD: Đại học Bách Khoa"
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="profile-status"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Trạng thái học tập
          </label>
          <select
            id="profile-status"
            className={SELECT_CLASS}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Sở thích (phân cách bằng dấu phẩy)"
          name="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="VD: biển, dã ngoại, lập trình"
          className="sm:col-span-2"
        />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label
            htmlFor="profile-bio"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Giới thiệu bản thân
          </label>
          <textarea
            id="profile-bio"
            rows={4}
            maxLength={2000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Chia sẻ đôi nét về bạn với các nhà tổ chức…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-brand"
          />
        </div>
        {error && (
          <p role="alert" className="text-xs text-red-600 sm:col-span-2 dark:text-red-400">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-xs text-emerald-600 sm:col-span-2 dark:text-emerald-400">
            Đã lưu hồ sơ.
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
    </BentoCard>
  );
}
