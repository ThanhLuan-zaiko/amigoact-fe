import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiCalendar, FiMapPin, FiSave, FiUser, FiUsers, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useUpdateProfile } from "../hooks.ts";
import { GENDER_LABELS, toVietnameseMessage } from "../messages.tsx";
import { validateProfileField, validateProfileForm, type FieldErrors, type ProfileForm } from "../schemas.ts";
import type { ProfileGender, SessionProfile } from "../api.ts";

const GENDERS: ProfileGender[] = ["male", "female", "other", "unspecified"];
const GENDER_ICONS = [FiUser, FiUser, FiUsers, FiUsers];

interface ProfileEditCardProps {
  profile: SessionProfile;
  onDone: () => void;
}

export function ProfileEditCard({ profile, onDone }: ProfileEditCardProps): ReactElement {
  const update = useUpdateProfile();
  const [form, setForm] = useState<ProfileForm>({
    fullName: profile.full_name,
    dateOfBirth: profile.date_of_birth ?? "",
    gender: profile.gender ?? "unspecified",
    address: profile.address ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverCode, setServerCode] = useState<string | null>(null);

  function change(key: keyof ProfileForm, value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    const single = validateProfileField(next, key);
    setErrors((prev) => {
      const copy = { ...prev };
      if (single) copy[key] = single;
      else delete copy[key];
      return copy;
    });
  }

  function blurField(key: keyof ProfileForm): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    change(key, form[key]);
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const validation = validateProfileForm(form);
    setErrors(validation);
    setTouched({ fullName: true, dateOfBirth: true, address: true });
    setServerCode(null);
    if (Object.keys(validation).length > 0) return;
    try {
      await update.mutateAsync({
        full_name: form.fullName.trim(),
        date_of_birth: form.dateOfBirth.trim() || null,
        gender: form.gender === "unspecified" ? null : (form.gender as ProfileGender),
        address: form.address.trim() || null,
      });
      onDone();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-3">
      {serverCode && (
        <ErrorState title="Không lưu được" message={toVietnameseMessage(serverCode)} />
      )}
      <TextField
        label="Họ và tên"
        name="full_name"
        value={form.fullName}
        onChange={(event) => change("fullName", event.target.value)}
        onBlur={() => blurField("fullName")}
        error={touched.fullName && errors.fullName ? toVietnameseMessage(errors.fullName) : undefined}
        icon={<FiUser className="h-4 w-4" aria-hidden="true" />}
      />
      <TextField
        label="Ngày sinh"
        name="date_of_birth"
        type="date"
        value={form.dateOfBirth}
        onChange={(event) => change("dateOfBirth", event.target.value)}
        onBlur={() => blurField("dateOfBirth")}
        error={touched.dateOfBirth && errors.dateOfBirth ? toVietnameseMessage(errors.dateOfBirth) : undefined}
        icon={<FiCalendar className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Giới tính</p>
        <div role="group" aria-label="Giới tính" className="flex flex-wrap gap-2">
          {GENDERS.map((gender, index) => {
            const GenderIcon = GENDER_ICONS[index];
            return (
              <Button
                key={gender}
                type="button"
                variant={form.gender === gender ? "primary" : "secondary"}
                onClick={() => setForm({ ...form, gender })}
                aria-pressed={form.gender === gender}
                icon={<GenderIcon className="h-4 w-4" aria-hidden="true" />}
              >
                {GENDER_LABELS[gender]}
              </Button>
            );
          })}
        </div>
      </div>
      <TextField
        label="Địa chỉ"
        name="address"
        placeholder="Số nhà, đường, quận/huyện, tỉnh/thành…"
        value={form.address}
        onChange={(event) => change("address", event.target.value)}
        onBlur={() => blurField("address")}
        error={touched.address && errors.address ? toVietnameseMessage(errors.address) : undefined}
        icon={<FiMapPin className="h-4 w-4" aria-hidden="true" />}
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
