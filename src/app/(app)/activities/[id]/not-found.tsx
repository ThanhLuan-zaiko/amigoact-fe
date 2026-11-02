import Link from "next/link";
import { FiCompass } from "react-icons/fi";
import EmptyState from "../../../_components/EmptyState";
import { secondaryButton } from "../../../_components/ui";

export default function ActivityNotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="w-full">
        <EmptyState
          title="Không tìm thấy hoạt động"
          description="Hoạt động này không tồn tại hoặc chưa được đăng."
        />
      </div>
      <Link href="/explore" className={secondaryButton}>
        <FiCompass aria-hidden="true" />
        Khám phá
      </Link>
    </div>
  );
}
