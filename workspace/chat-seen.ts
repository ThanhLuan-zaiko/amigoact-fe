import type { ChatReadEntry } from "./api.ts";

// Members whose read pointer reached a message. The author's own
// pointer always covers their sends, so it never counts as a reader.
export function seenReaders(
  readers: ChatReadEntry[],
  authorId: string,
  messageId: string,
): ChatReadEntry[] {
  return readers.filter(
    (reader) =>
      reader.user_id !== authorId &&
      reader.last_read_message_id >= messageId,
  );
}
