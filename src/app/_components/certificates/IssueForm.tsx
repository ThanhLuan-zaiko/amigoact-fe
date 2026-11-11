"use client";

import { FiAward } from "react-icons/fi";
import { issueCertificates } from "@/app/_actions/certificates";
import type { CertificateTemplate } from "@/lib/certificates";
import { FormMessage, SubmitButton } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import SelectMenu from "../SelectMenu";

type IssueFormProps = {
  activityId: string;
  // Active templates only. An inactive one cannot be used for new certificates.
  templates: CertificateTemplate[];
};

// Issues a certificate to everyone who attended and has none yet.
export default function IssueForm({ activityId, templates }: IssueFormProps) {
  const { state, pending, formProps } = useAccountForm(
    issueCertificates.bind(null, activityId),
  );
  return (
    <form {...formProps} className="flex flex-col gap-3">
      <FormMessage state={state} />
      <div className="flex flex-wrap items-end gap-3">
        {templates.length > 0 ? (
          <SelectMenu
            label="Mẫu"
            name="template_id"
            defaultValue={templates[0].id}
            options={[
              ...templates.map((template) => ({
                value: template.id,
                label: template.name,
              })),
              { value: "", label: "Không dùng mẫu" },
            ]}
            className="flex-1 basis-40"
          />
        ) : null}
        <SubmitButton pending={pending} icon={FiAward}>
          Cấp chứng nhận
        </SubmitButton>
      </div>
    </form>
  );
}
