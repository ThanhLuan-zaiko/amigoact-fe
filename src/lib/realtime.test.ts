import { describe, expect, test } from "bun:test";
import {
  localTopic,
  ME,
  managersTopic,
  orgTopic,
  parseRealtimeFrame,
  realtimeSocketUrl,
  roomTopic,
  TopicCounts,
  wantsRefresh,
} from "./realtime";

describe("topics", () => {
  test("names match the backend", () => {
    expect(orgTopic("a")).toBe("org:a");
    expect(managersTopic("a")).toBe("org-managers:a");
    expect(roomTopic("a")).toBe("room:a");
  });

  test("the viewer's own topic is heard as ME", () => {
    expect(localTopic("user:123")).toBe(ME);
    expect(localTopic("org:123")).toBe("org:123");
  });
});

describe("parseRealtimeFrame", () => {
  test("reads events, revokes and the rest", () => {
    expect(
      parseRealtimeFrame('{"type":"members.changed","topic":"org:a"}'),
    ).toEqual({
      kind: "event",
      topic: "org:a",
      data: { type: "members.changed", topic: "org:a" },
    });
    expect(
      parseRealtimeFrame('{"type":"notification.read","topic":"user:9"}')
        ?.kind === "event" &&
        parseRealtimeFrame('{"type":"x","topic":"user:9"}'),
    ).toMatchObject({ topic: ME });
    expect(
      parseRealtimeFrame('{"op":"revoked","topic":"room:r","room_id":"r"}'),
    ).toMatchObject({ kind: "revoked", topic: "room:r" });
    expect(parseRealtimeFrame('{"op":"pong"}')).toEqual({
      kind: "other",
      data: { op: "pong" },
    });
  });

  test("malformed text gives null", () => {
    expect(parseRealtimeFrame("nope")).toBeNull();
    expect(parseRealtimeFrame("[1]")).toBeNull();
    expect(parseRealtimeFrame("null")).toBeNull();
  });
});

describe("TopicCounts", () => {
  test("subscribes on the first listener and leaves on the last", () => {
    const counts = new TopicCounts();
    expect(counts.add("org:a")).toBe(true);
    expect(counts.add("org:a")).toBe(false);
    expect(counts.remove("org:a")).toBe(false);
    expect(counts.remove("org:a")).toBe(true);
    expect(counts.remove("org:a")).toBe(false);
    expect(counts.size).toBe(0);
  });

  test("ME is never sent, and a revoked topic is forgotten", () => {
    const counts = new TopicCounts();
    counts.add(ME);
    counts.add("room:r");
    counts.add("org:a");
    counts.drop("room:r");
    expect(counts.remote()).toEqual(["org:a"]);
    expect(counts.remove("room:r")).toBe(false);
  });
});

describe("realtimeSocketUrl", () => {
  test("REALTIME_WS_URL wins, then CHAT_WS_URL", () => {
    expect(realtimeSocketUrl("http://api", "wss://rt.example/ws", "x")).toBe(
      "wss://rt.example/ws",
    );
    expect(
      realtimeSocketUrl("http://api", "", "wss://chat.example/ws/chat"),
    ).toBe("wss://chat.example/ws/chat");
    expect(realtimeSocketUrl("http://api", "http://wrong", undefined)).toBe(
      null,
    );
  });

  test("falls back to the backend address", () => {
    expect(realtimeSocketUrl("http://localhost:8100/", undefined, "")).toBe(
      "ws://localhost:8100/ws",
    );
    expect(realtimeSocketUrl("https://api.example", "", "")).toBe(
      "wss://api.example/ws",
    );
    expect(realtimeSocketUrl(undefined, undefined, undefined)).toBeNull();
  });
});

describe("wantsRefresh", () => {
  const types = ["membership.changed"] as const;

  test("matches the type and, when given, the organization", () => {
    expect(wantsRefresh({ type: "membership.changed" }, types)).toBe(true);
    expect(
      wantsRefresh({ type: "membership.changed", org_id: "a" }, types, "a"),
    ).toBe(true);
    expect(
      wantsRefresh({ type: "membership.changed", org_id: "b" }, types, "a"),
    ).toBe(false);
    expect(wantsRefresh({ type: "members.changed" }, types)).toBe(false);
    expect(wantsRefresh({}, types)).toBe(false);
  });

  test("a resync always reloads", () => {
    expect(wantsRefresh({ type: "resync" }, types, "a")).toBe(true);
  });
});
