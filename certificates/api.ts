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
): Promise<Certificate> {
  return apiFetch<Certificate>(
    `/activities/${activityId}/certificates/${studentId}`,
    { method: "POST" },
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
