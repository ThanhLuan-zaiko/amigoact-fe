import Link from "next/link";
import { FiChevronRight, FiChevronsLeft } from "react-icons/fi";
import { iconButton } from "../ui";

type PageLinksProps = {
  // The page path with any search params the next page should keep.
  path: string;
  offset: number;
  nextOffset: number | null;
};

function withOffset(path: string, offset: number): string {
  return `${path}${path.includes("?") ? "&" : "?"}offset=${offset}`;
}

export default function PageLinks({
  path,
  offset,
  nextOffset,
}: PageLinksProps) {
  if (offset === 0 && nextOffset === null) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {offset > 0 ? (
        <Link
          href={path}
          aria-label="Về trang đầu"
          title="Về trang đầu"
          className={iconButton}
        >
          <FiChevronsLeft aria-hidden="true" />
        </Link>
      ) : null}
      {nextOffset !== null ? (
        <Link
          href={withOffset(path, nextOffset)}
          aria-label="Trang sau"
          title="Trang sau"
          className={iconButton}
        >
          <FiChevronRight aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
