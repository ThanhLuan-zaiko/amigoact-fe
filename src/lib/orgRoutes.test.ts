import { expect, test } from "bun:test";
import {
  keepAddress,
  orgBase,
  orgDecision,
  pagePath,
  parseOrgRoute,
} from "./orgRoutes";

test("parseOrgRoute reads both addresses", () => {
  expect(parseOrgRoute("/org/xanh/posts")).toEqual({
    ownerAddress: false,
    slug: "xanh",
    rest: "/posts",
  });
  expect(parseOrgRoute("/organizations/xanh")).toEqual({
    ownerAddress: true,
    slug: "xanh",
    rest: "",
  });
});

test("the owned list and the create form are not organization pages", () => {
  expect(parseOrgRoute("/organizations")).toBeNull();
  expect(parseOrgRoute("/organizations/")).toBeNull();
  expect(parseOrgRoute("/organizations/new")).toBeNull();
  expect(parseOrgRoute("/organizationsx/xanh")).toBeNull();
  expect(parseOrgRoute("/")).toBeNull();
});

test("an owner on the public address goes to the owner address", () => {
  expect(orgDecision("/org/xanh/settings", true)).toEqual({
    kind: "redirect",
    path: "/organizations/xanh/settings",
  });
});

test("a non-owner on the owner address goes to the public address", () => {
  expect(orgDecision("/organizations/xanh/posts", false)).toEqual({
    kind: "redirect",
    path: "/org/xanh/posts",
  });
});

test("an owner address is served by the /org pages", () => {
  expect(orgDecision("/organizations/xanh/posts", true)).toEqual({
    kind: "rewrite",
    path: "/org/xanh/posts",
  });
});

test("a non-owner on the public address and other pages pass", () => {
  expect(orgDecision("/org/xanh", false)).toEqual({ kind: "none" });
  expect(orgDecision("/organizations/new", true)).toEqual({ kind: "none" });
  expect(orgDecision("/explore", true)).toEqual({ kind: "none" });
});

test("pagePath maps both addresses to the page address", () => {
  expect(pagePath("/organizations/xanh/posts")).toBe("/org/xanh/posts");
  expect(pagePath("/org/xanh/posts")).toBe("/org/xanh/posts");
  expect(pagePath("/organizations/new")).toBe("/organizations/new");
});

test("keepAddress keeps the owner address the viewer is on", () => {
  expect(
    keepAddress("/organizations/xanh/posts", "/org/xanh/posts?tag=1"),
  ).toBe("/organizations/xanh/posts?tag=1");
  expect(keepAddress("/organizations/xanh", "/org/xanh/posts#top")).toBe(
    "/organizations/xanh/posts#top",
  );
});

test("keepAddress leaves other links alone", () => {
  expect(keepAddress("/org/xanh/posts", "/org/xanh/posts?tag=1")).toBe(
    "/org/xanh/posts?tag=1",
  );
  expect(keepAddress("/organizations/xanh", "/org/khac")).toBe("/org/khac");
  expect(keepAddress("/organizations/xanh", "/explore")).toBe("/explore");
});

test("orgBase picks the prefix", () => {
  expect(orgBase("xanh", true)).toBe("/organizations/xanh");
  expect(orgBase("xanh", false)).toBe("/org/xanh");
});
