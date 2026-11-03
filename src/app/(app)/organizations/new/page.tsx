import type { Metadata } from "next";
import { Suspense } from "react";
import { createOrganization } from "@/app/_actions/organizations";
import { requireUser } from "@/lib/auth";
import OrganizationForm from "../../../_components/organizations/OrganizationForm";
import { mutedText } from "../../../_components/ui";

export const metadata: Metadata = { title: "Tạo tổ chức | AmigoACT" };

async function NewOrganizationContent() {
  const user = await requireUser("/organizations/new");
  return (
    <OrganizationForm
      action={createOrganization}
      contactDefaults={{ email: user.email, phone: user.phone }}
    />
  );
}

export default function NewOrganizationPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Tạo tổ chức</h1>
        <p className={mutedText}>
          Bạn sẽ là chủ sở hữu của tổ chức này và có thể thêm người quản trị
          sau.
        </p>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <NewOrganizationContent />
      </Suspense>
    </div>
  );
}
