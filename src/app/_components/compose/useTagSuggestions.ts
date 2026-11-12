"use client";

import { useEffect, useRef, useState } from "react";
import { searchTags, type TagSource } from "@/app/_actions/postTags";
import { type TagSuggestion, tagSlug } from "@/lib/tagInput";

const DELAY_MS = 200;

// Asks the backend for tags while the box is open. Each slug prefix is fetched once,
// typing waits a moment before asking, and an answer that arrives late is dropped.
export function useTagSuggestions(
  orgSlug: string,
  source: TagSource,
  draft: string,
  open: boolean,
): TagSuggestion[] {
  const cache = useRef(new Map<string, TagSuggestion[]>());
  const [shown, setShown] = useState<TagSuggestion[]>([]);
  const key = draft.trim() ? tagSlug(draft) : "";
  const nothingToFind = draft.trim() !== "" && key === "";

  useEffect(() => {
    if (!open || nothingToFind) {
      return;
    }
    const cached = cache.current.get(key);
    if (cached) {
      setShown(cached);
      return;
    }
    let current = true;
    const timer = setTimeout(async () => {
      try {
        const items = await searchTags(orgSlug, source, key);
        cache.current.set(key, items);
        if (current) {
          setShown(items);
        }
      } catch {
        // A dropped connection only means no suggestions this time.
      }
    }, DELAY_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [orgSlug, source, key, open, nothingToFind]);

  return nothingToFind ? [] : shown;
}
