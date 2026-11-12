// A small, safe markup for post bodies, stored as plain text in the backend.
//   "## " heading, "> " quote, "- " list item, a line of "---" divider.
// "[media:<id>]" alone on a line places an attached picture or video (postMedia.ts).
// The toolbar inserts it and PostBody renders it. Nothing here produces HTML.

import { matchMediaToken } from "./postMedia";

export type FormatAction = "heading" | "quote" | "list" | "rule";

export type EditResult = { text: string; start: number; end: number };

const PREFIXES: Record<Exclude<FormatAction, "rule">, string> = {
  heading: "## ",
  quote: "> ",
  list: "- ",
};

// Adds the prefix to every selected line, or removes it when all of them have it.
// A divider is inserted on its own line after the selection.
export function applyFormat(
  text: string,
  start: number,
  end: number,
  action: FormatAction,
): EditResult {
  if (action === "rule") {
    const before = text.slice(0, end);
    const lead = before === "" || before.endsWith("\n") ? "" : "\n";
    const insert = `${lead}---\n`;
    return {
      text: before + insert + text.slice(end),
      start: end + insert.length,
      end: end + insert.length,
    };
  }
  const prefix = PREFIXES[action];
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const newline = text.indexOf("\n", end);
  const lineEnd = newline === -1 ? text.length : newline;
  const lines = text.slice(lineStart, lineEnd).split("\n");
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const changed = lines
    .map((line) =>
      allPrefixed ? line.slice(prefix.length) : `${prefix}${line}`,
    )
    .join("\n");
  return {
    text: text.slice(0, lineStart) + changed + text.slice(lineEnd),
    start: lineStart,
    end: lineStart + changed.length,
  };
}

export type BodyBlock =
  | { type: "heading"; text: string }
  | { type: "quote"; lines: string[] }
  | { type: "list"; items: string[] }
  | { type: "rule" }
  | { type: "media"; id: string }
  | { type: "paragraph"; text: string };

export function parseBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const paragraph: string[] = [];

  function flush() {
    if (paragraph.length > 0) {
      blocks.push({ type: "paragraph", text: paragraph.join("\n") });
      paragraph.length = 0;
    }
  }

  for (const raw of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const last = blocks.at(-1);
    const mediaId = matchMediaToken(line);
    if (line.trim() === "") {
      flush();
    } else if (mediaId) {
      flush();
      blocks.push({ type: "media", id: mediaId });
    } else if (line === "---") {
      flush();
      blocks.push({ type: "rule" });
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "heading", text: line.slice(3) });
    } else if (line.startsWith("> ")) {
      flush();
      if (last?.type === "quote") {
        last.lines.push(line.slice(2));
      } else {
        blocks.push({ type: "quote", lines: [line.slice(2)] });
      }
    } else if (line.startsWith("- ")) {
      flush();
      if (last?.type === "list") {
        last.items.push(line.slice(2));
      } else {
        blocks.push({ type: "list", items: [line.slice(2)] });
      }
    } else {
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}

// Plain text of a body for a short preview: markup and placed files dropped.
export function bodyExcerpt(body: string): string {
  return parseBody(body)
    .flatMap((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
          return [block.text];
        case "quote":
          return [block.lines.join(" ")];
        case "list":
          return [block.items.join(" · ")];
        default:
          return [];
      }
    })
    .join("\n");
}
