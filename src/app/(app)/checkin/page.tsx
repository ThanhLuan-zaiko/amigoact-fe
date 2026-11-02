import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import {
  CodeCheckIn,
  QrCheckIn,
} from "../../_components/attendance/CheckInForms";
import { mutedText } from "../../_components/ui";

export const metadata: Metadata = { title: "Điểm danh | AmigoACT" };

async function CheckInContent({
  searchParams,
}: {
  searchParams: PageProps<"/checkin">["searchParams"];
}) {
  const { token } = await searchParams;
  const qrToken = typeof token === "string" ? token : "";
  // Coming back from the login page keeps the scanned token.
  await requireUser(
    qrToken ? `/checkin?token=${encodeURIComponent(qrToken)}` : "/checkin",
  );
  return qrToken ? <QrCheckIn token={qrToken} /> : <CodeCheckIn />;
}

export default function CheckInPage({ searchParams }: PageProps<"/checkin">) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Điểm danh</h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <CheckInContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
