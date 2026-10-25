import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { ApiError } from "../core/api.ts";
import { authKeys } from "../auth/keys.ts";
import {
  getMyProfile,
  getPublicProfile,
  listSkills,
  replaceMyContacts,
  setMySkills,
  updateMyProfile,
  uploadMyAvatar,
  type ContactDraft,
  type ProfilePayload,
  type PublicVolunteer,
  type SkillItem,
  type VolunteerProfile,
} from "./api.ts";
import {
  EMPTY_CONTACT_INPUT,
  MAX_CONTACTS,
  contactFromInput,
  contactsOf,
  contactsKey,
  draftOf,
  hasContactInput,
  keysOf,
  savedKeysOf,
  skillsPayload,
  type ContactInput,
  type SavedKeys,
  type VolunteerDraft,
} from "./draft.ts";
import { profileKeys } from "./keys.ts";
import {
  PROFILE_TOAST,
  profileMessage,
  toastProfileBlocked,
  toastProfileError,
  toastProfileOk,
} from "./messages.tsx";
import {
  contactFieldErrors,
  profileFieldErrors,
  profilePayload,
  type ProfileDraft,
} from "./validate.ts";

export function useMyProfile(
  enabled = true,
): UseQueryResult<VolunteerProfile, ApiError> {
  return useQuery({
    queryKey: profileKeys.mine,
    queryFn: getMyProfile,
    staleTime: 30_000,
    retry: 1,
    enabled,
  });
}

export function useSkillsCatalog(
  enabled = true,
): UseQueryResult<SkillItem[], ApiError> {
  return useQuery({
    queryKey: profileKeys.skills,
    queryFn: listSkills,
    staleTime: 5 * 60_000,
    retry: 1,
    enabled,
  });
}

export function usePublicProfile(
  userId: string | undefined,
): UseQueryResult<PublicVolunteer, ApiError> {
  return useQuery({
    queryKey: profileKeys.public(userId ?? ""),
    queryFn: () => getPublicProfile(userId ?? ""),
    staleTime: 60_000,
    retry: 1,
    enabled: userId !== undefined,
  });
}

// Each section mutation writes its server result into the shared cache.
// Toasts are raised once by the volunteer form, not per section.
function useProfileMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<VolunteerProfile>,
): UseMutationResult<VolunteerProfile, ApiError, TArgs> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async (fresh) => {
      queryClient.setQueryData(profileKeys.mine, fresh);
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
    },
  });
}

export function useUpdateProfile(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  ProfilePayload
> {
  return useProfileMutation(updateMyProfile);
}

export function useSetSkills(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  { skill_id: string; level: number }[]
> {
  return useProfileMutation(setMySkills);
}

export function useReplaceContacts(): UseMutationResult<
  VolunteerProfile,
  ApiError,
  ContactDraft[]
> {
  return useProfileMutation(replaceMyContacts);
}

export function useUploadAvatar(
  successTitle: string,
): UseMutationResult<{ avatar_url: string }, ApiError, File> {
  const queryClient = useQueryClient();
  return useMutation({
    meta: { successToast: successTitle },
    mutationFn: uploadMyAvatar,
    onSuccess: async () => {
      // avatar_url also rides on the session payload, so shell chrome
      // (AccountSwitcher, header, drawer) refreshes with the profile card.
      await queryClient.invalidateQueries({
        queryKey: profileKeys.mine,
      });
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}

export interface VolunteerDraftState {
  draft: VolunteerDraft;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  contactErrors: Record<string, string>;
  setProfile: (patch: Partial<ProfileDraft>) => void;
  toggleSkill: (skillId: string) => void;
  setSkillLevel: (skillId: string, level: number) => void;
  setContactInput: (patch: Partial<ContactInput>) => void;
  addContact: () => void;
  removeContact: (index: number) => void;
  save: () => Promise<void>;
}

// The whole volunteer page shares one draft and one save. Sections go in a
// fixed order (profile, skills, contacts) and each one is sent only when it
// differs from the last saved key. Every request replaces its section, so
// retrying after a failure converges instead of duplicating rows.
export function useVolunteerDraft(
  profile: VolunteerProfile,
): VolunteerDraftState {
  const updateProfile = useUpdateProfile();
  const setSkills = useSetSkills();
  const replaceContacts = useReplaceContacts();
  const [draft, setDraft] = useState<VolunteerDraft>(() => draftOf(profile));
  const [saved, setSaved] = useState<SavedKeys>(() => savedKeysOf(profile));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [contactErrors, setContactErrors] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const keys = keysOf(draft);
  const dirty =
    keys.profile !== saved.profile ||
    keys.skills !== saved.skills ||
    keys.contacts !== saved.contacts ||
    hasContactInput(draft.contactInput);

  function setProfile(patch: Partial<ProfileDraft>): void {
    setDraft((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }

  function toggleSkill(skillId: string): void {
    setDraft((prev) => {
      const skills = { ...prev.skills };
      if (skillId in skills) delete skills[skillId];
      else skills[skillId] = 3;
      return { ...prev, skills };
    });
  }

  function setSkillLevel(skillId: string, level: number): void {
    setDraft((prev) =>
      skillId in prev.skills
        ? { ...prev, skills: { ...prev.skills, [skillId]: level } }
        : prev,
    );
  }

  function setContactInput(patch: Partial<ContactInput>): void {
    setDraft((prev) => ({
      ...prev,
      contactInput: { ...prev.contactInput, ...patch },
    }));
  }

  function addContact(): void {
    const problems = contactFieldErrors(
      draft.contactInput.name,
      draft.contactInput.phone,
    );
    setContactErrors(problems);
    if (Object.keys(problems).length > 0) return;
    if (draft.contacts.length >= MAX_CONTACTS) {
      setError(profileMessage("TOO_MANY_CONTACTS"));
      return;
    }
    setDraft((prev) => ({
      ...prev,
      contacts: [...prev.contacts, contactFromInput(prev.contactInput)],
      contactInput: EMPTY_CONTACT_INPUT,
    }));
    setContactErrors({});
  }

  function removeContact(index: number): void {
    setDraft((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  }

  // A half-typed contact is validated, not dropped: save either includes it
  // or stops with the field errors shown.
  async function save(): Promise<void> {
    setError(null);
    const pending = hasContactInput(draft.contactInput);
    const contactProblems: Record<string, string> = pending
      ? contactFieldErrors(draft.contactInput.name, draft.contactInput.phone)
      : {};
    const profileProblems: Record<string, string> =
      keys.profile !== saved.profile ? profileFieldErrors(draft.profile) : {};
    const { form: formCode, ...fields } = profileProblems;
    setFieldErrors(fields);
    setContactErrors(contactProblems);
    const codes = [
      ...Object.values(profileProblems),
      ...Object.values(contactProblems),
    ];
    if (codes.length > 0) {
      if (formCode) setError(profileMessage(formCode));
      toastProfileBlocked(PROFILE_TOAST.blocked, codes);
      return;
    }

    const contacts = pending
      ? [...draft.contacts, contactFromInput(draft.contactInput)]
      : draft.contacts;
    if (contacts.length > MAX_CONTACTS) {
      setError(profileMessage("TOO_MANY_CONTACTS"));
      return;
    }
    const next = keysOf({ ...draft, contacts });

    setSaving(true);
    try {
      if (next.profile !== saved.profile) {
        await updateProfile.mutateAsync(profilePayload(draft.profile));
        setSaved((prev) => ({ ...prev, profile: next.profile }));
      }
      if (next.skills !== saved.skills) {
        await setSkills.mutateAsync(skillsPayload(draft.skills));
        setSaved((prev) => ({ ...prev, skills: next.skills }));
      }
      if (next.contacts !== saved.contacts) {
        const fresh = await replaceContacts.mutateAsync(contacts);
        // Rebase on the server rows so new contacts pick up their real ids.
        const rebased = contactsOf(fresh.contacts);
        setDraft((prev) => ({
          ...prev,
          contacts: rebased,
          contactInput: EMPTY_CONTACT_INPUT,
        }));
        setSaved((prev) => ({ ...prev, contacts: contactsKey(rebased) }));
      }
      setFieldErrors({});
      setContactErrors({});
      toastProfileOk(PROFILE_TOAST.saved);
    } catch (err) {
      setError(toastProfileError(err));
    } finally {
      setSaving(false);
    }
  }

  return {
    draft,
    dirty,
    saving,
    error,
    fieldErrors,
    contactErrors,
    setProfile,
    toggleSkill,
    setSkillLevel,
    setContactInput,
    addContact,
    removeContact,
    save,
  };
}
