import type { ReactElement } from "react";
import { OrgListCard } from "./components/OrgListCard.tsx";
import { OrgStatsCard } from "./components/OrgStatsCard.tsx";
import { OverviewTiles } from "./components/OverviewTiles.tsx";

export function DashboardOverviewPage(): ReactElement {
  return (
    <>
      <OverviewTiles />
      <OrgStatsCard />
      <OrgListCard />
    </>
  );
}
