import { useState, type ReactElement } from "react";
import { FiPlus, FiTrash2, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { ActivityDetailView } from "../api.ts";
import { PARTNER_ROLE_LABELS } from "../messages.tsx";

const PARTNER_ROLE_OPTIONS = Object.entries(PARTNER_ROLE_LABELS).map(
  ([value, label]) => ({ value, label }),
);

interface PartnersPanelProps {
  partners: ActivityDetailView["partners"];
  canManage: boolean;
  onSave: (
    partners: { org_id: string; role: string; note?: string | null }[],
  ) => Promise<unknown>;
}

// Partner orgs of the activity (sponsors, co-organizers): read rows for
// everyone, add/remove rows for managers. Same replace-list protocol as
// StaffPanel — every save ships the full partner list.
export function PartnersPanel({
  partners,
  canManage,
  onSave,
}: PartnersPanelProps): ReactElement {
  const [orgId, setOrgId] = useState("");
  const [role, setRole] = useState(PARTNER_ROLE_OPTIONS[0]?.value ?? "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const save = async (
    next: { org_id: string; role: string; note?: string | null }[],
  ): Promise<void> => {
    setError("");
    try {
      await onSave(next);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  return (
    <section aria-label="Đối tác" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiUsers className="h-4 w-4" aria-hidden="true" /> Đối tác
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {partners.length === 0 ? (
        <EmptyState
          title="Chưa có đối tác"
          message="Thêm tổ chức đồng tổ chức hoặc nhà tài trợ."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {partners.map((p) => (
            <li
              key={p.org_id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {p.name}
                  <span className="ml-2 text-xs text-zinc-500">
                    {PARTNER_ROLE_LABELS[p.role] ?? p.role}
                  </span>
                </p>
                {p.note && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {p.note}
                  </p>
                )}
              </div>
              {canManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Gỡ đối tác"
                  onClick={() =>
                    void save(
                      partners
                        .filter((x) => x.org_id !== p.org_id)
                        .map((x) => ({ ...x })),
                    )
                  }
                  icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sr-only">Gỡ</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
          <TextField
            label="Org ID đối tác"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            placeholder="uuid của tổ chức"
          />
          <SelectField
            label="Vai trò"
            name="partner_role"
            value={role}
            onChange={setRole}
            options={PARTNER_ROLE_OPTIONS}
          />
          <TextField
            label="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="self-end">
            <Button
              variant="secondary"
              disabled={orgId.trim().length < 10}
              onClick={() =>
                void save([
                  ...partners.map((x) => ({
                    org_id: x.org_id,
                    role: x.role,
                    note: x.note,
                  })),
                  {
                    org_id: orgId.trim(),
                    role,
                    note: note.trim() || null,
                  },
                ]).then(() => {
                  setOrgId("");
                  setNote("");
                })
              }
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
