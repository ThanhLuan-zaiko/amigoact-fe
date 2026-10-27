import { boardAbilities, type BoardAbilities } from "./board-abilities.tsx";
import { useOrgPosts } from "./board-hooks.ts";

export interface OrgBoardAccess {
  // False until the first board response lands, so callers can wait
  // instead of flashing a "no access" state.
  ready: boolean;
  abilities: BoardAbilities;
}

// What the viewer may do on one org's board. The board envelope already
// carries viewer_permissions (the owner gets the whole catalog), and the
// query key matches the board feed, so react-query shares the request.
export function useOrgBoardAccess(orgId: string | null): OrgBoardAccess {
  const feed = useOrgPosts(orgId);
  return {
    ready: orgId === null || feed.data !== undefined,
    abilities: boardAbilities(feed.data?.viewer_permissions ?? []),
  };
}
