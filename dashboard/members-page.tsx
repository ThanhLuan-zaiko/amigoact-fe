import type { ReactElement } from "react";
import { InvitationInboxCard } from "./components/InvitationInboxCard.tsx";
import { MemberListCard } from "./components/MemberListCard.tsx";

export function DashboardMembersPage(): ReactElement {
  return (
    <>
      <InvitationInboxCard />
      <MemberListCard />
    </>
  );
}
