import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { RailCard } from "../../core/components/RailCard.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useWorkspaceOrg } from "../../workspace/hooks.ts";
import { useMyOrgs } from "../hooks.ts";
import { ORG_KIND_LABELS } from "../messages.tsx";
import { ManageActions } from "./ManageRailActions.tsx";
import { ManageContextPanels } from "./ManageContextPanels.tsx";
import { ManageListFilters } from "./ManageListFilters.tsx";
import { OrgChipList } from "./OrgChipList.tsx";
import { TagPostRail } from "./TagPostRail.tsx";

function usesQuery(pathname: string): boolean {
  return (
    pathname.startsWith("/manage/overview") ||
    pathname.startsWith("/manage/orgs") ||
    pathname.startsWith("/manage/members") ||
    pathname.startsWith("/manage/tags")
  );
}

function searchPlaceholder(pathname: string, linked: boolean): string {
  if (!linked) return "Lọc tổ chức";
  if (pathname.startsWith("/manage/members")) return "Tìm thành viên";
  if (pathname.startsWith("/manage/tags")) return "Tìm thẻ";
  return "Tìm tổ chức";
}

// Right-rail workspace for /manage: one search box, the page's actions,
// and the org switcher. The center column keeps the list or form.
export function ManageRail({
  placement,
}: {
  placement: "rail" | "column";
}): ReactElement {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const linked = usesQuery(pathname);
  const active = linked ? (searchParams.get("q") ?? "") : "";
  const [term, setTerm] = useState(active);
  const [prevActive, setPrevActive] = useState(active);
  if (linked && prevActive !== active) {
    setPrevActive(active);
    setTerm(active);
  }
  useEffect(() => {
    if (!linked || term === active) return undefined;
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          const query = term.trim();
          if (query) next.set("q", query);
          else next.delete("q");
          next.delete("page");
          return next;
        },
        { replace: true },
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [active, linked, setSearchParams, term]);

  const orgs = useMyOrgs(false, { limit: 100 });
  const items = orgs.data?.items ?? [];
  const { orgId } = useWorkspaceOrg(items);
  const needle = linked ? "" : term.trim().toLowerCase();
  const visible = needle
    ? items.filter((org) =>
        `${org.name} ${org.slug}`.toLowerCase().includes(needle),
      )
    : items;
  const selected = items.find((org) => org.id === orgId) ?? null;
  const placeholder = searchPlaceholder(pathname, linked);

  function selectOrg(id: string): void {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("org", id);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={placement === "rail" ? "sticky top-0 z-10 bg-white py-2 dark:bg-zinc-950" : ""}>
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <TextField
            label={placeholder}
            hideLabel
            pill
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder={placeholder}
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            icon={<FiSearch className="h-4 w-4" />}
          />
        </form>
      </div>
      <ManageActions orgId={orgId} />
      <ManageListFilters />
      {pathname.startsWith("/manage/tags") ? (
        <TagPostRail />
      ) : (
      <RailCard title="Tổ chức của bạn">
        <div className="px-4 pb-4">
          {orgs.isPending && <LoadingState label="Đang tải tổ chức…" />}
          {orgs.isSuccess && items.length === 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Bạn chưa có tổ chức nào.
            </p>
          )}
          {visible.length > 0 && (
            <OrgChipList orgs={visible} orgId={orgId} onSelect={selectOrg} />
          )}
          {needle !== "" && visible.length === 0 && items.length > 0 && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Không có tổ chức phù hợp.
            </p>
          )}
          {selected && (
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              {`${ORG_KIND_LABELS[selected.kind] ?? selected.kind} · @${selected.slug}`}
            </p>
          )}
        </div>
      </RailCard>
      )}
      <ManageContextPanels orgId={orgId} org={selected} />
    </div>
  );
}
