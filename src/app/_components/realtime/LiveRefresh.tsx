"use client";

import { useLiveRefresh } from "./hooks";

type LiveRefreshProps = {
  topic: string;
  // Event types that change what this page shows.
  types: readonly string[];
  // Only events about this organization count.
  orgId?: string;
};

// Drop into a server-rendered page to reload it when its data changes elsewhere.
export default function LiveRefresh({ topic, types, orgId }: LiveRefreshProps) {
  useLiveRefresh(topic, types, orgId);
  return null;
}
