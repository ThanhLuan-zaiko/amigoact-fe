import { FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { purgePost, restorePost } from "@/app/_actions/posts";
import { formatDateTime } from "@/lib/activities";
import type { TrashPostApi } from "@/lib/posts";
import ActionButton from "../organizations/ActionButton";
import { mutedText, splitList, splitRow } from "../ui";
import ConfirmAction from "./ConfirmAction";

const KIND_LABELS = { announcement: "Thông báo", discussion: "Thảo luận" };

// Restoring is safe, so it runs at once. Removing for good needs the title typed again,
// and only the owner sees that button.
export default function TrashList({
  slug,
  items,
}: {
  slug: string;
  items: TrashPostApi[];
}) {
  return (
    <ul className={splitList}>
      {items.map((item) => (
        <li
          key={item.id}
          className={`${splitRow} flex flex-wrap items-start gap-3`}
        >
          <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
            <p className="font-semibold break-words">{item.title}</p>
            <p className={mutedText}>
              {KIND_LABELS[item.kind]} · Xóa lúc{" "}
              {formatDateTime(item.deleted_at)}
              {item.deleted_by_name ? ` bởi ${item.deleted_by_name}` : ""}
            </p>
            <p className={mutedText}>
              Tự xóa vĩnh viễn vào {formatDateTime(item.purge_at)}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ActionButton
              action={restorePost.bind(null, slug, item.id)}
              label="Khôi phục"
            >
              <FiRotateCcw aria-hidden="true" />
            </ActionButton>
            {item.can_purge ? (
              <ConfirmAction
                action={purgePost.bind(null, slug, item.id)}
                label="Xóa vĩnh viễn"
                icon={<FiTrash2 aria-hidden="true" />}
                title="Xóa vĩnh viễn bài viết?"
                confirmLabel="Xóa vĩnh viễn"
                typeToConfirm={item.title}
              >
                <p>
                  Bài, bình luận và liên kết ảnh của bài sẽ bị xóa hẳn. Việc này
                  không hoàn tác được.
                </p>
              </ConfirmAction>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
