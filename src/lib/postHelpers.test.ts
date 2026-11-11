import { describe, expect, test } from "bun:test";
import {
  feedFilter,
  isPostId,
  POST_MESSAGES,
  postKinds,
  postPath,
  purgeConfirmed,
  toPost,
  validateComment,
  validatePost,
} from "./posts";

const valid = { title: "Ngày hội", body: "Nội dung", tags: "" };

describe("validatePost inside an organization", () => {
  test("needs no organization field when the page gives it", () => {
    expect(validatePost(valid)).toEqual({});
  });

  test("a title of digits or marks only is refused", () => {
    expect(validatePost({ ...valid, title: "2024" }).post_title).toBe(
      POST_MESSAGES.titleLetter,
    );
    expect(validatePost({ ...valid, title: "!!!" }).post_title).toBe(
      POST_MESSAGES.titleLetter,
    );
  });
});

describe("validateComment", () => {
  test("needs 1 to 1000 characters after trimming", () => {
    expect(validateComment("  ")).toBe(POST_MESSAGES.comment);
    expect(validateComment("x".repeat(1001))).toBe(POST_MESSAGES.comment);
    expect(validateComment(" Chào ")).toBeNull();
  });
});

describe("postKinds", () => {
  test("only managers may announce", () => {
    expect(postKinds(true)).toEqual(["announcement", "discussion"]);
    expect(postKinds(false)).toEqual(["discussion"]);
  });
});

describe("feedFilter", () => {
  test("keeps known filters and falls back to all", () => {
    expect(feedFilter("pinned")).toBe("pinned");
    expect(feedFilter("announcement")).toBe("announcement");
    expect(feedFilter("x")).toBe("all");
    expect(feedFilter(["pinned"])).toBe("all");
    expect(feedFilter(undefined)).toBe("all");
  });
});

describe("isPostId", () => {
  test("accepts a UUIDv7 only", () => {
    expect(isPostId("0190a1b2-c3d4-7e5f-8a6b-7c8d9e0f1a2b")).toBe(true);
    expect(isPostId("0190a1b2-c3d4-4e5f-8a6b-7c8d9e0f1a2b")).toBe(false);
    expect(isPostId("drafts")).toBe(false);
    expect(isPostId("1 OR 1=1")).toBe(false);
  });
});

describe("purgeConfirmed", () => {
  test("needs the exact title, ignoring spaces around it", () => {
    expect(purgeConfirmed("Ngày hội", " Ngày hội ")).toBe(true);
    expect(purgeConfirmed("Ngày hội", "ngày hội")).toBe(false);
    expect(purgeConfirmed("Ngày hội", "")).toBe(false);
    expect(purgeConfirmed("  ", "  ")).toBe(false);
  });
});

describe("postPath", () => {
  test("builds feed and post addresses with escaped parts", () => {
    expect(postPath("clb-a")).toBe("/organizations/clb-a/posts");
    expect(postPath("clb-a", "id 1")).toBe("/organizations/clb-a/posts/id%201");
  });
});

describe("toPost viewer rights", () => {
  test("a post without rights from the API gets no rights", () => {
    const post = toPost(
      {
        id: "p1",
        kind: "discussion",
        visibility: "public",
        status: "active",
        title: "T",
        body: "B",
        tags: [],
        media: [],
        pinned: false,
        comment_count: 0,
        org: { slug: "clb-a", name: "CLB A" },
        created_at: "2026-11-10T00:00:00Z",
        published_at: null,
      },
      (value) => value,
    );
    expect(post.slug).toBe("clb-a");
    expect(post.viewer).toEqual({
      can_edit: false,
      can_delete: false,
      can_pin: false,
      can_comment: false,
    });
    expect(post.edited).toBe(false);
  });
});
