import type { ReactElement } from "react";
import {
  FiActivity,
  FiAward,
  FiClock,
  FiUserCheck,
} from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import {
  EmptyState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { useMyOrgs } from "../hooks.ts";
import { useOrgStats } from "../../stats/hooks.ts";

interface StatTile {
  label: string;
  value: string;
  icon: ReactElement;
}

export function OrgStatsCard(): ReactElement {
  const orgs = useMyOrgs(false, { limit: 1 });
  const first = orgs.data?.items[0];
  const stats = useOrgStats(first?.id);

  if (orgs.isPending) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <LoadingState label="Đang tải thống kê…" />
      </BentoCard>
    );
  }
  if (!first) {
    return (
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <EmptyState
          title="Chưa có thống kê"
          message="Tạo tổ chức để xem số liệu hoạt động."
        />
      </BentoCard>
    );
  }

  const s = stats.data;
  const tiles: StatTile[] = [
    {
      label: "Hoạt động",
      value: s ? String(s.activities_total) : "—",
      icon: <FiActivity className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
    {
      label: "Thành viên",
      value: s ? String(s.members_total) : "—",
      icon: <FiUserCheck className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
    {
      label: "Lượt tham gia",
      value: s ? String(s.participants_total) : "—",
      icon: <FiUserCheck className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
    {
      label: "Giờ đã duyệt",
      value: s ? String(s.hours_approved) : "—",
      icon: <FiClock className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
    {
      label: "Giờ chờ duyệt",
      value: s ? String(s.hours_pending) : "—",
      icon: <FiClock className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
    {
      label: "Chứng nhận",
      value: s ? String(s.certificates_issued) : "—",
      icon: <FiAward className="h-5 w-5 text-brand" aria-hidden="true" />,
    },
  ];

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Thống kê · {first.name}
      </h3>
      {stats.isPending && (
        <LoadingState label="Đang tải số liệu…" />
      )}
      {s && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((tile) => (
            <li
              key={tile.label}
              className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                {tile.icon}
                {tile.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {tile.value}
              </p>
            </li>
          ))}
        </ul>
      )}
    </BentoCard>
  );
}
