import { apiFetch } from "../core/api.ts";
import { qs } from "./board-api.ts";

// Shared-media index contracts (room info panel tabs). Split from
// api.ts for the 350-line rule; api.ts re-exports this module.

export type SharedMediaKind = "image" | "video" | "file" | "link";

// One indexed attachment or extracted link, joined with its author.
export interface SharedMediaItem {
  message_id: string;
  kind: SharedMediaKind;
  media_id: string | null;
  url: string;
  mime: string;
  name: string;
  size_bytes: number;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  created_at: string | null;
}

export interface SharedMediaPage {
  items: SharedMediaItem[];
  next_cursor: string | null;
}

// One sender offered by the author filter (kinds they ever shared).
export interface SharedMediaAuthor {
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  kinds: SharedMediaKind[];
  last_at: string | null;
}

export interface SharedMediaAuthorsPage {
  items: SharedMediaAuthor[];
}

export function listSharedMedia(
  roomId: string,
  kind: SharedMediaKind,
  params: { limit?: number; cursor?: string; authorId?: string } = {},
): Promise<SharedMediaPage> {
  return apiFetch<SharedMediaPage>(
    `/chat/rooms/${roomId}/media${qs({
      kind,
      limit: params.limit !== undefined ? String(params.limit) : undefined,
      cursor: params.cursor,
      author_id: params.authorId,
    })}`,
  );
}

export function listSharedMediaAuthors(
  roomId: string,
): Promise<SharedMediaAuthorsPage> {
  return apiFetch<SharedMediaAuthorsPage>(
    `/chat/rooms/${roomId}/media/authors`,
  );
}
