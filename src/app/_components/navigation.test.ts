import { expect, test } from "bun:test";
import { isActivePath } from "./navigation";

test("home matches only itself", () => {
  expect(isActivePath("/", "/")).toBe(true);
  expect(isActivePath("/explore", "/")).toBe(false);
});

test("my organizations covers its list, the form and owner addresses", () => {
  expect(isActivePath("/organizations", "/organizations")).toBe(true);
  expect(isActivePath("/organizations/new", "/organizations")).toBe(true);
  expect(isActivePath("/organizations/xanh/settings", "/organizations")).toBe(
    true,
  );
});

test("public organization addresses do not light up my organizations", () => {
  expect(isActivePath("/org/xanh", "/organizations")).toBe(false);
  expect(isActivePath("/org/xanh/posts", "/organizations")).toBe(false);
});

test("other links match the pages inside them", () => {
  expect(isActivePath("/activities", "/activities")).toBe(true);
  expect(isActivePath("/activities/123/hours", "/activities")).toBe(true);
  expect(isActivePath("/activitiesx", "/activities")).toBe(false);
});
