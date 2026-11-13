import { describe, expect, test } from "bun:test";
import { hasEarlierPage } from "./back";

describe("hasEarlierPage", () => {
  test("a tab with only the current page has nothing to go back to", () => {
    expect(hasEarlierPage(1)).toBe(false);
    expect(hasEarlierPage(0)).toBe(false);
  });

  test("any earlier entry in the tab counts as a previous page", () => {
    expect(hasEarlierPage(2)).toBe(true);
    expect(hasEarlierPage(15)).toBe(true);
  });
});
