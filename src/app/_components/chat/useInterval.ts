"use client";

import { useEffect, useRef } from "react";

// Calls the latest callback every delay milliseconds while the tab is visible. A null delay stops it.
export function useInterval(callback: () => void, delay: number | null) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (delay === null) {
      return;
    }
    const timer = setInterval(() => {
      if (!document.hidden) {
        callbackRef.current();
      }
    }, delay);
    return () => clearInterval(timer);
  }, [delay]);
}
