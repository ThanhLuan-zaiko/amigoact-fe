import Link from "next/link";
import { FiHash, FiX } from "react-icons/fi";

// Shown above a list filtered by a tag. The cross goes back to the whole list.
export default function TagFilterBar({
  label,
  clearHref,
}: {
  label: string;
  clearHref: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-teal-700 bg-teal-50 py-1 pr-1 pl-2 text-sm font-semibold text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400">
        <FiHash aria-hidden="true" className="shrink-0" />
        <span className="truncate">{label}</span>
        <Link
          href={clearHref}
          aria-label={`Bỏ lọc thẻ ${label}`}
          title="Bỏ lọc thẻ"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm hover:bg-teal-100 dark:hover:bg-teal-900/40"
        >
          <FiX aria-hidden="true" />
        </Link>
      </span>
    </div>
  );
}
