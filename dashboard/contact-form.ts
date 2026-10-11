import { useState } from "react";
import type { CreateOrgInput } from "./api.ts";
import { validateContactField } from "./schemas.ts";
import type { ContactForm, ContactKey, UpdateFieldErrors } from "./schemas.ts";

export const CONTACT_KEYS: readonly ContactKey[] = [
  "email",
  "phone",
  "website",
  "address",
  "city",
  "country",
  "legal_name",
  "license_number",
];

export function emptyContact(): ContactForm {
  return {
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    country: "",
    legal_name: "",
    license_number: "",
  };
}

/** Contact fields are all optional on create; empty strings stay unsent. */
export function contactPayload(form: ContactForm): Partial<CreateOrgInput> {
  const input: Record<string, string> = {};
  for (const key of CONTACT_KEYS) {
    const value = form[key].trim();
    if (value) input[key] = value;
  }
  return input;
}

export interface ContactFormState {
  form: ContactForm;
  errors: UpdateFieldErrors;
  touched: Record<string, boolean>;
  change: (key: ContactKey, value: string) => void;
  blur: (key: ContactKey) => void;
  validateAll: () => UpdateFieldErrors;
  reset: (next?: ContactForm) => void;
}

export function useContactForm(initial: ContactForm): ContactFormState {
  const [form, setForm] = useState<ContactForm>(initial);
  const [errors, setErrors] = useState<UpdateFieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function applyError(key: ContactKey, invalid: string | null): void {
    setErrors((prev) => {
      const copy = { ...prev };
      if (invalid) copy[key] = invalid;
      else delete copy[key];
      return copy;
    });
  }

  function change(key: ContactKey, value: string): void {
    const next = { ...form, [key]: value };
    setForm(next);
    applyError(key, validateContactField(next, key));
  }

  function blur(key: ContactKey): void {
    setTouched((prev) => ({ ...prev, [key]: true }));
    applyError(key, validateContactField(form, key));
  }

  function validateAll(): UpdateFieldErrors {
    const next: UpdateFieldErrors = {};
    for (const key of CONTACT_KEYS) {
      const invalid = validateContactField(form, key);
      if (invalid) next[key] = invalid;
    }
    setErrors(next);
    setTouched(Object.fromEntries(CONTACT_KEYS.map((key) => [key, true])));
    return next;
  }

  function reset(next?: ContactForm): void {
    setForm(next ?? emptyContact());
    setErrors({});
    setTouched({});
  }

  return { form, errors, touched, change, blur, validateAll, reset };
}
