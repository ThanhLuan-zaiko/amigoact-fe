import type { ReactElement } from "react";
import { SelectField } from "./SelectField.tsx";
import { TagField, type TagSuggestion } from "./TagField.tsx";
import { TextField } from "./TextField.tsx";

// Input values shared by the activity create/edit form and the chat quick
// create dialog. Dates stay in datetime-local format until submit.
export interface ActivityFieldValues {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  location: string;
  address: string;
  city: string;
  isRemote: boolean;
  maxParticipants: string;
  startAt: string;
  endAt: string;
  deadline: string;
  hours: string;
  tags: string[];
}

export interface CategoryOption {
  id: string;
  name: string;
}

interface ActivityFieldsProps {
  values: ActivityFieldValues;
  onChange: (patch: Partial<ActivityFieldValues>) => void;
  categories: CategoryOption[];
  tagSuggestions: TagSuggestion[];
  tagSuggestionsError: boolean;
  tagSuggestionsLoading?: boolean;
  disabled: boolean;
}

// Renders as a flat list inside the caller's <form> flex column.
export function ActivityFields({
  values,
  onChange,
  categories,
  tagSuggestions,
  tagSuggestionsError,
  tagSuggestionsLoading = false,
  disabled,
}: ActivityFieldsProps): ReactElement {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label="Tên hoạt động"
          name="title"
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          required
          minLength={3}
          placeholder="Ngày hội hiến máu 2025"
        />
        <TextField
          label="Slug (tuỳ chọn)"
          name="slug"
          value={values.slug}
          onChange={(event) => onChange({ slug: event.target.value })}
          placeholder="tu-dong-tao-tu-ten"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          hint="Để trống để tự tạo từ tên."
        />
        <SelectField
          label="Danh mục"
          name="category_id"
          value={values.categoryId}
          onChange={(value) => onChange({ categoryId: value })}
          options={[
            { value: "", label: "Không phân loại" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <TextField
          label="Điểm đến"
          name="location"
          value={values.location}
          onChange={(event) => onChange({ location: event.target.value })}
          placeholder="Công viên Lê Văn Tám"
        />
        <TextField
          label="Địa chỉ cụ thể"
          name="address"
          value={values.address}
          onChange={(event) => onChange({ address: event.target.value })}
          placeholder="Số nhà, đường…"
        />
        <TextField
          label="Tỉnh/Thành phố"
          name="city"
          value={values.city}
          onChange={(event) => onChange({ city: event.target.value })}
          placeholder="Đà Nẵng"
        />
        <TextField
          label="Số người tối đa"
          name="max_participants"
          type="number"
          min={1}
          value={values.maxParticipants}
          onChange={(event) =>
            onChange({ maxParticipants: event.target.value })
          }
          placeholder="Không giới hạn"
        />
        <TextField
          label="Giờ tình nguyện trao"
          name="hours"
          type="number"
          min={0}
          step="0.5"
          value={values.hours}
          onChange={(event) => onChange({ hours: event.target.value })}
        />
        <TextField
          label="Bắt đầu"
          name="start_at"
          type="datetime-local"
          value={values.startAt}
          onChange={(event) => onChange({ startAt: event.target.value })}
          required
        />
        <TextField
          label="Kết thúc"
          name="end_at"
          type="datetime-local"
          value={values.endAt}
          onChange={(event) => onChange({ endAt: event.target.value })}
        />
        <TextField
          label="Hạn đăng ký"
          name="deadline"
          type="datetime-local"
          value={values.deadline}
          onChange={(event) => onChange({ deadline: event.target.value })}
        />
        <label className="flex min-h-[44px] items-center gap-2 self-end text-sm text-zinc-900 dark:text-zinc-100">
          <input
            type="checkbox"
            checked={values.isRemote}
            onChange={(event) => onChange({ isRemote: event.target.checked })}
            className="h-4 w-4 accent-zinc-900 dark:accent-zinc-100"
          />
          Hoạt động trực tuyến
        </label>
      </div>
      <TagField
        label="Thẻ"
        value={values.tags}
        onChange={(tags) => onChange({ tags })}
        suggestions={tagSuggestions}
        suggestionsError={tagSuggestionsError}
        loading={tagSuggestionsLoading}
        max={10}
        disabled={disabled}
        hint="Chọn thẻ bạn đã tạo, tối đa 10. Gõ tên mới rồi Enter để thêm thẻ đó vào danh sách của bạn."
      />
      <TextField
        label="Mô tả"
        name="description"
        value={values.description}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder="Chi tiết chương trình, yêu cầu, chuẩn bị…"
      />
    </>
  );
}
