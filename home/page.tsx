import type { ReactElement } from "react";
import { FiChevronRight, FiLogIn, FiMail, FiUserPlus } from "react-icons/fi";
import { useSession } from "../auth/hooks.ts";
import { Button } from "../core/components/Button.tsx";
import { ErrorState } from "../core/components/Feedback.tsx";
import { Section } from "../core/components/Section.tsx";
import { DiscoverySections } from "../activities/components/DiscoverySections.tsx";
import { useDiscovery } from "../activities/hooks.ts";
import { useMyMemberships } from "../dashboard/members-hooks.ts";
import { OrgDirectory } from "../orgs/components/OrgDirectory.tsx";
import { AnnouncementTimeline } from "../orgs/components/AnnouncementTimeline.tsx";

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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
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

export function HomePage(): ReactElement {
  const session = useSession();
  return (
    <>
      <h1 className="sr-only">Trang chủ</h1>
      {!session.isPending && session.data === null && <GuestHero />}
      {session.data != null && <InviteSection />}
      <AnnouncementTimeline />
      <DiscoverySection />
      <OrgDirectory />
    </>
  );
}
