import {
  CLOSE_FORBIDDEN,
  CLOSE_UNAUTHORIZED,
  MAX_FRAME_CHARS,
  fetchTicket,
  parseEnvelope,
  wsUrl,
} from "./realtime-transport.ts";
import type { ServerEnvelope } from "./realtime-transport.ts";
import type {
  ChannelHandler,
  RealtimeIssue,
  RealtimeStatus,
  StatusHandler,
} from "./realtime-types.ts";

/** Socket machinery behind `core/realtime.ts` (AGENTS.md 12.1); core-internal. */

const BASE_RETRY_MS = 500;
const MAX_RETRY_MS = 15_000;
const DEFAULT_WATCHDOG_MS = 40_000;
const WATCHDOG_GRACE_MS = 15_000;
const MIN_WATCHDOG_MS = 5_000;
const MAX_WATCHDOG_MS = 120_000;
// Server budgets subscribe.v1 at 20/min: a StrictMode remount would
// burn a leave+join pair, so leaves linger and cancel on resubscribe.
const UNSUB_LINGER_MS = 750;

type Timer = ReturnType<typeof setTimeout>;

export class RealtimeClient {
  private socket: WebSocket | null = null;
  private readonly handlers = new Map<string, Set<ChannelHandler>>();
  private readonly denied = new Set<string>();
  private readonly pendingUnsub = new Map<string, Timer>();
  private readonly statusHandlers = new Set<StatusHandler>();
  private status: RealtimeStatus = "idle";
  private issue: RealtimeIssue = null;
  private retryAttempt = 0;
  private retryTimer: Timer | null = null;
  private watchdogTimer: Timer | null = null;
  private watchdogMs = DEFAULT_WATCHDOG_MS;
  private manualClose = false;
  private connecting = false;
  private generation = 0; // teardown() bumps this to drop in-flight connect()

  getStatus(): RealtimeStatus {
    return this.status;
  }

  getIssue(): RealtimeIssue {
    return this.issue;
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
      this.maybeTeardown();
    };
  }

  subscribe(channel: string, handler: ChannelHandler): () => void {
    // A pending leave still counts as joined; cancel instead of re-joining.
    const pending = this.pendingUnsub.get(channel);
    if (pending !== undefined) {
      clearTimeout(pending);
      this.pendingUnsub.delete(channel);
    }
    let set = this.handlers.get(channel);
    const alreadyJoined = set !== undefined || pending !== undefined;
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
    }
    set.add(handler);
    if (!this.denied.has(channel)) {
      this.ensureConnected();
      // One subscribe.v1 per channel; extra handlers stay local.
      if (!alreadyJoined && this.isOpen()) this.sendSubscribe(channel);
    }
    return () => this.unsubscribe(channel, handler);
  }

  private unsubscribe(channel: string, handler: ChannelHandler): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(channel);
      this.denied.delete(channel);
      if (this.isOpen()) {
        const timer = setTimeout(() => {
          this.pendingUnsub.delete(channel);
          if (this.handlers.has(channel)) return;
          this.send("unsubscribe.v1", { channel });
        }, UNSUB_LINGER_MS);
        this.pendingUnsub.set(channel, timer);
      }
    }
    this.maybeTeardown();
  }

  private maybeTeardown(): void {
    if (this.handlers.size === 0 && this.statusHandlers.size === 0) this.teardown();
  }

  private isOpen(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  private notifyStatus(): void {
    for (const handler of this.statusHandlers) handler(this.status);
  }

  private setStatus(next: RealtimeStatus): void {
    if (this.status === next) return;
    this.status = next;
    this.notifyStatus();
  }

  private setIssue(next: RealtimeIssue): void {
    if (this.issue === next) return;
    this.issue = next;
    this.notifyStatus();
  }

  private logDev(message: string): void {
    if (import.meta.env.DEV) console.warn(message);
  }

  private clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private ensureConnected(): void {
    if (this.socket !== null || this.retryTimer !== null) return;
    if (this.connecting) return;
    void this.connect();
  }

  /** User-triggered retry: drop the backoff wait and dial immediately. */
  reconnectNow(): void {
    if (this.socket !== null || this.connecting) return;
    this.clearRetryTimer();
    this.retryAttempt = 0;
    void this.connect();
  }

  private async connect(): Promise<void> {
    if (this.connecting) return;
    this.connecting = true;
    try {
      this.setStatus(this.retryAttempt > 0 ? "reconnecting" : "connecting");
      const generation = this.generation;
      const outcome = await fetchTicket();
      if (generation !== this.generation) return;
      if (outcome === "retry") {
        this.scheduleRetry();
        return;
      }
      // "guest" = no session: anonymous sockets still get public channels.
      const ticket = outcome === "guest" ? "" : outcome.ticket;
      const socket = new WebSocket(wsUrl(ticket));
      this.socket = socket;
      socket.onopen = () => {
        this.retryAttempt = 0;
        this.setIssue(null);
        this.setStatus("open");
        this.armWatchdog();
        this.resubscribe();
      };
      socket.onmessage = (event: MessageEvent) => this.handleMessage(event);
      socket.onclose = (event: CloseEvent) => this.handleClose(event);
    } finally {
      this.connecting = false;
    }
  }

  private handleMessage(event: MessageEvent): void {
    const raw = typeof event.data === "string" ? event.data : String(event.data);
    if (raw.length > MAX_FRAME_CHARS) return;
    this.armWatchdog();
    const frame = parseEnvelope(raw);
    if (frame === null) return;
    switch (frame.type) {
      case "ping.v1": this.send("pong.v1"); break;
      case "ready.v1": {
        const ready = frame.data as { heartbeat_seconds?: number };
        const hb = ready.heartbeat_seconds;
        if (
          typeof hb === "number" &&
          Number.isFinite(hb) &&
          hb >= 5 &&
          hb <= 120
        ) {
          this.watchdogMs = hb * 1000 + WATCHDOG_GRACE_MS;
        } else {
          this.watchdogMs = DEFAULT_WATCHDOG_MS;
        }
        break;
      }
      case "event.v1": {
        const channel = frame.data["channel"];
        if (typeof channel === "string") this.dispatch(channel, frame.data);
        break;
      }
      case "unsubscribed.v1": {
        // Server-side revocation: never re-join (a 4403 would drop the socket).
        const channel = frame.data["channel"];
        const revoked = frame.data["reason"] === "ACCESS_REVOKED";
        if (revoked && typeof channel === "string") this.denied.add(channel);
        break;
      }
      case "error.v1": {
        const code = frame.data["code"];
        const channel = frame.data["channel"];
        if (code === "FORBIDDEN" && typeof channel === "string") {
          this.denied.add(channel);
        } else {
          this.setIssue("error");
        }
        this.logDev("[realtime] server error");
        break;
      }
      default:
        break;
    }
  }

  private dispatch(channel: string, data: ServerEnvelope["data"]): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    const payload =
      typeof data["payload"] === "object" && data["payload"] !== null
        ? (data["payload"] as ServerEnvelope["data"])
        : data;
    for (const handler of set) handler(payload);
  }

  private handleClose(event: CloseEvent): void {
    this.socket = null;
    this.clearWatchdog();
    this.connecting = false;
    if (this.manualClose) {
      this.manualClose = false;
      this.setStatus("idle");
      return;
    }
    if (event.code === CLOSE_UNAUTHORIZED) {
      this.retryAttempt = 0;
      this.clearRetryTimer();
      this.setIssue("session");
      this.setStatus("offline");
      this.logDev("[realtime] socket closed while unauthorized");
      return;
    }
    if (event.code === CLOSE_FORBIDDEN) {
      this.setIssue("denied");
      this.setStatus("offline");
      this.logDev("[realtime] socket closed after forbidden response");
      const retryable = [...this.handlers.keys()].some((c) => !this.denied.has(c));
      if (retryable && this.retryTimer === null && this.handlers.size > 0) {
        this.scheduleRetry(MAX_RETRY_MS);
      }
      return;
    }
    if (this.handlers.size === 0) {
      this.setStatus("idle");
      return;
    }
    this.scheduleRetry();
  }

  private scheduleRetry(delayOverride?: number): void {
    const base =
      delayOverride ??
      Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** this.retryAttempt);
    const jitter = 0.5 + Math.random() * 0.5;
    this.retryAttempt += 1;
    this.setStatus("reconnecting");
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.connect();
    }, base * jitter);
  }

  private resubscribe(): void {
    for (const channel of this.handlers.keys()) this.sendSubscribe(channel);
  }

  private sendSubscribe(channel: string): void {
    if (this.denied.has(channel)) return;
    this.send("subscribe.v1", { channel });
  }

  private send(type: string, data: Record<string, unknown> = {}): void {
    if (this.isOpen()) this.socket?.send(JSON.stringify({ type, data }));
  }

  /** Ephemeral typing hint onto a chat:{org} channel; safe when closed. */
  sendTyping(channel: string): void {
    this.send("typing.v1", { channel });
  }

  private armWatchdog(): void {
    this.clearWatchdog();
    const clamped = Math.min(
      MAX_WATCHDOG_MS,
      Math.max(MIN_WATCHDOG_MS, this.watchdogMs),
    );
    this.watchdogTimer = setTimeout(() => {
      this.socket?.close();
    }, clamped);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer !== null) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private teardown(): void {
    this.generation += 1;
    this.clearRetryTimer();
    this.clearWatchdog();
    for (const timer of this.pendingUnsub.values()) clearTimeout(timer);
    this.pendingUnsub.clear();
    this.denied.clear();
    this.retryAttempt = 0;
    this.connecting = false;
    if (this.socket !== null) {
      this.manualClose = true;
      this.socket.close();
      this.socket = null;
    } else {
      this.manualClose = false;
    }
    this.setIssue(null);
    this.setStatus("idle");
  }
}

export const realtime = new RealtimeClient();
