import type { ReactElement } from "react";
import { TagField } from "../../core/components/TagField.tsx";
import { useMyTags } from "../../activities/tags-hooks.ts";

// Board editor picker. Tags come from the author's personal list.
export function PostTagField({
  value,
  onChange,
  disabled = false,
}: {
  orgId: string;
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}): ReactElement {
  const tags = useMyTags();
  return (
    <TagField
      value={value}
      onChange={onChange}
      suggestions={(tags.data ?? []).map((tag) => ({
        name: tag.name,
        slug: tag.slug,
      }))}
      suggestionsError={tags.isError}
      loading={tags.isPending}
      max={3}
      disabled={disabled}
      hint="Chọn thẻ bạn đã tạo, tối đa 3. Gõ tên mới rồi Enter để thêm thẻ đó vào danh sách của bạn."
    />
  );
}
