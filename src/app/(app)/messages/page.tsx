import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiChevronRight, FiMessageCircle } from "react-icons/fi";
import { requireUser } from "@/lib/auth";
import { badgeText, chatPath } from "@/lib/chat";
import { getChatUnreadTotal } from "@/lib/chatApi";
import { getMyOrganizations } from "@/lib/organizationApi";
import { initials } from "@/lib/organizations";
import EmptyState from "../../_components/EmptyState";
import {
  mutedText,
  panel,
  sectionTitle,
  splitList,
  splitRow,
} from "../../_components/ui";

export const metadata: Metadata = { title: "Tin nhắn | AmigoACT" };

// Chat lives inside each organization. This page lists the organizations the viewer can chat in.
async function ChatDirectory() {
  await requireUser("/messages");
  const organizations = (await getMyOrganizations()).filter(
    (organization) => organization.status === "active",
  );
  if (organizations.length === 0) {
    return (
      <EmptyState
        title="Chưa có cuộc trò chuyện"
        description="Tham gia một tổ chức để trò chuyện cùng các thành viên."
      />
    );
  }
  const totals = await Promise.all(
    organizations.map((organization) => getChatUnreadTotal(organization.slug)),
  );

  return (
    <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
      <h1 className={`${sectionTitle} flex items-center gap-2`}>
        <FiMessageCircle aria-hidden="true" />
        Tin nhắn
      </h1>
      <ul className={splitList}>
        {organizations.map((organization, index) => {
          const unread = totals[index] ?? 0;
          return (
            <li key={organization.id} className={splitRow}>
              <Link
                href={chatPath(organization.slug)}
                className="flex items-center gap-3 py-3 transition-colors hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 dark:hover:text-teal-400 dark:focus-visible:outline-teal-400"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300"
                >
                  {initials(organization.name)}
                </span>
                <span
                  className={`min-w-0 flex-1 truncate text-sm ${unread > 0 ? "font-bold" : "font-semibold"}`}
                >
                  {organization.name}
                </span>
                {unread > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-teal-700 px-1.5 py-0.5 text-xs font-bold text-white dark:bg-teal-400 dark:text-teal-950">
                    <span className="sr-only">Chưa đọc: </span>
                    {badgeText(unread)}
                  </span>
                ) : null}
                <FiChevronRight aria-hidden="true" className="text-slate-400" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <ChatDirectory />
    </Suspense>
  );
}
