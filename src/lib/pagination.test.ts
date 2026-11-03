import { describe, expect, test } from "bun:test";
import {
  lastPage,
  PAGE_SIZE,
  pageHref,
  pageNumbers,
  pageOffset,
  parsePage,
} from "./pagination";

describe("parsePage", () => {
  test("accepts a positive whole number", () => {
    expect(parsePage("3")).toBe(3);
  });

  test("falls back to the first page for anything else", () => {
    for (const value of ["0", "-1", "1.5", "abc", undefined, ["2"]]) {
      expect(parsePage(value)).toBe(1);
    }
  });

  test("stays within the offsets the backend accepts", () => {
    expect(pageOffset("999999999")).toBeLessThanOrEqual(100_000);
  });
});

test("pageOffset starts at zero and moves by a page", () => {
  expect(pageOffset("1")).toBe(0);
  expect(pageOffset("3")).toBe(2 * PAGE_SIZE);
});

test("lastPage rounds up and is never below one", () => {
  expect(lastPage(0)).toBe(1);
  expect(lastPage(PAGE_SIZE)).toBe(1);
  expect(lastPage(PAGE_SIZE + 1)).toBe(2);
});

describe("pageHref", () => {
  test("keeps the plain URL for the first page", () => {
    expect(pageHref("/explore?q=a", 1)).toBe("/explore?q=a");
  });

  test("adds the page to existing search params", () => {
    expect(pageHref("/explore?q=a", 2)).toBe("/explore?q=a&page=2");
    expect(pageHref("/explore", 2)).toBe("/explore?page=2");
  });
});

describe("pageNumbers", () => {
  test("lists every page of a short list", () => {
    expect(pageNumbers(2, 3)).toEqual([1, 2, 3]);
  });

  test("marks skipped pages with one gap each", () => {
    expect(pageNumbers(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
    expect(pageNumbers(1, 10)).toEqual([1, 2, "gap", 10]);
  });
});
