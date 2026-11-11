"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { FiSave, FiX } from "react-icons/fi";
import type { FieldErrors, FormState } from "@/lib/account";
import {
  type CertificateTemplate,
  DEFAULT_LAYOUT,
  layoutErrors,
  templateNameError,
  updatePlacement,
} from "@/lib/certificates";
import { FormMessage, SubmitButton, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton, panel, sectionTitle } from "../ui";
import BackgroundPicker from "./BackgroundPicker";
import CertificatePreview from "./CertificatePreview";
import PlacementFields from "./PlacementFields";

type TemplateFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  cancelHref: string;
  template?: CertificateTemplate;
};

function validate(form: HTMLFormElement): FieldErrors {
  const read = (name: string) => {
    const input = form.elements.namedItem(name);
    return input instanceof HTMLInputElement ? input.value : "";
  };
  const errors = layoutErrors(read);
  const nameError = templateNameError(read("template_name"));
  if (nameError) {
    errors.template_name = nameError;
  }
  return errors;
}

// Name, background and the place of each text, with a preview that follows the inputs.
export default function TemplateForm({
  action,
  cancelHref,
  template,
}: TemplateFormProps) {
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: false,
    validate,
  });
  const [layout, setLayout] = useState(template?.layout ?? DEFAULT_LAYOUT);
  const [background, setBackground] = useState(
    template?.background_url ?? null,
  );

  function onInput(event: FormEvent<HTMLFormElement>) {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      setLayout((current) => updatePlacement(current, input.name, input.value));
    }
  }

  // The fields sit on the left and the preview stays in view on the right on wide screens.
  // On a phone the preview comes first, so the user sees what the numbers change.
  return (
    <form
      {...formProps}
      onInput={onInput}
      className="grid w-full grid-cols-1 items-start gap-4 xl:grid-cols-2"
    >
      <div className="flex flex-col gap-2 xl:sticky xl:top-24 xl:order-2">
        <h2 className={sectionTitle}>Xem trước</h2>
        <CertificatePreview
          layout={layout}
          backgroundUrl={background}
          label="Xem trước mẫu chứng nhận"
        />
      </div>
      <div className={`${panel} flex flex-col gap-5 p-4 sm:p-6 xl:order-1`}>
        <FormMessage state={state} />
        <TextField
          label="Tên mẫu"
          name="template_name"
          defaultValue={template?.name}
          maxLength={120}
          errors={state.fieldErrors}
          required
        />
        <BackgroundPicker
          currentUrl={template?.background_url ?? null}
          onPreview={setBackground}
        />
        <PlacementFields
          layout={template?.layout ?? DEFAULT_LAYOUT}
          errors={state.fieldErrors}
        />
        <div className="flex items-center gap-2">
          <SubmitButton pending={pending} icon={FiSave}>
            {template ? "Lưu mẫu" : "Tạo mẫu"}
          </SubmitButton>
          <Link
            href={cancelHref}
            aria-label="Hủy"
            title="Hủy"
            className={iconButton}
          >
            <FiX aria-hidden="true" />
          </Link>
        </div>
      </div>
    </form>
  );
}
