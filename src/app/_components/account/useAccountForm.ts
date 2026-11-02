"use client";

import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FieldErrors, FormState } from "@/lib/account";
import { FIELD_MESSAGES, validateField } from "@/lib/validation";

type ServerAction = (
  previous: FormState,
  formData: FormData,
) => Promise<FormState>;

function validateForm(form: HTMLFormElement): FieldErrors {
  const errors: FieldErrors = {};
  const inputs = form.querySelectorAll<HTMLInputElement>(
    "input[name]:not([type=hidden]):not([type=radio])",
  );
  const passwordToMatch =
    form.querySelector<HTMLInputElement>("input[name=new_password]")?.value ??
    form.querySelector<HTMLInputElement>("input[name=password]")?.value;

  for (const input of inputs) {
    const message = input.validity.valueMissing
      ? FIELD_MESSAGES.required
      : input.validity.typeMismatch
        ? input.type === "url"
          ? FIELD_MESSAGES.website
          : FIELD_MESSAGES.email
        : validateField(input.name, input.value, {
            isNewPassword: input.autocomplete === "new-password",
            passwordToMatch,
          });
    if (message) {
      errors[input.name] = message;
    }
  }
  return errors;
}

// React clears a form after its action runs, which would erase what the user
// typed when the server rejects it. This keeps the input until the action succeeds.
// The action prop stays so the form still works before JavaScript loads.
export function useAccountForm(
  serverAction: ServerAction,
  { resetOnSuccess = true } = {},
) {
  const [serverState, action, pending] = useActionState(serverAction, {});
  const ref = useRef<HTMLFormElement>(null);
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  // One switch per form, so every password field in it shows or hides together.
  const [passwordsVisible, setPasswordsVisible] = useState(false);
  // While a submit is pending, the result of the previous one is hidden.
  const state: FormState = pending
    ? {}
    : clientErrors
      ? { fieldErrors: clientErrors }
      : serverState;
  const fieldErrors = state.fieldErrors;

  useEffect(() => {
    if (serverState.success && resetOnSuccess) {
      ref.current?.reset();
      setPasswordsVisible(false);
    }
  }, [serverState, resetOnSuccess]);

  useEffect(() => {
    if (fieldErrors) {
      ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [fieldErrors]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }
    setClientErrors(null);
    const formData = new FormData(form);
    startTransition(() => action(formData));
  }

  return {
    state,
    pending,
    // noValidate replaces the browser popups with Vietnamese messages under each field.
    formProps: { ref, action, onSubmit, noValidate: true },
    passwordProps: {
      visible: passwordsVisible,
      onToggle: () => setPasswordsVisible((visible) => !visible),
      errors: fieldErrors,
    },
  };
}
