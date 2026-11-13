import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { getDeletedOrganizations } from "@/lib/organizationApi";
import DeletedOrganizations from "../../_components/organizations/DeletedOrganizations";
import { mutedText, neutralButton } from "../../_components/ui";

export const metadata: Metadata = { title: "Tổ chức đã xóa | AmigoACT" };

async function TrashContent() {
  const deleted = await getDeletedOrganizations();
  if (deleted.length === 0) {
    return <p className={mutedText}>Chưa có tổ chức nào đã xóa.</p>;
  }
  return <DeletedOrganizations organizations={deleted} />;
}

// The owner's deleted organizations, linked from "Tổ chức của tôi". Restoring is only possible here.
export default function TrashPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/organizations" className={neutralButton}>
          <FiArrowLeft aria-hidden="true" />
          Quay lại
        </Link>
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight">Tổ chức đã xóa</h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <TrashContent />
      </Suspense>
    </div>
  );
}
