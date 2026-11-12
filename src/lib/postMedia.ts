// Pictures and videos placed inside a post body.
// A line "[media:<asset id>]" puts that attached file at that spot.
// Attached files that the body does not place are shown after the body.

const TOKEN = /^\[media:([0-9a-f-]{36})\]$/i;

export function mediaToken(id: string): string {
  return `[media:${id}]`;
}

// Returns the asset id when the whole line is a media token.
export function matchMediaToken(line: string): string | null {
  const found = TOKEN.exec(line.trim());
  return found ? found[1].toLowerCase() : null;
}

export function placedMediaIds(body: string): Set<string> {
  const ids = new Set<string>();
  for (const line of body.split(/\r\n?|\n/)) {
    const id = matchMediaToken(line);
    if (id) {
      ids.add(id);
    }
  }
  return ids;
}

// Puts the token on its own line at the cursor and returns the new cursor.
export function insertMediaToken(
  text: string,
  at: number,
  id: string,
): { text: string; cursor: number } {
  const before = text.slice(0, at);
  const after = text.slice(at);
  const lead = before === "" || before.endsWith("\n") ? "" : "\n";
  const trail = after.startsWith("\n") ? "" : "\n";
  const insert = `${lead}${mediaToken(id)}${trail}`;
  return {
    text: before + insert + after,
    cursor: before.length + insert.length,
  };
}

// Drops every line that places this file, used when the file is removed.
export function removeMediaToken(text: string, id: string): string {
  const target = id.toLowerCase();
  return text
    .split("\n")
    .filter((line) => matchMediaToken(line) !== target)
    .join("\n");
}

// Body editor and media picker talk through these window events.
export const MEDIA_INSERT_EVENT = "post-media-insert";
export const MEDIA_REMOVE_EVENT = "post-media-remove";
