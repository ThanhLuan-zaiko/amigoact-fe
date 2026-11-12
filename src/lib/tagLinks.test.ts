import { describe, expect, test } from "bun:test";
import {
  feedTagHref,
  listQuery,
  orgTagHref,
  readTag,
  tagLabel,
} from "./tagLinks";

describe("readTag", () => {
  test("turns the address value into a slug", () => {
    expect(readTag("moi-truong")).toBe("moi-truong");
    expect(readTag("Môi trường")).toBe("moi-truong");
  });

  test("ignores missing, repeated or empty-looking values", () => {
    expect(readTag(undefined)).toBeNull();
    expect(readTag(["a", "b"])).toBeNull();
    expect(readTag("%%")).toBeNull();
  });
});

test("tag links use the slug", () => {
  expect(orgTagHref("clb-xanh", "Môi trường")).toBe(
    "/org/clb-xanh/posts?tag=moi-truong",
  );
  expect(feedTagHref("Hiến máu")).toBe("/?tag=hien-mau");
  expect(feedTagHref("Hiến máu", "public")).toBe("/?tab=public&tag=hien-mau");
});

test("the label is the name a post used, or the slug", () => {
  const posts = [{ tags: ["Hiến máu"] }, { tags: ["Môi trường"] }];
  expect(tagLabel("moi-truong", posts)).toBe("Môi trường");
  expect(tagLabel("trong-cay", posts)).toBe("trong-cay");
});

test("listQuery leaves out empty values", () => {
  expect(listQuery({ filter: null, tag: "a", before: "" })).toBe("?tag=a");
  expect(listQuery({ filter: null })).toBe("");
});
