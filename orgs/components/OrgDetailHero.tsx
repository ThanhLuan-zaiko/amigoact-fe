import type { ReactElement } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiImage,
  FiLogIn,
  FiMail,
  FiMapPin,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { orgMediaUrl, type PublicOrgDetail } from "../api.ts";
import { useJoinOrg } from "../hooks.ts";
import { JOIN_POLICY_LABELS, toVietnameseOrgsMessage } from "../messages.tsx";
import { KindPill } from "./KindPill.tsx";
import { OrgLogo } from "./OrgLogo.tsx";

interface OrgDetailHeroProps {
  org: PublicOrgDetail;
}

function joinCta(
  org: PublicOrgDetail,
  signedIn: boolean,
  join: ReturnType<typeof useJoinOrg>,
): ReactElement {
  if (org.join_policy === "invite") {
    return (
      <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
        <FiMail className="h-4 w-4" aria-hidden="true" />
        Tổ chức này nhận thành viên qua lời mời
      </p>
    );
  }
  if (!signedIn) {
    return (
      <Button
        to="/login"
        variant="primary"
        icon={<FiLogIn className="h-4 w-4" aria-hidden="true" />}
      >
        Đăng nhập để tham gia
      </Button>
    );
  }
  if (join.isSuccess) {
    return (
      <Button
        variant="secondary"
        disabled
        icon={<FiCheckCircle className="h-4 w-4" aria-hidden="true" />}
      >
        Đã tham gia
      </Button>
    );
  }
  return (
    <Button
      variant="primary"
      disabled={join.isPending}
      onClick={() => join.mutate(org.id)}
      icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
    >
      {join.isPending ? "Đang tham gia…" : "Tham gia tổ chức"}
    </Button>
  );
}

export function OrgDetailHero({ org }: OrgDetailHeroProps): ReactElement {
  const session = useSession();
  const join = useJoinOrg(org.slug);
  const location = org.city ?? org.country;
  const joined = new Date(org.created_at).toLocaleDateString("vi-VN", {
    month: "2-digit",
    year: "numeric",
  });
  return (
    <BentoCard className="md:col-span-6 lg:col-span-8">
      <div data-rise>
        {org.cover_url ? (
          <img
            src={orgMediaUrl(org.cover_url)}
            alt=""
            className="h-36 w-full rounded-xl object-cover sm:h-44"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-zinc-400 dark:border-brand/30 dark:text-zinc-500">
            <FiImage className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <div className="px-1">
          <span className="-mt-9 block w-fit rounded-full bg-white p-1 dark:bg-zinc-950">
            <OrgLogo org={org} className="h-16 w-16" iconClassName="h-7 w-7" />
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
              {org.name}
            </h1>
            {org.verified_at !== null && (
              <FiCheckCircle
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                role="img"
                aria-label="Đã xác minh"
              />
            )}
            <KindPill kind={org.kind} />
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
              {JOIN_POLICY_LABELS[org.join_policy] ?? org.join_policy}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            @{org.slug}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="h-4 w-4" aria-hidden="true" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiUsers className="h-4 w-4" aria-hidden="true" />
              {`${org.member_count} thành viên`}
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar className="h-4 w-4" aria-hidden="true" />
              {`Tham gia từ ${joined}`}
            </span>
            <span className="flex items-center gap-1">
              <FiCheckCircle className="h-4 w-4" aria-hidden="true" />
              {`${org.activity_count} hoạt động`}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {joinCta(org, session.data != null, join)}
            <Button
              to="/orgs"
              variant="ghost"
              icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
            >
              Về danh sách
            </Button>
            {join.isError && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                {toVietnameseOrgsMessage(join.error.code)}
              </p>
            )}
          </div>
        </div>
      </div>
    </BentoCard>
  );
}
