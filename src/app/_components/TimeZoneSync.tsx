"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isTimeZone, TIME_ZONE_COOKIE } from "@/lib/timeZone";

const ONE_YEAR = 60 * 60 * 24 * 365;
const REFRESHED_KEY = "tz-refreshed";

// Tells the server the browser's time zone through the `tz` cookie, so pages
// rendered on the server show times on the viewer's clock. When the page was
// rendered in another zone (the first visit, or after travelling), it is
// rendered again once. The cookie is not secret: it only names a zone.
export default function TimeZoneSync({ serverZone }: { serverZone: string }) {
  const router = useRouter();

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!isTimeZone(zone)) {
      return;
    }
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    // biome-ignore lint/suspicious/noDocumentCookie: a plain, non-secret preference cookie read by the server.
    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
    if (zone === serverZone) {
      return;
    }
    // Refresh at most once per zone, so a browser that refuses cookies does not loop.
    try {
      if (sessionStorage.getItem(REFRESHED_KEY) === zone) {
        return;
      }
      sessionStorage.setItem(REFRESHED_KEY, zone);
    } catch {
      return;
    }
    router.refresh();
  }, [router, serverZone]);

  return null;
}
