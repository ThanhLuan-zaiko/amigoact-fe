import { describe, expect, test } from "bun:test";
import { applyFormat, parseBody } from "./postFormat";

describe("applyFormat", () => {
  test("prefixes the line under the cursor", () => {
    const result = applyFormat("one\ntwo", 5, 5, "heading");
    expect(result.text).toBe("one\n## two");
  });

  test("prefixes every selected line and removes the prefix on a second press", () => {
    const first = applyFormat("a\nb", 0, 3, "list");
    expect(first.text).toBe("- a\n- b");
    const second = applyFormat(first.text, first.start, first.end, "list");
    expect(second.text).toBe("a\nb");
  });

  test("inserts a divider on its own line", () => {
    const result = applyFormat("hello", 5, 5, "rule");
    expect(result.text).toBe("hello\n---\n");
    expect(result.start).toBe(result.text.length);
  });
});

describe("parseBody", () => {
  test("reads every block kind", () => {
    const blocks = parseBody(
      "## Title\nplain\nmore\n\n> q1\n> q2\n\n- a\n- b\n---\nend",
    );
    expect(blocks).toEqual([
      { type: "heading", text: "Title" },
      { type: "paragraph", text: "plain\nmore" },
      { type: "quote", lines: ["q1", "q2"] },
      { type: "list", items: ["a", "b"] },
      { type: "rule" },
      { type: "paragraph", text: "end" },
    ]);
  });

  test("keeps markup characters as text", () => {
    expect(parseBody("<script>x</script>")).toEqual([
      { type: "paragraph", text: "<script>x</script>" },
    ]);
  });
});
