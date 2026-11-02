import { FiLogOut, FiMonitor, FiXCircle } from "react-icons/fi";
import { logoutAll, revokeSession } from "@/app/_actions/account";
import { getSessions } from "@/lib/auth";
import { describeDevice } from "@/lib/forms";
import { mutedText, secondaryButton } from "../ui";

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export default async function SessionList() {
  const sessions = await getSessions();
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
        {sessions.map((session) => (
          <li
            key={session.session_id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <FiMonitor aria-hidden="true" className="mt-1 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  {describeDevice(session.user_agent)}
                  {session.is_current ? (
                    <span className="ml-2 rounded-sm border border-slate-200 px-1.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                      Thiết bị này
                    </span>
                  ) : null}
                </p>
                <p className={mutedText}>
                  {session.ip ?? "Không rõ IP"} ·{" "}
                  {dateFormat.format(
                    new Date(session.last_seen_at ?? session.created_at),
                  )}
                </p>
              </div>
            </div>
            {session.is_current ? null : (
              <form action={revokeSession.bind(null, session.session_id)}>
                <button
                  type="submit"
                  aria-label="Đăng xuất thiết bị này"
                  className={secondaryButton}
                >
                  <FiXCircle aria-hidden="true" />
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={logoutAll}>
        <button type="submit" className={secondaryButton}>
          <FiLogOut aria-hidden="true" />
          Đăng xuất mọi thiết bị
        </button>
      </form>
    </div>
  );
}
