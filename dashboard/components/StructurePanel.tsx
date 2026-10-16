import { useState, type ReactElement } from "react";
import { FiArchive } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import {
  useCampuses,
  useCreateCampus,
  useCreateDepartment,
  useDepartments,
  useUpdateCampus,
  useUpdateDepartment,
} from "../structure-hooks.ts";
import { CampusForm, DepartmentForm, DeptRow } from "./StructureForms.tsx";

interface StructurePanelProps {
  orgId: string;
}

/** Campus + department tree editor inside the org edit modal. */
export function StructurePanel({ orgId }: StructurePanelProps): ReactElement {
  const campuses = useCampuses(orgId);
  const departments = useDepartments(orgId);
  const createCampus = useCreateCampus(orgId);
  const updateCampus = useUpdateCampus(orgId);
  const createDept = useCreateDepartment(orgId);
  const updateDept = useUpdateDepartment(orgId);
  const [error, setError] = useState("");

  const fail = (err: unknown): void => {
    setError(err instanceof ApiError ? err.message : "Có lỗi xảy ra.");
  };
  const campusRows = (campuses.data ?? []).filter(
    (c) => c.status === "active",
  );
  const deptRows = (departments.data ?? []).filter(
    (d) => d.status === "active",
  );
  const archiveDept = (id: string): void => {
    void updateDept
      .mutateAsync({ departmentId: id, patch: { status: "archived" } })
      .catch(fail);
  };

  const addCampus = async (
    name: string,
    address: string,
  ): Promise<void> => {
    setError("");
    if (!name) {
      setError("Nhập tên cơ sở.");
      return;
    }
    try {
      await createCampus.mutateAsync({
        name,
        address: address || null,
      });
    } catch (err) {
      fail(err);
      throw err;
    }
  };

  const addDepartment = async (
    name: string,
    code: string,
    campusId: string,
  ): Promise<void> => {
    setError("");
    if (!name) {
      setError("Nhập tên khoa/phòng ban.");
      return;
    }
    try {
      await createDept.mutateAsync({
        name,
        code: code || null,
        campus_id: campusId || null,
      });
    } catch (err) {
      fail(err);
      throw err;
    }
  };

  if (campuses.isPending || departments.isPending) {
    return <LoadingState label="Đang tải cơ cấu…" />;
  }

  return (
    <div data-rise className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Cơ sở &amp; khoa/phòng ban
      </h4>
      {campusRows.length === 0 && deptRows.length === 0 ? (
        <div className="mt-2">
          <EmptyState
            title="Chưa có cơ cấu"
            message="Thêm cơ sở trước, rồi gắn khoa/phòng ban vào."
          />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {campusRows.map((c) => (
            <li key={c.id}>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {c.name}
                  </p>
                  {c.address && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {c.address}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  disabled={updateCampus.isPending}
                  onClick={() =>
                    void updateCampus
                      .mutateAsync({
                        campusId: c.id,
                        patch: { status: "archived" },
                      })
                      .catch(fail)
                  }
                  icon={<FiArchive className="h-4 w-4" aria-hidden="true" />}
                >
                  Lưu trữ
                </Button>
              </div>
              <ul className="ml-6 mt-1 flex flex-col gap-1">
                {deptRows
                  .filter((d) => d.campus_id === c.id)
                  .map((d) => (
                    <DeptRow
                      key={d.id}
                      name={d.name}
                      code={d.code}
                      campusName={null}
                      onArchive={() => archiveDept(d.id)}
                      busy={updateDept.isPending}
                    />
                  ))}
              </ul>
            </li>
          ))}
          {deptRows
            .filter(
              (d) =>
                d.campus_id === null ||
                !campusRows.some((c) => c.id === d.campus_id),
            )
            .map((d) => (
              <DeptRow
                key={d.id}
                name={d.name}
                code={d.code}
                campusName={
                  campusRows.find((c) => c.id === d.campus_id)?.name ??
                  null
                }
                onArchive={() => archiveDept(d.id)}
                busy={updateDept.isPending}
              />
            ))}
        </ul>
      )}
      <div className="mt-4">
        <CampusForm busy={createCampus.isPending} onSubmit={addCampus} />
      </div>
      <div className="mt-3">
        <DepartmentForm
          busy={createDept.isPending}
          campuses={campusRows}
          onSubmit={addDepartment}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
