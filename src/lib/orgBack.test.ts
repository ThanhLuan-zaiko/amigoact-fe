import { describe, expect, test } from "bun:test";
import { feedBackHref } from "./orgBack";

const feed = "/org/club/posts";

describe("feedBackHref", () => {
  test("the feed and other org pages keep the full header", () => {
    expect(feedBackHref(feed, "club")).toBeNull();
    expect(feedBackHref(`${feed}/`, "club")).toBeNull();
    expect(feedBackHref("/org/club", "club")).toBeNull();
    expect(feedBackHref("/org/club/activities", "club")).toBeNull();
  });

  test("feed sub pages go back to the feed", () => {
    expect(feedBackHref(`${feed}/new`, "club")).toBe(feed);
    expect(feedBackHref(`${feed}/drafts`, "club")).toBe(feed);
    expect(feedBackHref(`${feed}/trash`, "club")).toBe(feed);
    expect(feedBackHref(`${feed}/abc`, "club")).toBe(feed);
  });

  test("the edit form goes back to its post", () => {
    expect(feedBackHref(`${feed}/abc/edit`, "club")).toBe(`${feed}/abc`);
  });
});
