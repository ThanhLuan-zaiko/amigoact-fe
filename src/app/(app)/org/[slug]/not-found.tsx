import Link from "next/link";
import EmptyState from "../../../_components/EmptyState";
import { secondaryButton } from "../../../_components/ui";

export default function OrganizationNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-full">
        <EmptyState
          title="Không tìm thấy tổ chức"
          description="Tổ chức này không tồn tại hoặc không còn hoạt động."
        />
      </div>
      <Link href="/organizations" className={secondaryButton}>
        Xem các tổ chức khác
      </Link>
    </div>
  );
}
