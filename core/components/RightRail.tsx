import { useState } from "react";
import type { ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useSession } from "../../auth/hooks.ts";
import {
  JoinCard,
  JourneyCard,
  SuggestedOrgsCard,
  UpcomingCard,
} from "./RailCards.tsx";
import { TextField } from "./TextField.tsx";

const YEAR = new Date().getFullYear();

const FOOTER_LINK =
  "rounded hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";

// Search pill: the home directory owns server-side org search (GET /orgs?q=).
function SearchBox(): ReactElement {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const query = term.trim();
        navigate(query ? `/?q=${encodeURIComponent(query)}` : "/");
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
export function RightRail(): ReactElement {
  const session = useSession();
  const signedIn = session.data != null;
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
