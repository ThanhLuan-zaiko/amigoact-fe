import { describe, expect, test } from "bun:test";
import {
  asVideoInfo,
  hlsFileName,
  isWaiting,
  parseQuality,
  transcodedUrl,
  videoSources,
} from "./video";

describe("asVideoInfo", () => {
  test("reads a ready video", () => {
    expect(
      asVideoInfo({
        status: "ready",
        qualities: [480, 720, "x"],
        hls: true,
        poster: true,
        duration: 12.5,
      }),
    ).toEqual({
      status: "ready",
      qualities: [480, 720],
      hls: true,
      poster: true,
      duration: 12.5,
    });
  });

  test("treats unknown state as pending and drops non-objects", () => {
    expect(asVideoInfo({ status: "weird" })?.status).toBe("pending");
    expect(asVideoInfo(null)).toBeNull();
    expect(asVideoInfo("ready")).toBeNull();
  });
});

test("parseQuality accepts only plain numbers in range", () => {
  expect(parseQuality("720")).toBe(720);
  for (const raw of [null, "", "99", "0720", "4320", "hd", "7e2"]) {
    expect(parseQuality(raw)).toBeNull();
  }
});

test("hlsFileName accepts only stream files", () => {
  expect(hlsFileName(["master.m3u8"])).toBe("master.m3u8");
  expect(hlsFileName(["r720", "seg00003.m4s"])).toBe("r720/seg00003.m4s");
  for (const parts of [["..", "x"], ["r720", "..", "a"], ["poster.jpg"], []]) {
    expect(hlsFileName(parts)).toBeNull();
  }
});

describe("videoSources", () => {
  test("a ready video uses the stream and poster", () => {
    const info = asVideoInfo({ status: "ready", hls: true, poster: true });
    expect(videoSources("abc", info)).toEqual({
      mp4: "/media/abc/video",
      hls: "/media/abc/hls/master.m3u8",
      poster: "/media/abc/poster?w=1080",
    });
    expect(isWaiting(info)).toBe(false);
  });

  test("a waiting video plays the upload with no stream", () => {
    const info = asVideoInfo({ status: "processing", hls: true, poster: true });
    expect(videoSources("abc", info)).toEqual({
      mp4: "/media/abc/video",
      hls: null,
      poster: null,
    });
    expect(isWaiting(info)).toBe(true);
  });
});

test("transcodedUrl swaps only media upload paths", () => {
  const id = "01a1ce76-d011-73b0-b390-48650edea927";
  expect(transcodedUrl(`/media/${id}/file`)).toBe(`/media/${id}/video`);
  expect(transcodedUrl("blob:http://x/1")).toBe("blob:http://x/1");
  expect(transcodedUrl(`/media/${id}/file?w=1`)).toBe(`/media/${id}/file?w=1`);
});
