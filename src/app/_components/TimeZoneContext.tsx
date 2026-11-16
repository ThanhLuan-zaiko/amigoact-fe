"use client";

import { createContext, type ReactNode, useContext } from "react";

// The viewer's zone for client components that the server also renders, such
// as the messenger and the notification list. The page reads the zone with
// viewerTimeZone() and provides it here, so the server and the browser write
// the same times. Without a provider the browser's own zone is used, which is
// right only for components that render in the browser alone.
const TimeZoneContext = createContext<string | undefined>(undefined);

export function TimeZoneProvider({
  timeZone,
  children,
}: {
  timeZone: string;
  children: ReactNode;
}) {
  return (
    <TimeZoneContext.Provider value={timeZone}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export function useTimeZone(): string | undefined {
  return useContext(TimeZoneContext);
}
