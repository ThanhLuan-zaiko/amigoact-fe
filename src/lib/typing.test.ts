import { describe, expect, test } from "bun:test";
import { readFrame } from "./chatEvents";
import {
  addTypist,
  dropTypist,
  pruneTyping,
  TYPING_SHOW_MS,
  type TypingMap,
  typingText,
} from "./typing";

const ROOM = "0190a000-0000-7000-8000-000000000001";
const LAN = "0190a000-0000-7000-8000-0000000000aa";
const BINH = "0190a000-0000-7000-8000-0000000000bb";

describe("typing map", () => {
  test("a new signal from the same person refreshes, not duplicates", () => {
    let map: TypingMap = addTypist({}, ROOM, LAN, "Nguyễn Lan", 1000);
    map = addTypist(map, ROOM, LAN, "Nguyễn Lan", 3000);
    expect(map[ROOM]).toEqual([
      { userId: LAN, name: "Nguyễn Lan", until: 3000 + TYPING_SHOW_MS },
    ]);
  });

  test("old signals fade and empty rooms disappear", () => {
    const map = addTypist(
      addTypist({}, ROOM, LAN, "Lan", 0),
      ROOM,
      BINH,
      "Bình",
      4000,
    );
    const later = pruneTyping(map, TYPING_SHOW_MS + 1);
    expect(later[ROOM]?.map((item) => item.userId)).toEqual([BINH]);
    expect(pruneTyping(later, 4000 + TYPING_SHOW_MS + 1)).toEqual({});
    expect(pruneTyping(later, 10)).toBe(later);
  });

  test("a message from the person ends their typing", () => {
    const map = addTypist({}, ROOM, LAN, "Lan", 0);
    expect(dropTypist(map, ROOM, LAN)).toEqual({});
    expect(dropTypist(map, ROOM, BINH)).toBe(map);
  });
});

describe("typingText", () => {
  const one = addTypist({}, ROOM, LAN, "Nguyễn Thị Lan", 0)[ROOM];
  const two = addTypist({ [ROOM]: one }, ROOM, BINH, "Trần Bình", 0)[ROOM];

  test("names one, two, or one and a count in a group", () => {
    expect(typingText(one, "org")).toBe("Lan đang nhập…");
    expect(typingText(two, "channel")).toBe("Lan và Bình đang nhập…");
    const three = [...two, { userId: "x", name: "Mai", until: 1 }];
    expect(typingText(three, "org")).toBe("Lan và 2 người khác đang nhập…");
  });

  test("a direct message needs no name, and nobody gives null", () => {
    expect(typingText(one, "dm")).toBe("đang nhập…");
    expect(typingText([], "org")).toBeNull();
    expect(typingText(undefined, "dm")).toBeNull();
  });
});

describe("readFrame typing", () => {
  test("reads the event and refuses one without a person", () => {
    expect(
      readFrame({ type: "typing", room_id: ROOM, user_id: LAN, name: "Lan" }),
    ).toEqual({ kind: "typing", roomId: ROOM, userId: LAN, name: "Lan" });
    expect(readFrame({ type: "typing", room_id: ROOM })).toBeNull();
  });
});
