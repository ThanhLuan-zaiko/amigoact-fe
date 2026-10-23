import type { ReactElement } from "react";
import { TagField } from "../../core/components/TagField.tsx";
import { useMyTags } from "../tags-hooks.ts";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  disabled?: boolean;
  hint?: string;
}

// Activity form picker. Tags come from the author's personal list.
export function TagInput({
  label = "Thẻ",
  value,
  onChange,
  max = 10,
  disabled = false,
  hint = "Chọn thẻ bạn đã tạo, tối đa 10. Gõ tên mới rồi Enter để thêm thẻ đó vào danh sách của bạn.",
}: TagInputProps): ReactElement {
  const tags = useMyTags();
  return (
    <TagField
      label={label}
      value={value}
      onChange={onChange}
      suggestions={(tags.data ?? []).map((tag) => ({
        name: tag.name,
        slug: tag.slug,
      }))}
      suggestionsError={tags.isError}
      max={max}
      disabled={disabled}
      hint={hint}
    />
  );
}
