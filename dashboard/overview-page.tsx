import type { ReactElement } from "react";
import { OrgListCard } from "./components/OrgListCard.tsx";
import { OrgStatsCard } from "./components/OrgStatsCard.tsx";
import { OverviewTiles } from "./components/OverviewTiles.tsx";
import { MonthlyStatsCard } from "../stats/components/MonthlyStatsCard.tsx";
import { ReportsCard } from "../reports/components/ReportsCard.tsx";

export function DashboardOverviewPage(): ReactElement {
  return (
    <>
      <OverviewTiles />
      <OrgStatsCard />
      <MonthlyStatsCard />
      <ReportsCard />
      <OrgListCard />
    </>
  );
}
