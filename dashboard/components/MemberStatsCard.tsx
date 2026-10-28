import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import {
  FiInbox,
  FiMail,
  FiMinusCircle,
  FiUserCheck,
  FiUserMinus,
  FiUsers,
  FiUserX,
} from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { StatTile } from "../../core/components/StatTile.tsx";
import type { BucketCount } from "../api.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { MEMBER_STATUS_LABELS } from "../messages-members.tsx";

interface MemberStatsCardProps {
  // True while the first member page loads; tiles render placeholders.
  pending: boolean;
  // Backend error code when the member page failed; null otherwise.
  errorCode: string | null;
  counts: BucketCount[];
  bucket: string;
  onBucket: (bucket: string) => void;
  // Two columns, for the narrow manage rail.
  compact?: boolean;
}

interface StatSpec {
  key: string;
  label: string;
  Icon: IconType;
  tone: string;
}

// Fixed order keeps the strip stable while bucket counts arrive; tones
// match the status badges used on member rows.
const TILES: StatSpec[] = [
  {
    key: "all",
    label: "Tất cả",
    Icon: FiUsers,
    tone: "text-zinc-900 dark:text-zinc-100",
  },
  {
    key: "active",
    label: MEMBER_STATUS_LABELS["active"],
    Icon: FiUserCheck,
    tone: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "applied",
    label: MEMBER_STATUS_LABELS["applied"],
    Icon: FiInbox,
    tone: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "invited",
    label: MEMBER_STATUS_LABELS["invited"],
    Icon: FiMail,
    tone: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "suspended",
    label: MEMBER_STATUS_LABELS["suspended"],
    Icon: FiMinusCircle,
    tone: "text-red-600 dark:text-red-400",
  },
  {
    key: "left",
    label: MEMBER_STATUS_LABELS["left"],
    Icon: FiUserMinus,
    tone: "text-zinc-400 dark:text-zinc-500",
  },
  {
    key: "revoked",
    label: MEMBER_STATUS_LABELS["revoked"],
    Icon: FiUserX,
    tone: "text-zinc-400 dark:text-zinc-500",
  },
];

export function MemberStatsCard({
  pending,
  errorCode,
  counts,
  bucket,
  onBucket,
  compact = false,
}: MemberStatsCardProps): ReactElement {
  const lookup = new Map(counts.map((entry) => [entry.bucket, entry.count]));
  // The "all" tile is the searched universe: counts ignore the status filter.
  const totalAll = counts.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Section>
      {errorCode !== null && (
        <div className="mb-3" aria-live="polite">
          <ErrorState
            title="Không tải được thống kê thành viên"
            message={toVietnameseDashboardMessage(errorCode)}
          />
        </div>
      )}
      <div
        role="group"
        aria-label="Lọc theo trạng thái thành viên"
        className={
          compact
            ? "grid grid-cols-2 gap-2"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 @4xl:grid-cols-6"
        }
      >
        {TILES.map(({ key, label, Icon, tone }) => (
          <StatTile
            key={key}
            active={bucket === key}
            onClick={() => onBucket(key)}
            icon={<Icon className={`h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />}
            count={
              pending || errorCode !== null
                ? "—"
                : key === "all"
                  ? totalAll
                  : (lookup.get(key) ?? 0)
            }
            label={label}
          />
        ))}
      </div>
    </Section>
  );
}
