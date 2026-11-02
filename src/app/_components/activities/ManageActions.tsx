import Link from "next/link";
import { BsQrCode } from "react-icons/bs";
import {
  FiCheckSquare,
  FiClock,
  FiEdit2,
  FiFlag,
  FiSend,
  FiSlash,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import {
  cancelActivity,
  completeActivity,
  deleteActivity,
  publishActivity,
} from "@/app/_actions/activities";
import type { ActivityDetail } from "@/lib/activities";
import ActionButton from "../organizations/ActionButton";
import { iconButton, primaryButton } from "../ui";

type ManageActionsProps = {
  activity: ActivityDetail;
};

export default function ManageActions({ activity }: ManageActionsProps) {
  const { id, status } = activity;
  const editable = status === "draft" || status === "published";

  return (
    <div className="flex flex-wrap items-start gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
      {status === "draft" ? (
        <ActionButton
          action={publishActivity.bind(null, id)}
          label="Đăng hoạt động"
          className={primaryButton}
        >
          <FiSend aria-hidden="true" />
          Đăng
        </ActionButton>
      ) : null}
      {editable ? (
        <Link
          href={`/activities/${id}/edit`}
          aria-label="Sửa"
          title="Sửa"
          className={iconButton}
        >
          <FiEdit2 aria-hidden="true" />
        </Link>
      ) : null}
      {status !== "draft" ? (
        <Link
          href={`/activities/${id}/registrations`}
          aria-label="Người đăng ký"
          title="Người đăng ký"
          className={iconButton}
        >
          <FiUsers aria-hidden="true" />
        </Link>
      ) : null}
      {status === "published" || status === "completed" ? (
        <>
          <Link
            href={`/activities/${id}/attendance`}
            aria-label="Điểm danh"
            title="Điểm danh"
            className={iconButton}
          >
            <BsQrCode aria-hidden="true" />
          </Link>
          <Link
            href={`/activities/${id}/appeals`}
            aria-label="Khiếu nại"
            title="Khiếu nại"
            className={iconButton}
          >
            <FiFlag aria-hidden="true" />
          </Link>
        </>
      ) : null}
      {status === "completed" ? (
        <Link
          href={`/activities/${id}/hours`}
          aria-label="Giờ tình nguyện"
          title="Giờ tình nguyện"
          className={iconButton}
        >
          <FiClock aria-hidden="true" />
        </Link>
      ) : null}
      {status === "published" ? (
        <>
          <ActionButton
            action={completeActivity.bind(null, id)}
            label="Kết thúc hoạt động"
            confirmLabel="Kết thúc và ghi giờ?"
          >
            <FiCheckSquare aria-hidden="true" />
          </ActionButton>
          <ActionButton
            action={cancelActivity.bind(null, id)}
            label="Hủy hoạt động"
            confirmLabel="Hủy hoạt động và mọi đăng ký?"
          >
            <FiSlash aria-hidden="true" />
          </ActionButton>
        </>
      ) : null}
      {status === "draft" ? (
        <ActionButton
          action={deleteActivity.bind(null, id, activity.organization_slug)}
          label="Xóa bản nháp"
          confirmLabel="Xóa bản nháp?"
        >
          <FiTrash2 aria-hidden="true" />
        </ActionButton>
      ) : null}
    </div>
  );
}
