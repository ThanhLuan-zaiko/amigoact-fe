import { describe, expect, test } from "bun:test";
import {
  addTag,
  suggestionRows,
  tagFieldValue,
  tagSlug,
  takeFinishedTags,
} from "./tagInput";

describe("tagSlug", () => {
  test("matches the backend slug for Vietnamese names", () => {
    expect(tagSlug("Môi trường")).toBe("moi-truong");
    expect(tagSlug("Đoàn trường")).toBe("doan-truong");
    expect(tagSlug("  Hiến máu!! ")).toBe("hien-mau");
    expect(tagSlug("!!!")).toBe("");
  });

  test("cuts a long slug without a trailing hyphen", () => {
    expect(tagSlug(`${"a".repeat(39)} bbbb`)).toBe("a".repeat(39));
  });
});

describe("addTag", () => {
  test("adds a trimmed name and skips one with the same slug", () => {
    const tags = addTag([], "  Môi   trường ");
    expect(tags).toEqual(["Môi trường"]);
    expect(addTag(tags, "moi truong")).toBe(tags);
  });

  test("skips names without letters and stops at five", () => {
    expect(addTag([], "---")).toEqual([]);
    const full = ["a", "b", "c", "d", "e"];
    expect(addTag(full, "f")).toEqual(full);
  });
});

describe("takeFinishedTags", () => {
  test("pasted text becomes chips and the last part stays typed", () => {
    expect(takeFinishedTags([], "a, b,c")).toEqual({
      tags: ["a", "b"],
      draft: "c",
    });
  });

  test("a full list clears the rest", () => {
    expect(takeFinishedTags(["a", "b", "c", "d"], "e, f")).toEqual({
      tags: ["a", "b", "c", "d", "e"],
      draft: "",
    });
  });
});

test("the form value keeps text that was not turned into a chip", () => {
  expect(tagFieldValue(["a", "b"], " c ")).toBe("a, b, c");
  expect(tagFieldValue(["a"], "  ")).toBe("a");
});

describe("suggestionRows", () => {
  const suggestions = [
    { name: "Môi trường", slug: "moi-truong", count: 4 },
    { name: "Hiến máu", slug: "hien-mau", count: 2 },
  ];

  test("hides chosen tags and offers to create new text first", () => {
    expect(suggestionRows(suggestions, ["moi truong"], "Trồng cây")).toEqual([
      { name: "Trồng cây", count: null },
      { name: "Hiến máu", count: 2 },
    ]);
  });

  test("does not offer to create a tag that already exists", () => {
    const rows = suggestionRows(suggestions, [], "hien mau");
    expect(rows.map((row) => row.count)).toEqual([4, 2]);
  });
});
