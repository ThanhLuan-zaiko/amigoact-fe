import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiEdit3 } from "react-icons/fi";
import { requireUser } from "@/lib/auth";
import { getMyDrafts } from "@/lib/postApi";
import DraftList from "../../_components/DraftList";
import EmptyState from "../../_components/EmptyState";
import { mutedText, primaryButton } from "../../_components/ui";

export const metadata: Metadata = { title: "Bản nháp | AmigoACT" };

async function DraftsContent() {
  await requireUser("/drafts");
  const drafts = await getMyDrafts();
  if (drafts.length === 0) {
    return (
      <EmptyState
        title="Chưa có bản nháp"
        description="Bài bạn lưu nháp sẽ hiện ở đây, chỉ mình bạn nhìn thấy."
      />
    );
  }
  return <DraftList posts={drafts} />;
}

export default function DraftsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Bản nháp</h1>
          <p className={mutedText}>Chỉ bạn nhìn thấy các bài này.</p>
        </div>
        <Link href="/compose" className={primaryButton}>
          <FiEdit3 aria-hidden="true" />
          Viết bài
        </Link>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <DraftsContent />
      </Suspense>
    </div>
  );
}
