import { apiFetch } from "../core/api.ts";

export interface Campus {
  id: string;
  org_id: string;
  name: string;
  address: string | null;
  status: string;
}

export interface Department {
  id: string;
  org_id: string;
  campus_id: string | null;
  name: string;
  code: string | null;
  status: string;
}

export interface CampusInput {
  name: string;
  address?: string | null;
}

export interface CampusPatch {
  name?: string;
  address?: string | null;
  status?: string;
}

export interface DepartmentInput {
  name: string;
  code?: string | null;
  campus_id?: string | null;
}

export interface DepartmentPatch {
  name?: string;
  code?: string | null;
  campus_id?: string | null;
  status?: string;
}

export function listCampuses(orgId: string): Promise<Campus[]> {
  return apiFetch<Campus[]>(`/orgs/${orgId}/campuses`);
}

export function createCampus(
  orgId: string,
  input: CampusInput,
): Promise<Campus> {
  return apiFetch<Campus>(`/orgs/${orgId}/campuses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCampus(
  orgId: string,
  campusId: string,
  patch: CampusPatch,
): Promise<Campus> {
  return apiFetch<Campus>(`/orgs/${orgId}/campuses/${campusId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function listDepartments(orgId: string): Promise<Department[]> {
  return apiFetch<Department[]>(`/orgs/${orgId}/departments`);
}

export function createDepartment(
  orgId: string,
  input: DepartmentInput,
): Promise<Department> {
  return apiFetch<Department>(`/orgs/${orgId}/departments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateDepartment(
  orgId: string,
  departmentId: string,
  patch: DepartmentPatch,
): Promise<Department> {
  return apiFetch<Department>(
    `/orgs/${orgId}/departments/${departmentId}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}

export interface StudentLookup {
  user_id: string | null;
  student_code: string;
}

export function lookupStudentCode(
  orgId: string,
  code: string,
  campusId?: string,
): Promise<StudentLookup> {
  const qs = new URLSearchParams({ code });
  if (campusId) qs.set("campus_id", campusId);
  return apiFetch<StudentLookup>(
    `/orgs/${orgId}/students/by-code?${qs}`,
  );
}

export interface OrgType {
  code: string;
  name: string;
  sort_order: number;
}

export function listOrgTypes(): Promise<OrgType[]> {
  return apiFetch<OrgType[]>("/org-types");
}
