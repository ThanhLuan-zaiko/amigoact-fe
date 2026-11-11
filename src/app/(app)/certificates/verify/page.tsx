import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { normalizeSerial } from "@/lib/certificates";
import VerifyForm from "../../../_components/certificates/VerifyForm";
import { mutedText, panel } from "../../../_components/ui";

export const metadata: Metadata = { title: "Xác minh chứng nhận | AmigoACT" };

async function VerifyLookup({
  searchParams,
}: {
  searchParams: PageProps<"/certificates/verify">["searchParams"];
}) {
  const { serial } = await searchParams;
  const typed = typeof serial === "string" ? normalizeSerial(serial) : "";
  if (typed) {
    redirect(`/certificates/verify/${encodeURIComponent(typed)}`);
  }
  return <VerifyForm />;
}

// Public. Anyone with a serial, such as a school or an employer, checks it here.
export default function VerifyPage({
  searchParams,
}: PageProps<"/certificates/verify">) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Xác minh chứng nhận
      </h1>
      <section className={`${panel} flex flex-col gap-3 p-4 sm:p-6`}>
        <p className={mutedText}>
          Nhập số serial in trên chứng nhận để xem chứng nhận còn hiệu lực hay
          không.
        </p>
        <Suspense fallback={<VerifyForm />}>
          <VerifyLookup searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
