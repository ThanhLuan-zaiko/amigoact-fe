import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiBriefcase,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { JOIN_POLICY_LABELS, ORG_KIND_LABELS } from "../messages.tsx";
import { foldText } from "../schemas.ts";
import type { DashboardOrg } from "../api.ts";

interface MemberOrgPickerProps {
  orgs: DashboardOrg[];
  selectedId: string | null;
  onSelect: (orgId: string) => void;
  // bare strips the field label and selected-org meta; used inside
  // MemberOrgCard where the card header already owns that context.
  bare?: boolean;
}

// Up to this many orgs, the plain chip row stays readable; past it the
// picker collapses to the selected chip plus an on-demand scroll panel.
const CHIP_LIMIT = 6;
const SEARCH_LIMIT = 12;

export function MemberOrgPicker({
  orgs,
  selectedId,
  onSelect,
  bare = false,
}: MemberOrgPickerProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const selected = orgs.find((org) => org.id === selectedId) ?? null;
  const many = orgs.length > CHIP_LIMIT;
  const needle = foldText(draft);
  const visible = needle
    ? orgs.filter((org) =>
        foldText(`${org.name} ${org.slug}`).includes(needle),
      )
    : orgs;

  function pick(orgId: string): void {
    onSelect(orgId);
    setOpen(false);
    setDraft("");
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {!bare && (
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Tổ chức</p>
      )}
      {!many && (
        <div role="group" aria-label="Chọn tổ chức" className="flex flex-wrap gap-2">
          {orgs.map((org) => (
            <Button
              key={org.id}
              type="button"
              variant={selectedId === org.id ? "primary" : "secondary"}
              onClick={() => onSelect(org.id)}
              aria-pressed={selectedId === org.id}
              icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
            >
              {org.name}
            </Button>
          ))}
        </div>
      )}
      {many && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {selected && (
              <span className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-brand bg-brand px-4 py-2 text-sm font-semibold whitespace-nowrap text-zinc-950 dark:border-brand dark:bg-brand dark:text-zinc-950">
                <FiBriefcase className="h-4 w-4" aria-hidden="true" />
                {selected.name}
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen((current) => !current)}
              aria-expanded={open}
              icon={
                open ? (
                  <FiChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FiChevronDown className="h-4 w-4" aria-hidden="true" />
                )
              }
            >
              {open ? "Thu gọn" : `Đổi · ${orgs.length}`}
            </Button>
          </div>
          {open && (
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
              {orgs.length > SEARCH_LIMIT && (
                <TextField
                  label="Tìm tổ chức"
                  id="org-picker-search"
                  name="org-picker-search"
                  type="search"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Tên hoặc @slug…"
                  autoComplete="off"
                  icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
                />
              )}
              {visible.length === 0 && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Không có tổ chức phù hợp.
                </p>
              )}
              <div role="group" aria-label="Chọn tổ chức" className="flex flex-wrap gap-2">
                {visible.map((org) => (
                  <Button
                    key={org.id}
                    type="button"
                    variant={selectedId === org.id ? "primary" : "secondary"}
                    onClick={() => pick(org.id)}
                    aria-pressed={selectedId === org.id}
                    icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
                  >
                    {org.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {selected && !bare && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {`${ORG_KIND_LABELS[selected.kind] ?? selected.kind} · @${selected.slug} · ${JOIN_POLICY_LABELS[selected.join_policy] ?? selected.join_policy}`}
        </p>
      )}
    </div>
  );
}
