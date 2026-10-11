import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import {
  FiBriefcase,
  FiClock,
  FiCompass,
  FiGlobe,
  FiGrid,
  FiSearch,
  FiType,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { BucketCount, OrgKind, PublicOrgSort } from "../api.ts";
import { ORG_KIND_LABELS } from "../messages.tsx";

const KINDS: { key: OrgKind; Icon: typeof FiGlobe }[] = [
  { key: "organization", Icon: FiGlobe },
  { key: "club", Icon: FiUsers },
  { key: "group", Icon: FiUserPlus },
  { key: "business", Icon: FiBriefcase },
];

const SORTS: { key: PublicOrgSort; label: string; Icon: typeof FiClock }[] = [
  { key: "newest", label: "Mới nhất", Icon: FiClock },
  { key: "name", label: "Tên A–Z", Icon: FiType },
  { key: "members", label: "Nhiều thành viên", Icon: FiUsers },
];

interface OrgHeroCardProps {
  query: string;
  onQuery: (value: string) => void;
  kind: string;
  onKind: (kind: string) => void;
  counts: BucketCount[];
  sort: PublicOrgSort;
  onSort: (sort: PublicOrgSort) => void;
  total: number;
}

export function OrgHeroCard({
  query,
  onQuery,
  kind,
  onKind,
  counts,
  sort,
  onSort,
  total,
}: OrgHeroCardProps): ReactElement {
  // Draft locally so each keystroke does not fire a server request.
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (syncedQuery !== query) {
    setSyncedQuery(query);
    setDraft(query);
  }
  useEffect(() => {
    if (draft === query) return;
    const timer = setTimeout(() => onQuery(draft), 300);
    return () => clearTimeout(timer);
  }, [draft, query, onQuery]);

  const countOf = new Map(counts.map((entry) => [entry.bucket, entry.count]));

  return (
    <BentoCard className="md:col-span-6 lg:col-span-8">
      <div data-rise className="flex items-center gap-2">
        <FiCompass
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Khám phá cộng đồng
        </h1>
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Tìm tổ chức, câu lạc bộ và hội nhóm đang mở cửa chào bạn.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <TextField
          label="Tìm kiếm"
          id="orgs-search"
          name="orgs-search"
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tên hoặc @slug…"
          autoComplete="off"
          icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Lọc theo loại hình"
            className="flex flex-wrap gap-2"
          >
            <Button
              type="button"
              variant={kind === "all" ? "primary" : "secondary"}
              onClick={() => onKind("all")}
              aria-pressed={kind === "all"}
              icon={<FiGrid className="h-4 w-4" aria-hidden="true" />}
            >
              {`Tất cả · ${total}`}
            </Button>
            {KINDS.map(({ key, Icon }) => (
              <Button
                key={key}
                type="button"
                variant={kind === key ? "primary" : "secondary"}
                onClick={() => onKind(key)}
                aria-pressed={kind === key}
                icon={<Icon className="h-4 w-4" aria-hidden="true" />}
              >
                {countOf.get(key)
                  ? `${ORG_KIND_LABELS[key]} · ${countOf.get(key)}`
                  : ORG_KIND_LABELS[key]}
              </Button>
            ))}
          </div>
          <span
            aria-hidden="true"
            className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block"
          />
          <div role="group" aria-label="Sắp xếp" className="flex flex-wrap gap-2">
            {SORTS.map(({ key, label, Icon }) => (
              <Button
                key={key}
                type="button"
                variant={sort === key ? "primary" : "ghost"}
                onClick={() => onSort(key)}
                aria-pressed={sort === key}
                icon={<Icon className="h-4 w-4" aria-hidden="true" />}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
