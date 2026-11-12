"use client";

import { type ReactNode, useEffect, useState } from "react";
import { getRealtimeTicket } from "@/app/_actions/realtime";
import { RealtimeClient } from "./client";
import { RealtimeContext } from "./hooks";

// Holds the app's one socket. It sits in the (app) layout and connects only once a component
// listens to a topic, so guests never fetch a ticket. See docs/realtime.md.
export default function RealtimeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(() => new RealtimeClient(getRealtimeTicket));
  useEffect(() => () => client.stop(), [client]);
  return (
    <RealtimeContext.Provider value={client}>
      {children}
    </RealtimeContext.Provider>
  );
}
