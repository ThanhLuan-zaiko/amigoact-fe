import "server-only";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import type {
  ActivityCertificates,
  CertificateTemplate,
  MyCertificate,
  VerifiedCertificate,
} from "./certificates";

async function getData<T>(path: string, token?: string): Promise<T | null> {
  const result = await backendFetch<T>(path, { method: "GET", token });
  return result.ok ? result.data : null;
}

// Read these behind a Suspense boundary, because they use the session.
// Templates and activity lists come back only to managers, so null means "not allowed".
export async function getTemplates(
  slug: string,
): Promise<CertificateTemplate[] | null> {
  const data = await getData<{ items: CertificateTemplate[] }>(
    `/organizations/${encodeURIComponent(slug)}/certificate-templates`,
    await getAccessToken(),
  );
  return data?.items ?? null;
}

export async function getTemplate(
  id: string,
): Promise<CertificateTemplate | null> {
  return getData(
    `/certificate-templates/${encodeURIComponent(id)}`,
    await getAccessToken(),
  );
}

export async function getActivityCertificates(
  id: string,
): Promise<ActivityCertificates | null> {
  return getData(
    `/activities/${encodeURIComponent(id)}/certificates`,
    await getAccessToken(),
  );
}

export async function getMyCertificates(): Promise<MyCertificate[] | null> {
  return getData("/certificates/mine", await getAccessToken());
}

export type VerifyResult =
  | { certificate: VerifiedCertificate }
  | { certificate: null; rateLimited: boolean };

// Public: no token is sent, so the page shows the same thing to everyone.
// The lookup is rate limited per client, which the page must tell apart from "not found".
export async function verifyCertificate(serial: string): Promise<VerifyResult> {
  const result = await backendFetch<VerifiedCertificate>(
    `/certificates/verify/${encodeURIComponent(serial)}`,
    { method: "GET" },
  );
  return result.ok
    ? { certificate: result.data }
    : { certificate: null, rateLimited: result.code === "rate_limited" };
}
