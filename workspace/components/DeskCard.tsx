import type { ReactElement } from "react";
import { FiEdit3 } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";

interface DeskCardProps {
  writeHref: string;
}

// Small feed tile inviting the member back to the writing desk; sits next
// to empty states and the drafts shelf so the CTA is never a bare row.
export function DeskCard({ writeHref }: DeskCardProps): ReactElement {
  return (
    <Section>
      <div data-rise className="flex items-center gap-2">
        <FiEdit3
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Góc viết
        </h3>
      </div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Soạn bài mới với trình biên tập khối — chèn ảnh và video ở bất cứ đoạn
        nào của nội dung.
      </p>
      <div className="mt-3">
        <Button
          to={writeHref}
          variant="primary"
          icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
        >
          Viết bài mới
        </Button>
      </div>
    </Section>
  );
}
