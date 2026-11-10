import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getMyOrganizations } from "@/lib/organizationApi";
import ComposeForm from "../../_components/ComposeForm";
import { mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Tạo bài viết | AmigoACT" };

async function ComposeContent() {
  await requireUser("/compose");
  return <ComposeForm organizations={await getMyOrganizations()} />;
}

export default function ComposePage() {
  return (
    <div className="w-full max-w-2xl">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <ComposeContent />
      </Suspense>
    </div>
  );
}
