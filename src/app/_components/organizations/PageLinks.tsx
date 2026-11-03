import Form from "next/form";
import Link from "next/link";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { lastPage, PAGE_SIZE, pageHref, pageNumbers } from "@/lib/pagination";
import { iconButton } from "../ui";

type PageLinksProps = {
  // The page path with any search params every page should keep.
  path: string;
  offset: number;
  total: number;
};

const CURRENT_PAGE =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-teal-700 bg-teal-50 px-2 text-sm font-semibold text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400";

export default function PageLinks({ path, offset, total }: PageLinksProps) {
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const last = lastPage(total);
  if (page === 1 && last === 1) {
    return null;
  }
  const [action, query] = path.split("?");
  const kept = Array.from(new URLSearchParams(query));

  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link
          href={pageHref(path, Math.min(page - 1, last))}
          aria-label="Trang trước"
          title="Trang trước"
          className={iconButton}
        >
          <FiChevronLeft aria-hidden="true" />
        </Link>
      ) : null}
      {pageNumbers(page, last).map((item, index) =>
        item === "gap" ? (
          // A gap has no identity of its own. Its place in the row is stable enough.
          // biome-ignore lint/suspicious/noArrayIndexKey: at most two gaps, never reordered.
          <span key={`gap-${index}`} aria-hidden="true" className="px-1">
            …
          </span>
        ) : item === page ? (
          <span key={item} aria-current="page" className={CURRENT_PAGE}>
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={pageHref(path, item)}
            aria-label={`Trang ${item}`}
            className={`${iconButton} w-auto min-w-10 px-2 text-sm`}
          >
            {item}
          </Link>
        ),
      )}
      {page < last ? (
        <Link
          href={pageHref(path, page + 1)}
          aria-label="Trang sau"
          title="Trang sau"
          className={iconButton}
        >
          <FiChevronRight aria-hidden="true" />
        </Link>
      ) : null}
      <Form action={action} className="flex items-center gap-1">
        {kept.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input
          type="number"
          name="page"
          min={1}
          max={last}
          required
          aria-label={`Đi tới trang, từ 1 đến ${last}`}
          placeholder="Trang"
          className="h-10 w-20 rounded-md border border-slate-200 bg-transparent px-2 text-sm outline-none focus:border-teal-700 dark:border-slate-800 dark:focus:border-teal-400"
        />
        <button
          type="submit"
          aria-label="Đi tới trang"
          title="Đi tới trang"
          className={iconButton}
        >
          <FiArrowRight aria-hidden="true" />
        </button>
      </Form>
    </nav>
  );
}
