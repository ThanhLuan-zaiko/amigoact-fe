"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import {
  certificateFailure,
  issuedMessage,
  readBackground,
  readLayout,
} from "@/lib/certificates";
import { textOrNull, textValue } from "@/lib/forms";

function templatesPage(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}/certificates`;
}

function finish(result: ApiResult<unknown>, success?: string): FormState {
  if (!result.ok) {
    return certificateFailure(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return success ? { success } : {};
}

export async function createTemplate(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const background = readBackground(formData);
  const result = await authedFetch(
    `/organizations/${encodeURIComponent(slug)}/certificate-templates`,
    {
      body: {
        name: textValue(formData, "template_name"),
        // A new template has nothing to remove, so only an uploaded picture is sent.
        ...(background ? { background_asset_id: background } : {}),
        layout: readLayout(formData),
      },
    },
  );
  if (!result.ok) {
    return certificateFailure(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  redirect(templatesPage(slug));
}

export async function updateTemplate(
  slug: string,
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const background = readBackground(formData);
  const result = await authedFetch(
    `/certificate-templates/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: {
        name: textValue(formData, "template_name"),
        ...(background === undefined
          ? {}
          : { background_asset_id: background }),
        layout: readLayout(formData),
      },
    },
  );
  if (!result.ok) {
    return certificateFailure(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  redirect(templatesPage(slug));
}

export async function setTemplateActive(
  id: string,
  active: boolean,
): Promise<FormState> {
  return finish(
    await authedFetch(`/certificate-templates/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { is_active: active },
    }),
  );
}

export async function issueCertificates(
  activityId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const templateId = textOrNull(formData, "template_id");
  const result = await authedFetch<{ issued: number }>(
    `/activities/${encodeURIComponent(activityId)}/certificates`,
    { body: templateId ? { template_id: templateId } : {} },
  );
  if (!result.ok) {
    return certificateFailure(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return { success: issuedMessage(result.data.issued) };
}

export async function revokeCertificate(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(`/certificates/${encodeURIComponent(id)}/revoke`, {
      body: { reason: textValue(formData, "reason") },
    }),
    "Đã thu hồi chứng nhận.",
  );
}

export async function reinstateCertificate(id: string): Promise<FormState> {
  return finish(
    await authedFetch(`/certificates/${encodeURIComponent(id)}/reinstate`),
  );
}
