import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/forms";
import AuthShell from "../_components/account/AuthShell";
import LoginForm from "../_components/account/LoginForm";

export const metadata: Metadata = { title: "Đăng nhập | AmigoACT" };

async function LoginContent({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const { next } = await searchParams;
  const nextPath = safeNextPath(next);
  if (await getCurrentUser()) {
    redirect(nextPath);
  }
  return <LoginForm next={nextPath} />;
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <AuthShell title="Đăng nhập" description="Chào mừng bạn quay lại AmigoACT.">
      <Suspense fallback={<LoginForm />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
