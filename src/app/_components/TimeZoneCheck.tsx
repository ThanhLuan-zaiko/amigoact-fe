import { viewerTimeZone } from "@/lib/viewerTimeZone";
import TimeZoneSync from "./TimeZoneSync";

// Reads the zone the server renders in, so the browser can correct it. Sits
// behind its own Suspense boundary in the (app) layout, because it reads a cookie.
export default async function TimeZoneCheck() {
  return <TimeZoneSync serverZone={await viewerTimeZone()} />;
}
