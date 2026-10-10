import { useState, type ReactElement } from "react";
import { FiSave } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type {
  ActivityDetail,
  ActivityInput,
  CategoryItem,
} from "../api.ts";
import { fromLocalInput, toLocalInput } from "../dates.tsx";

interface ActivityFormProps {
  categories: CategoryItem[];
  initial?: ActivityDetail;
  submitLabel: string;
  onSubmit: (input: ActivityInput) => Promise<unknown>;
  onDone?: () => void;
}

export function ActivityForm({
  categories,
  initial,
  submitLabel,
  onSubmit,
  onDone,
}: ActivityFormProps): ReactElement {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [isRemote, setIsRemote] = useState(initial?.is_remote ?? false);
  const [maxParticipants, setMaxParticipants] = useState(
    initial?.max_participants?.toString() ?? "",
  );
  const [startAt, setStartAt] = useState(toLocalInput(initial?.start_at ?? null));
  const [endAt, setEndAt] = useState(toLocalInput(initial?.end_at ?? null));
  const [deadline, setDeadline] = useState(
    toLocalInput(initial?.registration_deadline ?? null),
  );
  const [hours, setHours] = useState(
    initial?.hours_awarded?.toString() ?? "0",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!title.trim() || !startAt) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        slug: slug.trim() || null,
        description: description.trim() || null,
        category_id: categoryId || null,
        location: location.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        is_remote: isRemote,
        max_participants: maxParticipants
          ? Number(maxParticipants)
          : null,
        start_at: new Date(startAt).toISOString(),
        end_at: fromLocalInput(endAt),
        hours_awarded: Number(hours) || 0,
        registration_deadline: fromLocalInput(deadline),
      });
      onDone?.();
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3"
      aria-busy={busy}
    >
      {error && <ErrorState title="Lỗi" message={error} />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Tên hoạt động"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
          placeholder="Ngày hội hiến máu 2025"
        />
        <TextField
          label="Slug (tuỳ chọn)"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="tu-dong-tao-tu-ten"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          hint="Để trống để tự tạo từ tên."
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="act-category"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            Danh mục
          </label>
          <select
            id="act-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="min-h-[44px] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          >
            <option value="">Không phân loại</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <TextField
          label="Điểm đến"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Công viên Lê Văn Tám"
        />
        <TextField
          label="Địa chỉ cụ thể"
          name="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Số nhà, đường…"
        />
        <TextField
          label="Tỉnh/Thành phố"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Đà Nẵng"
        />
        <TextField
          label="Số người tối đa"
          name="max_participants"
          type="number"
          min={1}
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
          placeholder="Không giới hạn"
        />
        <TextField
          label="Giờ tình nguyện trao"
          name="hours"
          type="number"
          min={0}
          step="0.5"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <TextField
          label="Bắt đầu"
          name="start_at"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          required
        />
        <TextField
          label="Kết thúc"
          name="end_at"
          type="datetime-local"
          value={endAt}
          onChange={(e) => setEndAt(e.target.value)}
        />
        <TextField
          label="Hạn đăng ký"
          name="deadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <label className="flex min-h-[44px] items-center gap-2 self-end text-sm text-zinc-900 dark:text-zinc-100">
          <input
            type="checkbox"
            checked={isRemote}
            onChange={(e) => setIsRemote(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          Hoạt động trực tuyến
        </label>
      </div>
      <TextField
        label="Mô tả"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Chi tiết chương trình, yêu cầu, chuẩn bị…"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={busy || !title.trim() || !startAt}
          icon={<FiSave className="h-4 w-4" aria-hidden="true" />}
        >
          {busy ? "Đang lưu…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
