import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getMyOrganizations } from "@/lib/organizationApi";
import { postableOrganizations } from "@/lib/posts";
import { mutedText } from "../../_components/ui";

// Posts are written inside an organization now, at /org/{slug}/posts/new.
// Old links land here: with one organization to post in, go straight to its form,
// otherwise go to the organization list to pick one.
async function ComposeRedirect(): Promise<null> {
  await requireUser("/compose");
  const choices = postableOrganizations(
    await getMyOrganizations(),
    "discussion",
  );
  if (choices.length === 1) {
    redirect(`/org/${choices[0].slug}/posts/new`);
  }
  redirect("/organizations");
}

export default function ComposePage() {
  return (
    <Suspense fallback={<p className={mutedText}>Đang chuyển hướng…</p>}>
      <ComposeRedirect />
    </Suspense>
  );
}
