import { describe, expect, test } from "bun:test";
import { failureState } from "./forms";
import type { MyOrganization } from "./organizations";
import {
  effectiveVisibility,
  parseTags,
  postableOrganizations,
  renameIssueField,
  toPost,
  validatePost,
} from "./posts";

function org(slug: string, role: MyOrganization["role"], status = "active") {
  return { slug, name: slug, role, status } as MyOrganization;
}

describe("parseTags", () => {
  test("splits, trims and drops empty and repeated tags", () => {
    expect(parseTags(" a, b ,,A,c ")).toEqual(["a", "b", "c"]);
  });

  test("returns an empty list for blank input", () => {
    expect(parseTags("  ")).toEqual([]);
  });
});

describe("postableOrganizations", () => {
  const all = [
    org("owned", "owner"),
    org("admin", "admin"),
    org("member", "member"),
    org("pending", "member", "pending"),
  ];

  test("any active member may start a discussion", () => {
    expect(
      postableOrganizations(all, "discussion").map((item) => item.slug),
    ).toEqual(["owned", "admin", "member"]);
  });

  test("only owners and admins may announce", () => {
    expect(
      postableOrganizations(all, "announcement").map((item) => item.slug),
    ).toEqual(["owned", "admin"]);
  });
});

describe("validatePost", () => {
  const valid = { org: "club", title: "Hi", body: "Text", tags: "a, b" };

  test("accepts a complete post", () => {
    expect(validatePost(valid)).toEqual({});
  });

  test("reports each empty required field", () => {
    const errors = validatePost({ org: "", title: " ", body: "", tags: "" });
    expect(Object.keys(errors).sort()).toEqual([
      "org_slug",
      "post_body",
      "post_title",
    ]);
  });

  test("rejects a long title and too many or empty-looking tags", () => {
    expect(validatePost({ ...valid, title: "x".repeat(161) }).post_title).toBe(
      "Vui lòng nhập tiêu đề (tối đa 160 ký tự).",
    );
    expect(validatePost({ ...valid, tags: "a,b,c,d" }).post_tags).toBe(
      "Mỗi bài có tối đa 3 thẻ.",
    );
    expect(validatePost({ ...valid, tags: "!!!" }).post_tags).toBe(
      "Thẻ cần có ít nhất một chữ hoặc số.",
    );
  });
});

describe("backend issues", () => {
  test("title, body and tags map to the form's field names", () => {
    expect(renameIssueField("title")).toBe("post_title");
    expect(renameIssueField("kind")).toBe("kind");
  });

  test("a too-long tag list shows a red message under the tag field", () => {
    expect(
      failureState("validation_error", [
        { field: renameIssueField("tags"), type: "too_many_tags" },
      ]),
    ).toEqual({ fieldErrors: { post_tags: "Mỗi bài có tối đa 3 thẻ." } });
  });

  test("an empty title from the backend uses the post message", () => {
    expect(
      failureState("validation_error", [
        { field: renameIssueField("title"), type: "string_too_short" },
      ]),
    ).toEqual({
      fieldErrors: { post_title: "Tiêu đề cần từ 1 đến 160 ký tự." },
    });
  });

  test("a forbidden kind shows a general error", () => {
    expect(failureState("post_forbidden").error).toContain("không có quyền");
  });
});

describe("images and visibility", () => {
  const valid = { org: "club", title: "Hi", body: "Text", tags: "" };

  test("a discussion defaults to members, so pictures are rejected", () => {
    const errors = validatePost({
      ...valid,
      kind: "discussion",
      visibility: "",
      mediaCount: 1,
    });
    expect(errors.media_ids).toContain("không có ảnh");
  });

  test("an announcement defaults to public, so pictures are accepted", () => {
    expect(
      validatePost({ ...valid, kind: "announcement", mediaCount: 2 }),
    ).toEqual({});
  });

  test("a public discussion may have pictures", () => {
    expect(
      validatePost({
        ...valid,
        kind: "discussion",
        visibility: "public",
        mediaCount: 1,
      }),
    ).toEqual({});
  });

  test("effectiveVisibility keeps an explicit choice", () => {
    expect(effectiveVisibility("announcement", "members")).toBe("members");
    expect(effectiveVisibility("discussion", "")).toBe("members");
  });
});

describe("toPost", () => {
  test("maps the API shape and serves pictures from the frontend path", () => {
    const post = toPost(
      {
        id: "p1",
        kind: "announcement",
        visibility: "public",
        status: "draft",
        title: "T",
        body: "B",
        tags: ["a"],
        media: [
          { id: "m1", url: "/media/m1/file", mime: "image/png" },
          { id: "m2", url: "/media/m2/file", mime: "video/mp4" },
        ],
        pinned: false,
        comment_count: 0,
        org: { slug: "club", name: "Câu lạc bộ" },
        created_at: "2026-01-01T00:00:00Z",
        published_at: null,
      },
      (value) => `d:${value}`,
    );
    expect(post.media).toEqual([
      { src: "/media/m1/file", isVideo: false },
      { src: "/media/m2/file", isVideo: true },
    ]);
    expect(post.publishedAt).toBe("d:2026-01-01T00:00:00Z");
    expect(post.organizationInitials).toBe("CL");
  });
});
