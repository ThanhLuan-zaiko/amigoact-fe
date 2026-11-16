import "server-only";
import { cookies } from "next/headers";
import { safeTimeZone, TIME_ZONE_COOKIE } from "./timeZone";

// The viewer's IANA zone, written into the `tz` cookie by TimeZoneSync in the
// browser. Before the browser has written it (the very first page), or when it
// holds something that is not a zone, the default zone is used. It reads a
// cookie, so call it behind a Suspense boundary, like the session.
export async function viewerTimeZone(): Promise<string> {
  const store = await cookies();
  return safeTimeZone(store.get(TIME_ZONE_COOKIE)?.value);
}

// The zone a form's datetime-local values were shown in: the hidden
// `time_zone` field the form carries, else the viewer's cookie zone.
export async function formTimeZone(formData: FormData): Promise<string> {
  const sent = formData.get("time_zone");
  return typeof sent === "string" && sent
    ? safeTimeZone(sent)
    : viewerTimeZone();
}
