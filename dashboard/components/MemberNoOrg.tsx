import type { ReactElement } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";

export function MemberNoOrg(): ReactElement {
  return (
    <>
      <EmptyState
        title="Chưa có tổ chức nào"
        message="Tạo tổ chức trước, rồi mời và quản lý thành viên tại đây."
      />
      <div className="mt-3">
        <Button
          to="/manage/orgs/create"
          variant="primary"
          icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
        >
          Tạo tổ chức
        </Button>
      </div>
    </>
  );
}
