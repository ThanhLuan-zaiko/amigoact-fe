import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { RealtimeTicket } from "@/app/_actions/realtime";
import { RealtimeClient, type TopicMessage } from "./client";

// A stand-in for the browser socket: it records what is sent and lets a test play the server.
class FakeSocket {
  static OPEN = 1;
  static last: FakeSocket | null = null;
  readyState = 0;
  sent: Record<string, unknown>[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number }) => void) | null = null;

  constructor(readonly url: string) {
    FakeSocket.last = this;
  }

  send(text: string) {
    this.sent.push(JSON.parse(text));
  }

  close(code = 1000) {
    this.readyState = 3;
    this.onclose?.({ code });
  }

  serverOpens() {
    this.readyState = FakeSocket.OPEN;
    this.onopen?.();
  }

  serverSends(body: object) {
    this.onmessage?.({ data: JSON.stringify(body) });
  }
}

const globals = globalThis as Record<string, unknown>;
const saved = {
  window: globals.window,
  document: globals.document,
  WebSocket: globals.WebSocket,
};

beforeEach(() => {
  const noop = () => {};
  globals.window = { addEventListener: noop, removeEventListener: noop };
  globals.document = {
    addEventListener: noop,
    removeEventListener: noop,
    hidden: false,
  };
  globals.WebSocket = FakeSocket;
  FakeSocket.last = null;
});

afterEach(() => {
  Object.assign(globals, saved);
});

const ticket = async (): Promise<RealtimeTicket> => ({
  ok: true,
  ticket: "t 1",
  url: "ws://api/ws",
});

async function connected(): Promise<FakeSocket> {
  // Let the ticket promise settle, then let the server accept.
  await Promise.resolve();
  await Promise.resolve();
  const socket = FakeSocket.last;
  if (!socket) {
    throw new Error("no socket opened");
  }
  socket.serverOpens();
  return socket;
}

describe("RealtimeClient", () => {
  test("stays closed until something listens", () => {
    const client = new RealtimeClient(ticket);
    expect(client.getStatus()).toBe("idle");
    expect(FakeSocket.last).toBeNull();
  });

  test("subscribes the topics in use and delivers their events", async () => {
    const client = new RealtimeClient(ticket);
    const heard: TopicMessage[] = [];
    client.listen("org:a", (message) => heard.push(message));
    client.listen("me", (message) => heard.push(message));
    const socket = await connected();

    expect(socket.url).toBe("ws://api/ws?ticket=t%201");
    expect(socket.sent).toEqual([{ op: "subscribe", topic: "org:a" }]);
    expect(client.getStatus()).toBe("live");

    socket.serverSends({ type: "members.changed", topic: "org:a" });
    socket.serverSends({ type: "notification.read", topic: "user:9" });
    socket.serverSends({ type: "other", topic: "org:b" });
    expect(heard.map((m) => m.data.type)).toEqual([
      "members.changed",
      "notification.read",
    ]);
    client.stop();
  });

  test("leaves a topic when its last listener goes", async () => {
    const client = new RealtimeClient(ticket);
    const first = client.listen("org:a", () => {});
    const second = client.listen("org:a", () => {});
    const socket = await connected();

    first();
    expect(socket.sent.at(-1)).toEqual({ op: "subscribe", topic: "org:a" });
    second();
    expect(socket.sent.at(-1)).toEqual({ op: "unsubscribe", topic: "org:a" });
    client.stop();
  });

  test("a revoked topic is not subscribed again after a reconnect", async () => {
    const client = new RealtimeClient(ticket);
    const kinds: string[] = [];
    client.listen("room:r", (message) => kinds.push(message.kind));
    client.listen("org:a", () => {});
    const socket = await connected();

    socket.serverSends({ op: "revoked", topic: "room:r", room_id: "r" });
    expect(kinds).toEqual(["revoked"]);

    const opens: boolean[] = [];
    client.onOpen((first) => opens.push(first));
    // A 30-minute expiry reconnects at once with a fresh ticket.
    socket.close(4408);
    await new Promise((resolve) => setTimeout(resolve, 5));
    const next = await connected();
    expect(next).not.toBe(socket);
    expect(next.sent).toEqual([{ op: "subscribe", topic: "org:a" }]);
    expect(opens).toEqual([false]);
    client.stop();
  });

  test("without an address it goes offline and does not retry", async () => {
    const client = new RealtimeClient(async () => ({
      ok: false,
      reason: "no_url",
    }));
    client.listen("org:a", () => {});
    await Promise.resolve();
    await Promise.resolve();
    expect(client.getStatus()).toBe("offline");
    expect(FakeSocket.last).toBeNull();
    client.stop();
  });
});
