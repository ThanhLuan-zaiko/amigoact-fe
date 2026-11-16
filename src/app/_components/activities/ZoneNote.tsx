"use client";

import { FiGlobe } from "react-icons/fi";
import { describeZone } from "@/lib/timeZone";
import { useTimeZone } from "../TimeZoneContext";
import { mutedText } from "../ui";

// A datetime-local input has no zone. This names the zone its value is read
// in, and sends that zone with the form, so the Server Action reads the typed
// times on the same clock the form showed them. The page provides the zone.
export default function ZoneNote() {
  const timeZone = useTimeZone();
  return (
    <p className={`${mutedText} flex items-center gap-2`}>
      <FiGlobe aria-hidden="true" className="shrink-0" />
      <span>Giờ theo múi giờ {describeZone(timeZone)}</span>
      {timeZone ? (
        <input type="hidden" name="time_zone" value={timeZone} />
      ) : null}
    </p>
  );
}
