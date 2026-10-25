import type { ReactElement } from "react";
import { UnsavedGuard } from "../../core/components/UnsavedGuard.tsx";
import type { VolunteerProfile } from "../api.ts";
import { useVolunteerDraft } from "../hooks.ts";
import { ContactsCard } from "./ContactsCard.tsx";
import { SkillPickerCard } from "./SkillPickerCard.tsx";
import { VolunteerProfileCard } from "./VolunteerProfileCard.tsx";
import { VolunteerSaveBar } from "./VolunteerSaveBar.tsx";

// One form, one save: every section edits the same draft and the bar saves
// whatever differs from the server. Inputs lock while a save is in flight.
export function VolunteerForm({
  profile,
}: {
  profile: VolunteerProfile;
}): ReactElement {
  const form = useVolunteerDraft(profile);

  return (
    <form
      noValidate
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        void form.save();
      }}
    >
      <UnsavedGuard active={form.dirty} />
      <fieldset disabled={form.saving} className="contents">
        <VolunteerProfileCard
          value={form.draft.profile}
          errors={form.fieldErrors}
          onChange={form.setProfile}
        />
        <SkillPickerCard
          picks={form.draft.skills}
          onToggle={form.toggleSkill}
          onLevel={form.setSkillLevel}
        />
        <ContactsCard
          contacts={form.draft.contacts}
          input={form.draft.contactInput}
          errors={form.contactErrors}
          onInputChange={form.setContactInput}
          onAdd={form.addContact}
          onRemove={form.removeContact}
        />
      </fieldset>
      <VolunteerSaveBar
        dirty={form.dirty}
        saving={form.saving}
        error={form.error}
      />
    </form>
  );
}
