import type { Metadata } from "next";
import { Suspense } from "react";
import { getDeletedOrganizations } from "@/lib/organizationApi";
import DeletedOrganizations from "../../_components/organizations/DeletedOrganizations";
import { mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Thùng rác | AmigoACT" };

async function TrashContent() {
  const deleted = await getDeletedOrganizations();
  if (deleted.length === 0) {
    return <p className={mutedText}>Thùng rác trống.</p>;
  }
  return <DeletedOrganizations organizations={deleted} />;
}

// The owner's trash, linked from the side navigation. Restoring works the same as on /organizations.
export default function TrashPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Thùng rác</h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <TrashContent />
      </Suspense>
    </div>
  );
}
