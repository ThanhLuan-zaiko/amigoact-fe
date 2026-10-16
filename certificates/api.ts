import { apiFetch } from "../core/api.ts";

export interface Certificate {
  certificate_id: string;
  activity_id: string;
  student_id: string;
  serial_no: string;
  status: string;
  issued_at: string | null;
}

export interface MyCertificate {
  certificate_id: string;
  activity_id: string;
  activity_title: string;
  serial_no: string;
  status: string;
  issued_at: string | null;
}

export interface VerifyResult {
  serial_no: string;
  status: string;
  activity_title: string;
  student_name: string;
  issued_at: string | null;
}

export function issueCertificate(
  activityId: string,
  studentId: string,
  templateId?: string,
): Promise<Certificate> {
  return apiFetch<Certificate>(
    `/activities/${activityId}/certificates/${studentId}`,
    {
      method: "POST",
      body: JSON.stringify({ template_id: templateId ?? null }),
    },
  );
}

export function revokeCertificate(
  activityId: string,
  studentId: string,
  reason?: string,
): Promise<Certificate> {
  return apiFetch<Certificate>(
    `/activities/${activityId}/certificates/${studentId}/revoke`,
    { method: "POST", body: JSON.stringify({ reason: reason ?? null }) },
  );
}

export function listActivityCertificates(
  activityId: string,
): Promise<Certificate[]> {
  return apiFetch<Certificate[]>(
    `/activities/${activityId}/certificates`,
  );
}

export function listMyCertificates(): Promise<MyCertificate[]> {
  return apiFetch<MyCertificate[]>("/certificates/mine");
}

export function verifyCertificate(serial: string): Promise<VerifyResult> {
  return apiFetch<VerifyResult>(
    `/certificates/verify/${encodeURIComponent(serial)}`,
  );
}

export interface CertificateTemplate {
  template_id: string;
  org_id: string;
  name: string | null;
  background_media_id: string | null;
  layout_json: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export interface TemplateInput {
  name: string;
  background_media_id?: string | null;
  layout_json?: string | null;
}

export interface TemplatePatch {
  name?: string;
  background_media_id?: string | null;
  layout_json?: string | null;
  is_active?: boolean;
}

export function listTemplates(
  orgId: string,
): Promise<CertificateTemplate[]> {
  return apiFetch<CertificateTemplate[]>(
    `/orgs/${orgId}/certificate-templates`,
  );
}

export function createTemplate(
  orgId: string,
  input: TemplateInput,
): Promise<CertificateTemplate> {
  return apiFetch<CertificateTemplate>(
    `/orgs/${orgId}/certificate-templates`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function updateTemplate(
  orgId: string,
  templateId: string,
  patch: TemplatePatch,
): Promise<CertificateTemplate> {
  return apiFetch<CertificateTemplate>(
    `/orgs/${orgId}/certificate-templates/${templateId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}
