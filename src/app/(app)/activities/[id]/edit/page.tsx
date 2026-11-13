import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { updateActivity } from "@/app/_actions/activities";
import { getActivity } from "@/lib/activityApi";
import { requireUser } from "@/lib/auth";
import ActivityForm from "../../../../_components/activities/ActivityForm";
import ShiftEditor from "../../../../_components/activities/ShiftEditor";
import BackLink from "../../../../_components/BackLink";
import { mutedText } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Sửa hoạt động | AmigoACT" };

async function EditContent({
  params,
}: {
  params: PageProps<"/activities/[id]/edit">["params"];
}) {
  const { id } = await params;
  await requireUser(`/activities/${id}/edit`);
  const activity = await getActivity(id);
  if (!activity) {
    notFound();
  }
  if (!activity.viewer.can_manage) {
    return <p className={mutedText}>Chỉ ban quản trị mới sửa được.</p>;
  }
  return (
    <>
      <div className="flex items-center gap-3">
        <BackLink href={`/activities/${id}`} />
        <h1 className="min-w-0 truncate text-2xl font-extrabold tracking-tight">
          {activity.title}
        </h1>
      </div>
      {/* The form splits itself into two columns on xl. The shifts sit below it. */}
      <div className="flex w-full flex-col gap-4">
        <ActivityForm
          action={updateActivity.bind(null, id)}
          orgSlug={activity.organization_slug}
          activity={activity}
        />
        <ShiftEditor activityId={id} shifts={activity.shifts} />
      </div>
    </>
  );
}

export default function EditActivityPage({
  params,
}: PageProps<"/activities/[id]/edit">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <EditContent params={params} />
      </Suspense>
    </div>
  );
}
