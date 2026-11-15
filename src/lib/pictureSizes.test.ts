import { describe, expect, test } from "bun:test";
import { parseWidth, sizedSrc, srcSetFor } from "./pictureSizes";

describe("parseWidth", () => {
  test("accepts a plain whole number in range", () => {
    expect(parseWidth("640")).toBe(640);
    expect(parseWidth("4096")).toBe(4096);
  });

  test("drops anything else", () => {
    for (const raw of [
      null,
      "",
      "0",
      "-5",
      "abc",
      "64.5",
      "0640",
      "4097",
      "1e3",
    ]) {
      expect(parseWidth(raw)).toBeNull();
    }
  });
});

describe("srcSetFor", () => {
  test("lists every stored width for a media path", () => {
    expect(srcSetFor("/media/abc/file")).toBe(
      "/media/abc/file?w=320 320w, /media/abc/file?w=640 640w, " +
        "/media/abc/file?w=1080 1080w, /media/abc/file?w=1600 1600w, " +
        "/media/abc/file?w=2400 2400w",
    );
  });

  test("leaves blob, data and query URLs alone", () => {
    expect(srcSetFor("blob:http://x/1")).toBeUndefined();
    expect(srcSetFor("data:image/webp;base64,AA")).toBeUndefined();
    expect(srcSetFor("/media/abc/file?w=1")).toBeUndefined();
    expect(sizedSrc("blob:http://x/1", 640)).toBe("blob:http://x/1");
  });
});
