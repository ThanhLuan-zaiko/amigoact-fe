import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { prefersReducedMotion, pulseMessage } from "../core/motion.ts";

const NEAR_BOTTOM_PX = 80;
const JUMP_PAGE_CAP = 15;

interface ChatScrollOptions {
  canLoadMore: () => boolean;
  loadOlder: () => Promise<unknown>;
  unread: number;
  lastRead: string | null;
  onSeenLatest: (messageId: string) => void;
}

type Row = { message_id?: string };

function distanceFromBottom(node: HTMLElement): number {
  return node.scrollHeight - node.scrollTop - node.clientHeight;
}

function pinLatest(node: HTMLElement): void {
  node.scrollTop = node.scrollHeight;
}

function scrollChildToTop(node: HTMLElement, child: HTMLElement): void {
  const delta =
    child.getBoundingClientRect().top - node.getBoundingClientRect().top;
  node.scrollTop += delta;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function scrollChildToCenter(
  node: HTMLElement,
  child: HTMLElement,
  smooth: boolean,
): void {
  const nodeBox = node.getBoundingClientRect();
  const childBox = child.getBoundingClientRect();
  const delta =
    childBox.top +
    childBox.height / 2 -
    (nodeBox.top + nodeBox.height / 2);
  const top = node.scrollTop + delta;
  if (smooth) node.scrollTo({ top, behavior: "smooth" });
  else node.scrollTop = top;
}

function waitForPaneScroll(
  node: HTMLElement,
  reduced: boolean,
): Promise<void> {
  if (reduced) return Promise.resolve();
  return new Promise((resolve) => {
    let settled = false;
    let idle: number | undefined;
    let cap = 0;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("scrollend", finish);
      if (idle !== undefined) window.clearTimeout(idle);
      window.clearTimeout(cap);
      resolve();
    };
    const onScroll = (): void => {
      if (idle !== undefined) window.clearTimeout(idle);
      idle = window.setTimeout(finish, 80);
    };
    node.addEventListener("scroll", onScroll);
    node.addEventListener("scrollend", finish);
    cap = window.setTimeout(finish, 800);
  });
}

function unreadAnchor(
  node: HTMLElement,
  items: readonly Row[],
  lastRead: string | null,
): HTMLElement | null {
  const seam = node.querySelector<HTMLElement>("[data-unread-seam]");
  if (seam !== null) return seam;
  if (lastRead === null) return null;
  const id = items.find(
    (row) => row.message_id !== undefined && row.message_id > lastRead,
  )?.message_id;
  if (id === undefined) return null;
  return node.querySelector<HTMLElement>(
    `[data-message-id="${CSS.escape(id)}"]`,
  );
}

// True when this window still has read messages below the pointer, so
// the unread seam sits in the middle and the reader can scroll down.
function seamInWindow(
  items: readonly Row[],
  unread: number,
  lastRead: string | null,
): boolean {
  if (unread <= 0 || lastRead === null) return false;
  const index = items.findIndex(
    (row) => row.message_id !== undefined && row.message_id > lastRead,
  );
  return index > 0;
}

// Scroll ownership of the chat flow. Opening a room pins the latest
// message. If the unread seam sits inside the loaded window (read
// messages above it), land on that seam so the reader scrolls down.
// After that, stick to the tail only while the reader is already there.
export function useChatAutoScroll(
  items: readonly Row[],
  options: ChatScrollOptions,
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
  const optionsRef = useRef(options);
  const atBottomRef = useRef(true);
  const openedRef = useRef(false);
  const jumpingRef = useRef(false);
  const markedRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    itemsRef.current = items;
    optionsRef.current = options;
  });

  function syncBottom(node: HTMLElement): void {
    const near = distanceFromBottom(node) < NEAR_BOTTOM_PX;
    atBottomRef.current = near;
    setAtBottom(near);
    if (near) setPendingNew(0);
  }

  function openPane(node: HTMLElement): void {
    const opts = optionsRef.current;
    const rows = itemsRef.current;
    if (
      seamInWindow(rows, opts.unread, opts.lastRead)
    ) {
      const anchor = unreadAnchor(node, rows, opts.lastRead);
      if (anchor !== null) {
        scrollChildToTop(node, anchor);
        if (distanceFromBottom(node) >= NEAR_BOTTOM_PX) {
          syncBottom(node);
          return;
        }
      }
    }
    pinLatest(node);
    atBottomRef.current = true;
    setAtBottom(true);
    setPendingNew(0);
  }

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node === null || items.length === 0) return;

    const tryOpen = (): void => {
      const pane = scrollRef.current;
      if (pane === null || pane.clientHeight === 0) return;
      if (!openedRef.current) {
        openedRef.current = true;
        prevLenRef.current = itemsRef.current.length;
        prevLatestRef.current = itemsRef.current.at(-1)?.message_id;
        openPane(pane);
        return;
      }
      if (!jumpingRef.current && atBottomRef.current) pinLatest(pane);
    };

    tryOpen();
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(tryOpen);
    });
    const observer = new ResizeObserver(tryOpen);
    observer.observe(node);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [items]);

  useEffect(() => {
    if (!openedRef.current) return;
    const node = scrollRef.current;
    if (node === null) return;
    const latestId = items.at(-1)?.message_id;
    const delta = items.length - prevLenRef.current;
    const newTail =
      latestId !== undefined && latestId !== prevLatestRef.current;
    prevLenRef.current = items.length;
    prevLatestRef.current = latestId;
    if (newTail && atBottomRef.current) {
      pinLatest(node);
      setPendingNew(0);
      return;
    }
    if (newTail && delta > 0) setPendingNew((count) => count + delta);
  }, [items]);

  useEffect(() => {
    if (!openedRef.current || !atBottom) return;
    const latestId = items.at(-1)?.message_id;
    if (latestId === undefined || latestId === options.lastRead) return;
    if (markedRef.current === latestId) return;
    markedRef.current = latestId;
    optionsRef.current.onSeenLatest(latestId);
  }, [atBottom, items, options.lastRead]);

  function onScroll(): void {
    const node = scrollRef.current;
    if (node === null || !openedRef.current) return;
    syncBottom(node);
  }

  function scrollToLatest(): void {
    const node = scrollRef.current;
    if (node !== null) pinLatest(node);
    prevLenRef.current = itemsRef.current.length;
    prevLatestRef.current = itemsRef.current.at(-1)?.message_id;
    openedRef.current = true;
    atBottomRef.current = true;
    setPendingNew(0);
    setAtBottom(true);
  }

  async function jumpTo(messageId: string): Promise<void> {
    const loaded = () =>
      itemsRef.current.some((row) => row.message_id === messageId);
    const opts = optionsRef.current;
    for (
      let guard = 0;
      !loaded() && opts.canLoadMore() && guard < JUMP_PAGE_CAP;
      guard += 1
    ) {
      await opts.loadOlder();
      await nextFrame();
      await nextFrame();
    }
    const pane = scrollRef.current;
    if (pane === null) return;
    const el = pane.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(messageId)}"]`,
    );
    if (el === null) return;
    jumpingRef.current = true;
    atBottomRef.current = false;
    setAtBottom(false);
    try {
      const reduced = prefersReducedMotion();
      const paneBox = pane.getBoundingClientRect();
      const elBox = el.getBoundingClientRect();
      const offset =
        elBox.top +
        elBox.height / 2 -
        (paneBox.top + paneBox.height / 2);
      if (Math.abs(offset) >= 8) {
        scrollChildToCenter(pane, el, !reduced);
        await waitForPaneScroll(pane, reduced);
      }
      pulseMessage(el);
    } finally {
      jumpingRef.current = false;
      syncBottom(pane);
    }
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
