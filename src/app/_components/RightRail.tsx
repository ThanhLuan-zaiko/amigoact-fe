import Link from "next/link";
import { Suspense } from "react";
import { FiChevronRight } from "react-icons/fi";
import UpcomingActivities from "./activities/UpcomingActivities";
import SuggestedOrganizations from "./organizations/SuggestedOrganizations";
import { mutedText, panel, sectionTitle, tagChip } from "./ui";

type RightRailProps = {
  popularTags: string[];
};

function SectionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
    >
      <FiChevronRight aria-hidden="true" />
    </Link>
  );
}

export default function RightRail({ popularTags }: RightRailProps) {
  return (
    <div className="flex flex-col gap-4">
      <section className={`${panel} flex flex-col gap-3 p-4`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={sectionTitle}>Sắp diễn ra</h2>
          <SectionLink href="/explore" label="Xem tất cả hoạt động" />
        </div>
        <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
          <UpcomingActivities />
        </Suspense>
      </section>

      <section className={`${panel} flex flex-col gap-3 p-4`}>
        <div className="flex items-center justify-between gap-2">
          <h2 className={sectionTitle}>Tổ chức gợi ý</h2>
          <SectionLink href="/organizations" label="Xem tất cả tổ chức" />
        </div>
        <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
          <SuggestedOrganizations />
        </Suspense>
      </section>

      <section className={`${panel} flex flex-col gap-3 p-4`}>
        <h2 className={sectionTitle}>Thẻ phổ biến</h2>
        {popularTags.length === 0 ? (
          <p className={mutedText}>Chưa có thẻ nào.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <li key={tag} className={tagChip}>
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
