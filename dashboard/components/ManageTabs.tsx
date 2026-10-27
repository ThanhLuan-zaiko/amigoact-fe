import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { prefersReducedMotion } from "../../core/motion.ts";
import { activeEntry } from "../../core/nav-meta.ts";
import { MANAGE_LINKS } from "../../core/nav.tsx";
import { useMyOrgs } from "../hooks.ts";
import { useMyMemberships } from "../members-hooks.ts";

const EDGE_BUTTON =
  "flex w-11 flex-none items-center justify-center self-stretch text-zinc-500 " +
  "transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 " +
  "dark:hover:bg-zinc-900 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-400";

// Workspace section tabs pinned under CenterHeader on every /manage page
// (except chat, which stays a primary rail destination). The strip scrolls
// horizontally instead of expanding the rail in place; every tab is a real
// route so navigation stays deep-linkable, the active tab scrolls into view
// on route change, and edge arrows appear only while the strip can scroll
// that way.
export function ManageTabs(): ReactElement {
  const { pathname } = useLocation();
  const active = activeEntry(pathname, MANAGE_LINKS);
  const invites = useMyMemberships("invited").data?.total ?? 0;
  // The audit log only lists orgs the viewer owns, so the tab is pointless
  // (and a dead end) for plain members.
  const ownsOrg = (useMyOrgs(false, { limit: 1 }).data?.total ?? 0) > 0;
  const links = MANAGE_LINKS.filter(
    (entry) => ownsOrg || entry.to !== "/manage/audit",
  );
  const activeRef = useRef<HTMLAnchorElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return undefined;
    const update = (): void =>
      setEdges({
        start: strip.scrollLeft > 1,
        end: strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1,
      });
    update();
    strip.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(strip);
    return () => {
      strip.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [pathname]);

  function nudge(direction: -1 | 1): void {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({
      left: direction * strip.clientWidth * 0.75,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  return (
    <nav
      aria-label="Không gian quản lý"
      className="sticky top-[53px] z-20 flex border-b border-zinc-200 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85"
    >
      {edges.start && (
        <button
          type="button"
          aria-label="Cuộn sang trái"
          onClick={() => nudge(-1)}
          className={`${EDGE_BUTTON} border-r border-zinc-200 dark:border-zinc-800`}
        >
          <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      <div
        ref={stripRef}
        className="flex flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {links.map((entry) => {
          const selected = entry === active;
          const count = entry.badge === "invites" ? invites : 0;
          return (
            <Link
              key={entry.to}
              to={entry.to}
              ref={selected ? activeRef : undefined}
              aria-current={selected ? "page" : undefined}
              className="flex h-[53px] flex-none items-center gap-2 px-4 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
            >
              <entry.Icon
                className={
                  selected
                    ? "h-4 w-4 text-zinc-900 dark:text-zinc-100"
                    : "h-4 w-4 text-zinc-500 dark:text-zinc-400"
                }
                aria-hidden="true"
              />
              <span className="relative flex h-full items-center whitespace-nowrap">
                <span
                  className={
                    selected
                      ? "text-sm font-bold text-zinc-900 dark:text-zinc-100"
                      : "text-sm font-medium text-zinc-500 dark:text-zinc-400"
                  }
                >
                  {entry.label}
                </span>
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-zinc-900 dark:bg-zinc-100"
                  />
                )}
              </span>
              {count > 0 && (
                <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      {edges.end && (
        <button
          type="button"
          aria-label="Cuộn sang phải"
          onClick={() => nudge(1)}
          className={`${EDGE_BUTTON} border-l border-zinc-200 dark:border-zinc-800`}
        >
          <FiChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </nav>
  );
}
