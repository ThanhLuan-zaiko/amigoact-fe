import type { ActivityFieldValues } from "../core/components/ActivityFields.tsx";
import type { TagSuggestion } from "../core/components/TagField.tsx";
import type { ActivityDetail, ActivityInput } from "./api.ts";
import { fromLocalInput, toLocalInput } from "./dates.tsx";
import type { MyTag } from "./tags-api.ts";

// Starting values for the activity form. Edit mode reads the saved activity;
// create mode starts empty with hours at zero.
export function initialActivityValues(
  initial?: ActivityDetail,
): ActivityFieldValues {
  return {
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    categoryId: initial?.category_id ?? "",
    location: initial?.location ?? "",
    address: initial?.address ?? "",
    city: initial?.city ?? "",
    isRemote: initial?.is_remote ?? false,
    maxParticipants: initial?.max_participants?.toString() ?? "",
    startAt: toLocalInput(initial?.start_at ?? null),
    endAt: toLocalInput(initial?.end_at ?? null),
    deadline: toLocalInput(initial?.registration_deadline ?? null),
    hours: initial?.hours_awarded?.toString() ?? "0",
    tags: initial?.tags?.map((tag) => tag.name) ?? [],
  };
}

// Builds the create/update payload. Callers must check that the title and
// start time are filled before calling this.
export function toActivityInput(values: ActivityFieldValues): ActivityInput {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || null,
    description: values.description.trim() || null,
    category_id: values.categoryId || null,
    location: values.location.trim() || null,
    address: values.address.trim() || null,
    city: values.city.trim() || null,
    is_remote: values.isRemote,
    max_participants: values.maxParticipants
      ? Number(values.maxParticipants)
      : null,
    start_at: new Date(values.startAt).toISOString(),
    end_at: fromLocalInput(values.endAt),
    hours_awarded: Number(values.hours) || 0,
    registration_deadline: fromLocalInput(values.deadline),
    tags: values.tags,
  };
}

export function toTagSuggestions(tags: MyTag[] | undefined): TagSuggestion[] {
  return (tags ?? []).map((tag) => ({ name: tag.name, slug: tag.slug }));
}
