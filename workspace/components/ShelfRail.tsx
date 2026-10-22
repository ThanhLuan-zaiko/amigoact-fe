import type { ReactElement } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { DeskCard } from "./DeskCard.tsx";

interface ShelfRailProps {
  shelf: "draft" | "trash";
  writeHref: string;
}

// Side rail tile sitting next to the 8-column drafts/trash list: a writing
// CTA for drafts, a permanent-delete warning for the trash shelf.
export function ShelfRail({ shelf, writeHref }: ShelfRailProps): ReactElement {
  if (shelf === "draft") {
    return <DeskCard writeHref={writeHref} />;
  }
  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiAlertTriangle
          className="h-5 w-5 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Trước khi xóa hẳn
        </h3>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Khôi phục đưa bài viết về trạng thái trước khi xóa. Xóa vĩnh viễn sẽ
        xóa luôn tệp đính kèm và không thể hoàn tác.
      </p>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Bản nháp trong thùng rác chỉ hiển thị với tác giả.
      </p>
    </Section>
  );
}
