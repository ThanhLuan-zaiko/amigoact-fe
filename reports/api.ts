import { apiFetch, apiTextFetch } from "../core/api.ts";

export interface ReportSnapshot {
  snapshot_id: string;
  report_type: string;
  period_start: string | null;
  period_end: string | null;
  payload: { months: MonthlyRow[] };
  created_by: string;
  created_at: string | null;
}

export interface MonthlyRow {
  month: string;
  activities: number;
  participants: number;
  hours: number;
  certificates: number;
}

export interface ExportJob {
  job_id: string;
  org_id: string;
  job_type: string;
  status: string;
  file_url: string | null;
  error: string | null;
  created_at: string | null;
  finished_at: string | null;
}

export function listSnapshots(orgId: string): Promise<ReportSnapshot[]> {
  return apiFetch<ReportSnapshot[]>(`/orgs/${orgId}/snapshots`);
}

export function createSnapshot(
  orgId: string,
  input: { report_type: string },
): Promise<ReportSnapshot> {
  return apiFetch<ReportSnapshot>(`/orgs/${orgId}/snapshots`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listExportJobs(): Promise<ExportJob[]> {
  return apiFetch<ExportJob[]>("/export-jobs");
}

export function requestExport(
  orgId: string,
  input: { job_type: string; activity_id?: string },
): Promise<ExportJob> {
  return apiFetch<ExportJob>(`/export-jobs?org_id=${orgId}`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function downloadExportCsv(fileUrl: string): Promise<string> {
  return apiTextFetch(fileUrl);
}
