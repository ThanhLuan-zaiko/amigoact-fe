import { expect, test } from "bun:test";
import { INTERNAL_KEY_HEADER, internalKeyHeaders } from "./internalKey";

test("internalKeyHeaders sends the key in its header", () => {
  expect(internalKeyHeaders("secret-key")).toEqual({
    [INTERNAL_KEY_HEADER]: "secret-key",
  });
});

test("internalKeyHeaders sends nothing without a key", () => {
  expect(internalKeyHeaders("")).toEqual({});
});

test("the header name matches the backend", () => {
  expect(INTERNAL_KEY_HEADER).toBe("x-internal-key");
});
