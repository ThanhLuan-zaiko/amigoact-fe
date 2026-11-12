import { FiCalendar, FiRotateCcw, FiTrash2 } from "react-icons/fi";
import { purgeActivity, restoreActivity } from "@/app/_actions/activities";
import { formatDateTime } from "@/lib/activities";
import type { ActivityTrashItem } from "@/lib/activityList";
import IconStat from "../IconStat";
import ActionButton from "../organizations/ActionButton";
import ConfirmAction from "../posts/ConfirmAction";
import { mutedText, splitList, splitRow } from "../ui";

// Restoring is safe, so it runs at once and the activity comes back as a draft.
// Removing for good needs the title typed again, and only the owner sees it.
export default function ActivityTrashList({
  slug,
  items,
}: {
  slug: string;
  items: ActivityTrashItem[];
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
            {item.start_at ? (
              <IconStat icon={FiCalendar} label="Thời gian">
                {formatDateTime(item.start_at)}
              </IconStat>
            ) : null}
            <p className={mutedText}>
              Xóa lúc {formatDateTime(item.deleted_at)} · Tự xóa vĩnh viễn vào{" "}
              {formatDateTime(item.purge_at)}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ActionButton
              action={restoreActivity.bind(null, slug, item.id)}
              label="Khôi phục"
            >
              <FiRotateCcw aria-hidden="true" />
            </ActionButton>
            {item.can_purge ? (
              <ConfirmAction
                action={purgeActivity.bind(null, slug, item.id)}
                label="Xóa vĩnh viễn"
                icon={<FiTrash2 aria-hidden="true" />}
                title="Xóa vĩnh viễn hoạt động?"
                confirmLabel="Xóa vĩnh viễn"
                typeToConfirm={item.title}
              >
                <p>
                  Bản nháp và các ca của nó sẽ bị xóa hẳn. Việc này không hoàn
                  tác được.
                </p>
              </ConfirmAction>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
