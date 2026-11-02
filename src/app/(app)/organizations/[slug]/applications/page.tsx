import type { Metadata } from "next";
import { Suspense } from "react";
import { FiCalendar, FiCheck, FiX } from "react-icons/fi";
import {
  approveApplication,
  rejectApplication,
} from "@/app/_actions/organizations";
import { requireUser } from "@/lib/auth";
import { getApplications } from "@/lib/organizationApi";
import { formatDate, initials, parseOffset } from "@/lib/organizations";
import EmptyState from "../../../../_components/EmptyState";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import PageLinks from "../../../../_components/organizations/PageLinks";
import {
  mutedText,
  panel,
  primaryButton,
  sectionTitle,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Yêu cầu tham gia | AmigoACT" };

async function ApplicationList({
  params,
  searchParams,
}: PageProps<"/organizations/[slug]/applications">) {
  const { slug } = await params;
  const offset = parseOffset((await searchParams).offset);
  await requireUser(`/organizations/${slug}/applications`);
  const page = await getApplications(slug, offset);
  if (!page) {
    return (
      <p className={mutedText}>
        Chỉ ban quản trị mới xem được các yêu cầu này.
      </p>
    );
  }
  if (page.items.length === 0 && offset === 0) {
    return (
      <EmptyState
        title="Không có yêu cầu nào"
        description="Yêu cầu tham gia mới sẽ hiện ở đây."
      />
    );
  }

  return (
    <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <h2 className={sectionTitle}>Yêu cầu tham gia</h2>
      <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
        {page.items.map((application) => (
          <li
            key={application.user_id}
            className="flex flex-wrap items-start gap-3 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
              {initials(application.full_name)}
            </div>
            <div className="min-w-0 flex-1 basis-48">
              <p className="truncate text-sm font-semibold">
                {application.full_name}
              </p>
              <IconStat icon={FiCalendar} label="Ngày gửi">
                {formatDate(application.submitted_at)}
              </IconStat>
              {application.message ? (
                <p className="mt-1 text-sm break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
                  {application.message}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <ActionButton
                action={approveApplication.bind(
                  null,
                  slug,
                  application.user_id,
                )}
                label="Duyệt"
                className={primaryButton}
              >
                <FiCheck aria-hidden="true" />
              </ActionButton>
              <ActionButton
                action={rejectApplication.bind(null, slug, application.user_id)}
                label="Từ chối"
                confirmLabel="Từ chối?"
              >
                <FiX aria-hidden="true" />
              </ActionButton>
            </div>
          </li>
        ))}
      </ul>
      <PageLinks
        path={`/organizations/${slug}/applications`}
        offset={offset}
        nextOffset={page.next_offset}
      />
    </section>
  );
}

export default function ApplicationsPage(
  props: PageProps<"/organizations/[slug]/applications">,
) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <ApplicationList {...props} />
    </Suspense>
  );
}
