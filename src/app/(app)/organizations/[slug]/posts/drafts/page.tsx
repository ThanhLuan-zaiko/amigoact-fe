import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiEdit3 } from "react-icons/fi";
import { requireUser } from "@/lib/auth";
import { getOrgDrafts } from "@/lib/postApi";
import { postPath } from "@/lib/posts";
import DraftList from "../../../../../_components/DraftList";
import EmptyState from "../../../../../_components/EmptyState";
import { mutedText, primaryButton } from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Bản nháp | AmigoACT" };

type Params = PageProps<"/organizations/[slug]/posts/drafts">["params"];

async function DraftsContent({ params }: { params: Params }) {
  const { slug } = await params;
  await requireUser(`/organizations/${slug}/posts/drafts`);
  const page = await getOrgDrafts(slug);
  const base = postPath(slug);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="text-xl font-extrabold tracking-tight">
            Bản nháp của tôi
          </h2>
          <p className={mutedText}>Chỉ bạn nhìn thấy các bài này.</p>
        </div>
        <Link href={`${base}/new`} className={primaryButton}>
          <FiEdit3 aria-hidden="true" />
          Viết bài
        </Link>
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được bản nháp. Vui lòng thử lại.</p>
      ) : page.posts.length === 0 ? (
        <EmptyState
          title="Chưa có bản nháp"
          description="Bài bạn lưu nháp trong tổ chức này sẽ hiện ở đây."
        />
      ) : (
        <DraftList posts={page.posts} back={`${base}/drafts`} />
      )}
    </div>
  );
}

export default function OrganizationDraftsPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <DraftsContent params={params} />
    </Suspense>
  );
}
