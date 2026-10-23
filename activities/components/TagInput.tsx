import type { ReactElement } from "react";
import { TagField } from "../../core/components/TagField.tsx";
import { mergeTagSuggestions } from "../../core/tag-suggestions.ts";
import { useOrgTags, useOwnedTags } from "../tags-hooks.ts";

interface TagInputProps {
  orgId: string;
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  disabled?: boolean;
  hint?: string;
}

// Activity form picker. Suggestions come from the org catalog; a new
// name is claimed when the activity is saved.
export function TagInput({
  orgId,
  label = "Thẻ",
  value,
  onChange,
  max = 10,
  disabled = false,
  hint = "Enter để thêm, tối đa 10 thẻ. Thẻ mới, kể cả thẻ từ tổ chức khác bạn sở hữu, được chép vào danh mục tổ chức này khi lưu.",
}: TagInputProps): ReactElement {
  const search = useOrgTags(orgId);
  const owned = useOwnedTags(orgId);
  return (
    <TagField
      label={label}
      value={value}
      onChange={onChange}
      suggestions={mergeTagSuggestions(
        search.data?.items ?? [],
        owned.data ?? [],
      )}
      suggestionsError={search.isError || owned.isError}
      max={max}
      disabled={disabled}
      hint={hint}
    />
  );
}
