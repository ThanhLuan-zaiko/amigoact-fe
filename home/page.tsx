import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiLogIn, FiMail, FiUserPlus } from "react-icons/fi";
import { useSession } from "../auth/hooks.ts";
import { Avatar } from "../core/components/Avatar.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { Section } from "../core/components/Section.tsx";
import { DiscoverySections } from "../activities/components/DiscoverySections.tsx";
import { useDiscovery } from "../activities/hooks.ts";
import { useMyMemberships } from "../dashboard/members-hooks.ts";
import { usePublicOrgs } from "../orgs/hooks.ts";

// Edge-to-edge feed row: the negative margin cancels the section padding so
// the hover surface runs border to border, like an X timeline row.
const FEED_ROW =
  "-mx-4 flex items-center gap-3 border-t border-zinc-200 px-4 py-3 " +
  "transition-colors first:border-t-0 hover:bg-zinc-50 " +
  "focus-visible:outline-2 focus-visible:outline-brand " +
  "dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus-visible:outline-brand";

function GuestHero(): ReactElement {
  return (
    <Section>
      <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Tình nguyện bắt đầu từ đây
      </h2>
      <p className="mt-1 text-[15px] text-zinc-600 dark:text-zinc-400">
        Tham gia hoạt động, tích giờ tình nguyện và nhận chứng nhận cùng các
        tổ chức trong cộng đồng.
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
    </Section>
  );
}

function InviteSection(): ReactElement | null {
  const invites = useMyMemberships("invited");
  const items = invites.data?.items ?? [];
  if (items.length === 0) return null;
  const names = items
    .slice(0, 3)
    .map((m) => m.org_name)
    .join(", ");
  return (
    <Section>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand dark:bg-brand/10">
          <FiMail className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
            {`${items.length} lời mời tham gia tổ chức`}
          </h2>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">
            {names}
          </p>
        </div>
        <Button
          to="/manage/members"
          variant="secondary"
          icon={<FiChevronRight className="h-4 w-4" aria-hidden="true" />}
        >
          Xem
        </Button>
      </div>
    </Section>
  );
}

function DiscoverySection(): ReactElement | null {
  const discovery = useDiscovery();
  const data = discovery.data;
  const hasItems =
    data !== undefined &&
    (data.featured.length > 0 ||
      data.upcoming.length > 0 ||
      data.categories.some((c) => c.items.length > 0));
  if (discovery.isSuccess && !hasItems) return null;
  return (
    <Section>
      <h2 className="sr-only">Khám phá hoạt động</h2>
      {discovery.isError ? (
        <ErrorState
          title="Không tải được gợi ý"
          message="Vui lòng thử lại sau ít phút."
        />
      ) : (
        <DiscoverySections />
      )}
    </Section>
  );
}

function OrgFeed(): ReactElement {
  const orgs = usePublicOrgs({ sort: "members", limit: 6 });
  const items = orgs.data?.items ?? [];
  return (
    <Section>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
          Tổ chức nổi bật
        </h2>
        <Link
          to="/orgs"
          className="shrink-0 text-sm font-medium text-zinc-500 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-brand dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:outline-brand"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="-mb-4 mt-1">
        {orgs.isPending && <LoadingState label="Đang tải tổ chức…" />}
        {orgs.isError && (
          <ErrorState
            title="Không tải được tổ chức"
            message="Vui lòng thử lại sau ít phút."
          />
        )}
        {orgs.isSuccess && items.length === 0 && (
          <EmptyState
            title="Chưa có tổ chức"
            message="Tổ chức công khai sẽ hiện ở đây."
          />
        )}
        {items.map((org) => (
          <Link
            key={org.id}
            to={`/orgs/${org.slug}`}
            className={FEED_ROW}
          >
            <Avatar name={org.name} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold text-zinc-900 dark:text-zinc-100">
                {org.name}
              </span>
              <span className="block truncate text-[13px] text-zinc-500 dark:text-zinc-400">
                {`${org.member_count} thành viên`}
              </span>
            </span>
            <FiChevronRight
              className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </Section>
  );
}

export function HomePage(): ReactElement {
  const session = useSession();
  return (
    <>
      <h1 className="sr-only">Trang chủ</h1>
      {!session.isPending && session.data === null && <GuestHero />}
      {session.data != null && <InviteSection />}
      <DiscoverySection />
      <OrgFeed />
    </>
  );
}
