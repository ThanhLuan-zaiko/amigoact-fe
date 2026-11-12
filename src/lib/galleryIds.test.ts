import { describe, expect, test } from "bun:test";
import { galleryIds } from "./galleryIds";

function form(entries: [string, string][]): FormData {
  const data = new FormData();
  for (const [key, value] of entries) {
    data.append(key, value);
  }
  return data;
}

describe("galleryIds", () => {
  test("unmarked pictures join the gallery files, in order", () => {
    const data = form([
      ["gallery_asset_id", "g1"],
      ["extra_picture_id", "p1"],
      ["extra_picture_id", "p2"],
    ]);
    expect(galleryIds(data)).toEqual(["g1", "p1", "p2"]);
  });

  test("the logo and cover never go to the gallery", () => {
    const data = form([
      ["logo_asset_id", "p1"],
      ["cover_asset_id", "p2"],
      ["extra_picture_id", "p1"],
      ["extra_picture_id", "p2"],
      ["extra_picture_id", "p3"],
    ]);
    expect(galleryIds(data)).toEqual(["p3"]);
  });

  test("a file sent twice is listed once and empty values are dropped", () => {
    const data = form([
      ["gallery_asset_id", "g1"],
      ["extra_picture_id", "g1"],
      ["extra_picture_id", ""],
    ]);
    expect(galleryIds(data)).toEqual(["g1"]);
  });
});
