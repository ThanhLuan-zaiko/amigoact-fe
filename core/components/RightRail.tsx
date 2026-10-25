import { useState } from "react";
import type { ReactElement } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import {
  JoinCard,
  JourneyCard,
  SuggestedOrgsCard,
  UpcomingCard,
} from "./RailCards.tsx";
import { TextField } from "./TextField.tsx";
import { ManageRail } from "../../dashboard/components/ManageRail.tsx";
import { MANAGE_ROOT } from "../nav.tsx";
import { ChatInboxRail } from "../../workspace/components/ChatInboxRail.tsx";
import { EventsBrowseRail } from "../../activities/components/EventsBrowseRail.tsx";

const YEAR = new Date().getFullYear();

const FOOTER_LINK =
  "rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";

// Search pill: the home column's "To chuc" tab owns server-side org search
// (GET /orgs?q=), so a submit opens that tab with the query attached. The
// box mirrors the active ?q= like X keeps the searched term visible -
// clearing the tab's "Ket qua" strip empties it too.
function SearchBox(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const active = searchParams.get("q") ?? "";
  const [term, setTerm] = useState(active);
  const [prevActive, setPrevActive] = useState(active);
  if (prevActive !== active) {
    setPrevActive(active);
    setTerm(active);
  }
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = term.trim();
        navigate(
          query
            ? `/?tab=orgs&q=${encodeURIComponent(query)}`
            : "/?tab=orgs",
        );
      }}
    >
      <TextField
        label="Tìm tổ chức"
        hideLabel
        pill
        name="q"
        type="text"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Tìm tổ chức"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        icon={<FiSearch className="h-4 w-4" />}
      />
    </form>
  );
}

// X right rail: sticky search, personal widget, discovery widgets, footer.
// One route swaps it wholesale: /manage/chat renders the merged
// Telegram-style inbox (the conversation lives in the center column).
export function RightRail(): ReactElement {
  const session = useSession();
  const signedIn = session.data != null;
  const { pathname } = useLocation();
  if (pathname === "/manage/chat" && signedIn) {
    return <ChatInboxRail />;
  }
  // /events keeps its filters here so the feed column stays list-only.
  if (pathname === "/events") {
    return <EventsBrowseRail />;
  }
  if (pathname.startsWith(MANAGE_ROOT) && signedIn) {
    return (
      <div className="flex flex-col gap-4 pb-8">
        <ManageRail placement="rail" />
        <footer className="px-4 text-[13px] text-zinc-500 dark:text-zinc-400">
          <p>{`© ${YEAR} AmigoACT`}</p>
        </footer>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="sticky top-0 z-10 bg-white py-2 dark:bg-zinc-950">
        <SearchBox />
      </div>
      {signedIn ? <JourneyCard /> : !session.isPending && <JoinCard />}
      <UpcomingCard />
      <SuggestedOrgsCard />
      <footer className="px-4 text-[13px] text-zinc-500 dark:text-zinc-400">
        <nav aria-label="Liên kết phụ" className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/certificates/verify" className={FOOTER_LINK}>
            Xác thực chứng nhận
          </Link>
          <Link to="/leaderboard" className={FOOTER_LINK}>
            Bảng xếp hạng
          </Link>
          <Link to="/events" className={FOOTER_LINK}>
            Sự kiện
          </Link>
        </nav>
        <p className="mt-1">{`© ${YEAR} AmigoACT`}</p>
      </footer>
    </div>
  );
}
