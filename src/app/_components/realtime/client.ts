import type { RealtimeTicket } from "@/app/_actions/realtime";
import { PING_INTERVAL_MS, reconnectDelay } from "@/lib/chat";
import {
  ME,
  parseRealtimeFrame,
  type RealtimeData,
  TopicCounts,
} from "@/lib/realtime";

export type RealtimeStatus = "idle" | "connecting" | "live" | "offline";
export type TopicMessage = { kind: "event" | "revoked"; data: RealtimeData };
type TopicListener = (message: TopicMessage) => void;
// Called after every open; first is true for the first open since the page loaded.
type OpenListener = (first: boolean) => void;

// The backend closes a socket after 30 minutes with 4408, so a new ticket is fetched at once.
const EXPIRED_CLOSE = 4408;
// A socket that has not opened by then is given up, because a dropped connection can hang.
const OPEN_TIMEOUT_MS = 10_000;

// One socket for the whole app. It opens when the first component listens, so guests and pages
// without live parts never connect. Topics are subscribed while anyone listens to them.
export class RealtimeClient {
  private counts = new TopicCounts();
  private listeners = new Map<string, Set<TopicListener>>();
  private openListeners = new Set<OpenListener>();
  private statusListeners = new Set<() => void>();
  private socket: WebSocket | null = null;
  private status: RealtimeStatus = "idle";
  private started = false;
  private connecting = false;
  private opens = 0;
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | undefined;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private pingTimer: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly fetchTicket: () => Promise<RealtimeTicket>) {}

  getStatus = (): RealtimeStatus => this.status;

  subscribeStatus = (listener: () => void): (() => void) => {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  };

  listen(topic: string, listener: TopicListener): () => void {
    let set = this.listeners.get(topic);
    if (!set) {
      set = new Set();
      this.listeners.set(topic, set);
    }
    set.add(listener);
    if (this.counts.add(topic) && topic !== ME) {
      this.send({ op: "subscribe", topic });
    }
    this.start();
    return () => {
      set.delete(listener);
      if (this.counts.remove(topic) && topic !== ME) {
        this.send({ op: "unsubscribe", topic });
      }
    };
  }

  onOpen(listener: OpenListener): () => void {
    this.openListeners.add(listener);
    return () => this.openListeners.delete(listener);
  }

  start(): void {
    if (this.started || typeof window === "undefined") {
      return;
    }
    this.started = true;
    window.addEventListener("online", this.retryNow);
    document.addEventListener("visibilitychange", this.retryNow);
    this.connect();
  }

  stop(): void {
    this.started = false;
    clearTimeout(this.retryTimer);
    clearTimeout(this.openTimer);
    clearInterval(this.pingTimer);
    window.removeEventListener("online", this.retryNow);
    document.removeEventListener("visibilitychange", this.retryNow);
    this.socket?.close(1000);
    this.socket = null;
    this.setStatus("idle");
  }

  private setStatus(status: RealtimeStatus): void {
    if (this.status !== status) {
      this.status = status;
      for (const listener of this.statusListeners) {
        listener();
      }
    }
  }

  private send(body: object): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(body));
    }
  }

  private scheduleRetry(delay: number): void {
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.connect(), delay);
  }

  // Coming back online or to the tab retries at once instead of waiting out the backoff.
  private retryNow = (): void => {
    if (this.started && !this.socket && !this.connecting && !document.hidden) {
      this.attempt = 0;
      this.scheduleRetry(0);
    }
  };

  private async connect(): Promise<void> {
    if (!this.started || this.socket || this.connecting) {
      return;
    }
    this.connecting = true;
    // After a failure the status stays "offline" while it retries; pages poll meanwhile.
    if (this.status !== "offline") {
      this.setStatus("connecting");
    }
    let ticket: RealtimeTicket;
    try {
      ticket = await this.fetchTicket();
    } catch {
      ticket = { ok: false, reason: "failed" };
    }
    this.connecting = false;
    if (!this.started) {
      return;
    }
    if (!ticket.ok) {
      this.setStatus("offline");
      // Without an address or a session, only coming back to the tab tries again.
      if (ticket.reason === "failed") {
        this.scheduleRetry(reconnectDelay(this.attempt++));
      }
      return;
    }
    this.open(`${ticket.url}?ticket=${encodeURIComponent(ticket.ticket)}`);
  }

  private open(address: string): void {
    const socket = new WebSocket(address);
    this.socket = socket;
    this.openTimer = setTimeout(() => socket.close(), OPEN_TIMEOUT_MS);
    socket.onopen = () => {
      clearTimeout(this.openTimer);
      this.attempt = 0;
      for (const topic of this.counts.remote()) {
        socket.send(JSON.stringify({ op: "subscribe", topic }));
      }
      this.pingTimer = setInterval(
        () => this.send({ op: "ping" }),
        PING_INTERVAL_MS,
      );
      this.setStatus("live");
      const first = this.opens === 0;
      this.opens += 1;
      for (const listener of this.openListeners) {
        listener(first);
      }
    };
    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        this.dispatch(event.data);
      }
    };
    socket.onclose = (event) => {
      clearTimeout(this.openTimer);
      clearInterval(this.pingTimer);
      if (this.socket === socket) {
        this.socket = null;
      }
      if (!this.started) {
        return;
      }
      this.setStatus("offline");
      this.scheduleRetry(
        event.code === EXPIRED_CLOSE ? 0 : reconnectDelay(this.attempt++),
      );
    };
  }

  private dispatch(text: string): void {
    const frame = parseRealtimeFrame(text);
    if (!frame || frame.kind === "other") {
      return;
    }
    if (frame.kind === "revoked") {
      this.counts.drop(frame.topic);
    }
    for (const listener of [...(this.listeners.get(frame.topic) ?? [])]) {
      listener({ kind: frame.kind, data: frame.data });
    }
  }
}
