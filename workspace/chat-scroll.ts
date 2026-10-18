import { useEffect, useRef, useState } from "react";
import {
  flashMessage,
  prefersReducedMotion,
} from "../core/motion.ts";

const NEAR_BOTTOM_PX = 80;
// Pin/reply jumps scan back at most this many extra pages before giving
// up, so a missing message never triggers an unbounded history load.
const JUMP_PAGE_CAP = 15;

interface JumpDeps {
  canLoadMore: () => boolean;
  loadOlder: () => Promise<unknown>;
}

// Scroll ownership of the chat flow: pin the tail while the user is near
// the bottom, count incoming tail messages otherwise (the jump-latest
// badge), and expose scrollToLatest for the composer send. When JumpDeps
// are provided, jumpTo also auto-loads older pages until the target
// message renders, then scrolls + flashes it.
export function useChatAutoScroll(
  items: readonly { message_id?: string }[],
  jump?: JumpDeps,
): {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  atBottom: boolean;
  pendingNew: number;
  onScroll: () => void;
  scrollToLatest: () => void;
  jumpTo: (messageId: string) => Promise<void>;
} {
  const [atBottom, setAtBottom] = useState(true);
  const [pendingNew, setPendingNew] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevLenRef = useRef(0);
  const prevLatestRef = useRef<string | undefined>(undefined);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node === null) return;
    const latestId = items.at(-1)?.message_id;
    const delta = items.length - prevLenRef.current;
    const newTail =
      latestId !== undefined && latestId !== prevLatestRef.current;
    prevLenRef.current = items.length;
    prevLatestRef.current = latestId;
    const nearBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight < 160;
    if (nearBottom) {
      node.scrollTop = node.scrollHeight;
    } else if (newTail && delta > 0) {
      setPendingNew((count) => count + delta);
    }
  }, [items]);

  function onScroll(): void {
    const node = scrollRef.current;
    if (node === null) return;
    const near =
      node.scrollHeight - node.scrollTop - node.clientHeight <
      NEAR_BOTTOM_PX;
    setAtBottom(near);
    if (near) setPendingNew(0);
  }

  function scrollToLatest(): void {
    const node = scrollRef.current;
    if (node !== null) node.scrollTop = node.scrollHeight;
    setPendingNew(0);
    setAtBottom(true);
  }

  async function jumpTo(messageId: string): Promise<void> {
    const loaded = () =>
      itemsRef.current.some((m) => m.message_id === messageId);
    if (jump !== undefined) {
      for (
        let guard = 0;
        !loaded() && jump.canLoadMore() && guard < JUMP_PAGE_CAP;
        guard += 1
      ) {
        await jump.loadOlder();
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve()),
          ),
        );
      }
    }
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-message-id="${messageId}"]`,
    );
    if (!el) return;
    el.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "center",
    });
    flashMessage(el);
  }

  return {
    scrollRef,
    atBottom,
    pendingNew,
    onScroll,
    scrollToLatest,
    jumpTo,
  };
}
