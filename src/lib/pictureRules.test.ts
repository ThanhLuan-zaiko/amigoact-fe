import { describe, expect, test } from "bun:test";
import {
  galleryFileError,
  isPictureId,
  isPictureTooLarge,
  PICTURE_MAX_BYTES,
  VIDEO_MAX_BYTES,
} from "./pictureRules";

describe("isPictureId", () => {
  test("accepts a UUIDv7 as the backend creates them", () => {
    expect(isPictureId("0190f2a4-7c3b-7d1e-8a4f-2b9c6d1e0f37")).toBe(true);
  });

  test("rejects other UUID versions and malformed ids", () => {
    expect(isPictureId("0190f2a4-7c3b-4d1e-8a4f-2b9c6d1e0f37")).toBe(false);
    expect(isPictureId("../../organizations")).toBe(false);
    expect(isPictureId("")).toBe(false);
  });
});

describe("isPictureTooLarge", () => {
  test("allows a picture of exactly 20 MB", () => {
    expect(isPictureTooLarge(PICTURE_MAX_BYTES)).toBe(false);
  });

  test("rejects a picture one byte over the limit", () => {
    expect(isPictureTooLarge(PICTURE_MAX_BYTES + 1)).toBe(true);
  });
});

describe("galleryFileError", () => {
  test("accepts pictures and videos within their limits", () => {
    expect(galleryFileError({ type: "image/png", size: 10 })).toBeNull();
    expect(
      galleryFileError({ type: "video/mp4", size: VIDEO_MAX_BYTES }),
    ).toBeNull();
  });

  test("applies the limit of each kind", () => {
    expect(
      galleryFileError({ type: "image/png", size: PICTURE_MAX_BYTES + 1 }),
    ).not.toBeNull();
    expect(
      galleryFileError({ type: "video/webm", size: VIDEO_MAX_BYTES + 1 }),
    ).not.toBeNull();
  });

  test("rejects other file types", () => {
    expect(
      galleryFileError({ type: "application/pdf", size: 1 }),
    ).not.toBeNull();
  });
});
