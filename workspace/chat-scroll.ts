import { useEffect, useRef, useState } from "react";

const NEAR_BOTTOM_PX = 80;

// Scroll ownership of the chat flow: pin the tail while the user is near
// the bottom, count incoming tail messages otherwise (the jump-latest
// badge), and expose scrollToLatest for the composer send.
export function useChatAutoScroll(items: readonly unknown[]): {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  atBottom: boolean;
  pendingNew: number;
  onScroll: () => void;
  scrollToLatest: () => void;
} {
  const [atBottom, setAtBottom] = useState(true);
  const [pendingNew, setPendingNew] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const prevLenRef = useRef(0);
  const prevLatestRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const node = scrollRef.current;
    if (node === null) return;
    const latestId = (items.at(-1) as { message_id?: string } | undefined)
      ?.message_id;
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

  return { scrollRef, atBottom, pendingNew, onScroll, scrollToLatest };
}
