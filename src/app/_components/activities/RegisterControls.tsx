import { FiCalendar, FiCheck, FiList, FiUsers, FiX } from "react-icons/fi";
import {
  cancelRegistration,
  registerForActivity,
} from "@/app/_actions/activities";
import {
  type ActivityDetail,
  formatDateTime,
  type Shift,
  seatsText,
} from "@/lib/activities";
import IconStat from "../IconStat";
import ActionButton from "../organizations/ActionButton";
import { primaryButton, secondaryButton, sectionTitle } from "../ui";
import RegistrationBadge from "./RegistrationBadge";

// What the viewer can do for one seat: the whole activity, or one shift of it.
function SeatControl({
  activity,
  shift,
}: {
  activity: ActivityDetail;
  shift: Shift | null;
}) {
  const shiftId = shift?.id ?? null;
  const registration = activity.viewer.registrations.find(
    (item) => item.shift_id === shiftId,
  );
  const active =
    registration &&
    ["pending", "approved", "waitlisted"].includes(registration.status);
  const capacity = shift ? shift.capacity : activity.capacity;
  const taken = shift ? shift.seats_taken : activity.seats_taken;
  const full = capacity !== null && taken >= capacity;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {registration ? (
        <RegistrationBadge
          status={registration.status}
          waitlistPosition={registration.waitlist_position}
        />
      ) : null}
      {active && activity.can_cancel_registration ? (
        <ActionButton
          action={cancelRegistration.bind(null, registration.id)}
          label="Hủy đăng ký"
          confirmLabel="Hủy đăng ký?"
        >
          <FiX aria-hidden="true" />
        </ActionButton>
      ) : null}
      {!registration && activity.registration_open ? (
        <ActionButton
          action={registerForActivity.bind(null, activity.id, shiftId)}
          label={full ? "Hết chỗ, vào danh sách chờ" : "Đăng ký"}
          className={full ? secondaryButton : primaryButton}
        >
          {full ? (
            <FiList aria-hidden="true" />
          ) : (
            <FiCheck aria-hidden="true" />
          )}
          {full ? "Xếp hàng chờ" : "Đăng ký"}
        </ActionButton>
      ) : null}
    </div>
  );
}

type RegisterControlsProps = {
  activity: ActivityDetail;
};

export default function RegisterControls({ activity }: RegisterControlsProps) {
  if (activity.shifts.length === 0) {
    return <SeatControl activity={activity} shift={null} />;
  }
  return (
    <div className="flex flex-col gap-2">
      <h2 className={sectionTitle}>Ca</h2>
      <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
        {activity.shifts.map((shift) => (
          <li key={shift.id} className="flex flex-wrap items-center gap-3 py-3">
            <div className="flex min-w-0 flex-1 basis-48 flex-col gap-1">
              <p className="truncate text-sm font-semibold">{shift.title}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <IconStat icon={FiCalendar} label="Thời gian">
                  {formatDateTime(shift.start_at)} –{" "}
                  {formatDateTime(shift.end_at)}
                </IconStat>
                <IconStat icon={FiUsers} label="Số chỗ">
                  {seatsText(shift.seats_taken, shift.capacity)}
                </IconStat>
              </div>
            </div>
            <SeatControl activity={activity} shift={shift} />
          </li>
        ))}
      </ul>
    </div>
  );
}
