import { describe, expect, test } from "bun:test";
import { bodyExcerpt, parseBody } from "./postFormat";
import {
  insertMediaToken,
  matchMediaToken,
  placedMediaIds,
  removeMediaToken,
} from "./postMedia";

const ID = "0190f3a2-7b1c-7def-8a12-3456789abcde";

describe("media tokens", () => {
  test("a token alone on a line is matched", () => {
    expect(matchMediaToken(`[media:${ID}]`)).toBe(ID);
    expect(matchMediaToken(`  [media:${ID.toUpperCase()}]  `)).toBe(ID);
  });

  test("a token inside a sentence or with a bad id is plain text", () => {
    expect(matchMediaToken(`see [media:${ID}]`)).toBeNull();
    expect(matchMediaToken("[media:../../etc]")).toBeNull();
  });

  test("insert puts the token on its own line", () => {
    const result = insertMediaToken("ab", 1, ID);
    expect(result.text).toBe(`a\n[media:${ID}]\nb`);
    expect(result.text.slice(result.cursor)).toBe("b");
    expect(insertMediaToken("", 0, ID).text).toBe(`[media:${ID}]\n`);
    expect(insertMediaToken("a\n", 2, ID).text).toBe(`a\n[media:${ID}]\n`);
  });

  test("remove drops every line placing the file", () => {
    const body = `x\n[media:${ID}]\ny\n[media:${ID}]`;
    expect(removeMediaToken(body, ID)).toBe("x\ny");
  });

  test("placed ids and parsed blocks", () => {
    const body = `## Title\n[media:${ID}]\ntext`;
    expect(placedMediaIds(body).has(ID)).toBe(true);
    expect(parseBody(body)).toEqual([
      { type: "heading", text: "Title" },
      { type: "media", id: ID },
      { type: "paragraph", text: "text" },
    ]);
  });
});

describe("bodyExcerpt", () => {
  test("drops markup and placed files", () => {
    expect(
      bodyExcerpt(`## Title\ntext\n[media:${ID}]\n- a\n- b\n> q\n---`),
    ).toBe("Title\ntext\na · b\nq");
  });
});
