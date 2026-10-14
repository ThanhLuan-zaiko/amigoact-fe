import type { ReactElement } from "react";
import { FiCheckCircle, FiPlusCircle } from "react-icons/fi";

interface OrgCreateNotesProps {
  createdName: string | null;
  uploading: boolean;
  uploadNote: string | null;
}

export function OrgCreateNotes({
  createdName,
  uploading,
  uploadNote,
}: OrgCreateNotesProps): ReactElement | null {
  return (
    <>
      {createdName && (
        <p
          role="status"
          className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-300 bg-zinc-100 p-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          <FiCheckCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          Đã tạo “{createdName}”. Mời thêm thành viên và mở sự kiện đầu tiên.
        </p>
      )}
      {(uploading || uploadNote) && (
        <p
          role="status"
          className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm text-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
        >
          <FiPlusCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {uploading ? "Đang tải ảnh/video lên…" : uploadNote}
        </p>
      )}
    </>
  );
}
