import type { IconType } from "react-icons";
import {
  FiCheckCircle,
  FiClock,
  FiList,
  FiSlash,
  FiStar,
  FiXCircle,
} from "react-icons/fi";
import {
  REGISTRATION_STATUS_LABELS,
  type RegistrationStatus,
} from "@/lib/activities";
import { tagChip } from "../ui";

const STATUS_ICONS: Record<RegistrationStatus, IconType> = {
  pending: FiClock,
  approved: FiCheckCircle,
  rejected: FiXCircle,
  waitlisted: FiList,
  cancelled: FiSlash,
  attended: FiStar,
};

type RegistrationBadgeProps = {
  status: RegistrationStatus;
  waitlistPosition?: number | null;
};

export default function RegistrationBadge({
  status,
  waitlistPosition,
}: RegistrationBadgeProps) {
  const Icon = STATUS_ICONS[status];
  return (
    <span className={`${tagChip} shrink-0 gap-1`}>
      <Icon aria-hidden="true" />
      {REGISTRATION_STATUS_LABELS[status]}
      {waitlistPosition ? ` #${waitlistPosition}` : ""}
    </span>
  );
}
