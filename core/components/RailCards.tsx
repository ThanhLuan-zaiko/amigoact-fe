import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  FiAward,
  FiCalendar,
  FiCompass,
  FiHeart,
  FiLogIn,
  FiMail,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useDiscovery } from "../../activities/hooks.ts";
import { useMyCertificates } from "../../certificates/hooks.ts";
import { useMyMemberships } from "../../dashboard/members-hooks.ts";
import { useMyHours } from "../../hours/hooks.ts";
import { useOrgsRealtime, usePublicOrgs } from "../../orgs/hooks.ts";
import { Avatar } from "./Avatar.tsx";
import { Button } from "./Button.tsx";
import { ErrorState, LoadingState } from "./Feedback.tsx";
import { RAIL_ROW, RailCard, RailEmpty } from "./RailCard.tsx";

function formatWhen(iso: string | null): string {
  if (iso === null) return "Chưa có lịch";
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calendar-leaf tile: short month strip over the day number.
function DateBadge({ iso }: { iso: string | null }): ReactElement {
  const date = iso === null ? null : new Date(iso);
  return (
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
    >
      <span className="bg-zinc-900 text-center text-[9px] leading-4 font-bold text-white uppercase dark:bg-zinc-100 dark:text-zinc-950">
        {date ? `Th${date.getMonth() + 1}` : "--"}
      </span>
      <span className="flex-1 text-center text-base leading-6 font-extrabold text-zinc-900 tabular-nums dark:text-zinc-100">
        {date ? date.getDate() : "?"}
      </span>
    </span>
  );
}

// Signed-in personal summary (X "Premium" slot): hours, certificates and
// pending invites, linking to the volunteer profile.
export function JourneyCard(): ReactElement {
  const hours = useMyHours();
  const certificates = useMyCertificates();
  const invites = useMyMemberships("invited").data?.total ?? 0;
  const totalHours = (hours.data?.summaries ?? []).reduce(
    (sum, item) => sum + item.total_hours,
    0,
  );

  return (
    <RailCard title="Hành trình của bạn" Icon={FiAward}>
      <div className="px-4 pb-4" aria-busy={hours.isPending || certificates.isPending}>
        {hours.isPending || certificates.isPending ? (
          <LoadingState label="Đang tải thành tích…" />
        ) : hours.isError || certificates.isError ? (
          <ErrorState
            title="Không tải được thành tích"
            message="Vui lòng thử lại sau ít phút."
          />
        ) : (
          <dl className="grid grid-cols-2 gap-3">
            <div>
              <dt className="text-[13px] text-zinc-500 dark:text-zinc-400">Giờ tình nguyện</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                {totalHours.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}
              </dd>
            </div>
            <div>
              <dt className="text-[13px] text-zinc-500 dark:text-zinc-400">Chứng nhận</dt>
              <dd className="text-2xl font-extrabold tracking-tight text-zinc-900 tabular-nums dark:text-zinc-100">
                {certificates.data.length}
              </dd>
            </div>
          </dl>
        )}
        {invites > 0 && (
          <Link
            to="/manage/members"
            className="mt-3 flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:outline-zinc-400"
          >
            <FiMail className="h-4 w-4 shrink-0" aria-hidden="true" />
            {`${invites} lời mời tham gia tổ chức đang chờ`}
          </Link>
        )}
        <div className="mt-3">
          <Button
            to="/manage/volunteer"
            icon={<FiHeart className="h-4 w-4" aria-hidden="true" />}
          >
            Xem hồ sơ
          </Button>
        </div>
      </div>
    </RailCard>
  );
}

// Guest slot (X "New to X?"): sign-up and sign-in entry points.
export function JoinCard(): ReactElement {
  return (
    <RailCard title="Mới đến AmigoACT?" Icon={FiCompass}>
      <div className="px-4 pb-4">
        <p className="text-[15px] text-zinc-600 dark:text-zinc-400">
          Tạo tài khoản để tham gia hoạt động, tích giờ tình nguyện và nhận chứng nhận.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            to="/register"
            icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Tạo tài khoản
          </Button>
          <Button
            to="/login"
            variant="secondary"
            icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    </RailCard>
  );
}

// X "What's happening": the next public activities.
export function UpcomingCard(): ReactElement {
  const discovery = useDiscovery();
  const data = discovery.data;
  const items = (data && data.upcoming.length > 0 ? data.upcoming : (data?.featured ?? [])).slice(0, 4);

  return (
    <RailCard title="Sắp diễn ra" Icon={FiCalendar} moreTo={items.length > 0 ? "/events" : undefined}>
      {discovery.isPending ? (
        <div className="px-4 pb-4"><LoadingState label="Đang tải sự kiện…" /></div>
      ) : discovery.isError ? (
        <div className="px-4 pb-4">
          <ErrorState title="Không tải được sự kiện" message="Vui lòng thử lại sau ít phút." />
        </div>
      ) : items.length === 0 ? (
        <RailEmpty title="Chưa có sự kiện" message="Hoạt động sắp mở sẽ hiện ở đây." />
      ) : (
        <ul>
          {items.map((activity) => (
            <li key={activity.id}>
              <Link to={`/events/${activity.org_id}/${activity.slug}`} className={`${RAIL_ROW} flex items-start gap-3`}>
                <DateBadge iso={activity.start_at} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] text-zinc-500 dark:text-zinc-400">
                    {formatWhen(activity.start_at)}
                  </span>
                  <span className="line-clamp-2 text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                    {activity.title}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RailCard>
  );
}

// X "Who to follow": the largest public organizations. The card owns its
// own orgs:directory subscription so logo/media edits revalidate it on any
// route that renders the rail, not only the directory tab.
export function SuggestedOrgsCard(): ReactElement {
  useOrgsRealtime();
  const orgs = usePublicOrgs({ sort: "members", limit: 3 });
  const items = orgs.data?.items ?? [];

  return (
    <RailCard title="Tổ chức nổi bật" Icon={FiUsers} moreTo={items.length > 0 ? "/" : undefined}>
      {orgs.isPending ? (
        <div className="px-4 pb-4"><LoadingState label="Đang tải tổ chức…" /></div>
      ) : orgs.isError ? (
        <div className="px-4 pb-4">
          <ErrorState title="Không tải được tổ chức" message="Vui lòng thử lại sau ít phút." />
        </div>
      ) : items.length === 0 ? (
        <RailEmpty title="Chưa có tổ chức" message="Tổ chức công khai sẽ hiện ở đây." />
      ) : (
        <ul>
          {items.map((org, index) => (
            <li key={org.id}>
              <Link to={`/orgs/${org.slug}`} className={`${RAIL_ROW} flex items-center gap-3`}>
                <span className="w-4 shrink-0 text-center font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {index + 1}
                </span>
                <Avatar name={org.name} src={org.logo_url} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </span>
                  <span className="block truncate text-[13px] text-zinc-500 dark:text-zinc-400">
                    {`${org.member_count} thành viên`}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
                  Xem
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </RailCard>
  );
}
