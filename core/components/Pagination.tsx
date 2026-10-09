import type { ReactElement } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "./Button.tsx";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

type Slot = number | "gap";

// Always keep first/last and the current window; collapse the rest.
function pageWindow(page: number, totalPages: number): Slot[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const keep = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...keep].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  const slots: Slot[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) slots.push("gap");
    slots.push(n);
    prev = n;
  }
  return slots;
}

export function Pagination({ page, totalPages, onPage }: PaginationProps): ReactElement | null {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-1">
      <Button
        type="button"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Trang trước"
        icon={<FiChevronLeft className="h-4 w-4" aria-hidden="true" />}
      />
      {pageWindow(page, totalPages).map((slot, index) =>
        slot === "gap" ? (
          <span
            key={`gap-${index}`}
            aria-hidden="true"
            className="px-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            …
          </span>
        ) : (
          <Button
            key={slot}
            type="button"
            variant={slot === page ? "primary" : "secondary"}
            onClick={() => onPage(slot)}
            aria-current={slot === page ? "page" : undefined}
            aria-label={`Trang ${slot}`}
          >
            {slot}
          </Button>
        ),
      )}
      <Button
        type="button"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        aria-label="Trang sau"
        icon={<FiChevronRight className="h-4 w-4" aria-hidden="true" />}
      />
    </nav>
  );
}
