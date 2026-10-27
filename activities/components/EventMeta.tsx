import type { ReactElement } from "react";
import {
  FiAward,
  FiClock,
  FiGlobe,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import type { ActivityDetail } from "../api.ts";
import { formatDateTime } from "../dates.tsx";

// Every icon in the meta list shares one colour.
const ICON_CLASS = "h-4 w-4 text-zinc-600 dark:text-zinc-300";

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: ReactElement;
  label: string;
  value: string;
}): ReactElement {
  return (
    <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      {icon}
      <span className="text-xs text-zinc-500 sm:text-sm">{label}:</span>
      <span className="font-medium text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
    </li>
  );
}

interface EventMetaProps {
  activity: ActivityDetail;
  // Seats left from the card; null until it loads, then the capacity alone.
  seatsLeft: number | null;
}

// Time, place, hours, capacity and deadline rows for one activity.
export function EventMeta({ activity: a, seatsLeft }: EventMetaProps): ReactElement {
  const place = a.is_remote
    ? "Trực tuyến"
    : [a.location, a.address, a.city].filter(Boolean).join(", ") ||
      "Đang cập nhật";
  const capacity =
    seatsLeft !== null && a.max_participants
      ? `Còn ${seatsLeft}/${a.max_participants} chỗ`
      : `Tối đa ${a.max_participants} người`;
  return (
    <ul className="mt-3 flex flex-col gap-2">
      <MetaRow
        icon={<FiClock className={ICON_CLASS} aria-hidden="true" />}
        label="Bắt đầu"
        value={formatDateTime(a.start_at)}
      />
      <MetaRow
        icon={<FiClock className={ICON_CLASS} aria-hidden="true" />}
        label="Kết thúc"
        value={formatDateTime(a.end_at)}
      />
      <MetaRow
        icon={
          a.is_remote ? (
            <FiGlobe className={ICON_CLASS} aria-hidden="true" />
          ) : (
            <FiMapPin className={ICON_CLASS} aria-hidden="true" />
          )
        }
        label="Địa điểm"
        value={place}
      />
      <MetaRow
        icon={<FiAward className={ICON_CLASS} aria-hidden="true" />}
        label="Giờ tình nguyện"
        value={`${a.hours_awarded} giờ`}
      />
      {a.max_participants ? (
        <MetaRow
          icon={<FiUsers className={ICON_CLASS} aria-hidden="true" />}
          label="Số lượng"
          value={capacity}
        />
      ) : null}
      {a.registration_deadline && (
        <MetaRow
          icon={<FiClock className={ICON_CLASS} aria-hidden="true" />}
          label="Hạn đăng ký"
          value={formatDateTime(a.registration_deadline)}
        />
      )}
    </ul>
  );
}
