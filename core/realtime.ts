import { ApiError, apiBaseUrl, apiFetch } from "./api.ts";

/**
 * Single WebSocket client for the whole app (AGENTS.md 12.1).
 *
 * Contract mirrors backend AGENTS.md 16: the client mints a one-time
 * ticket via POST /ws/tickets, opens /ws?ticket=..., answers server
 * heartbeat ping.v1 with pong.v1, and speaks {"type","data"} envelopes.
 * TanStack Query stays the source of truth: consumers only invalidate
 * query keys or apply narrow deltas inside channel handlers.
 */

export type RealtimeStatus = "idle" | "connecting" | "open" | "reconnecting" | "offline";

export interface ServerEnvelope {
  type: string;
  data: Record<string, unknown>;
}

export type ChannelHandler = (data: ServerEnvelope["data"]) => void;
export type StatusHandler = (status: RealtimeStatus) => void;

const WS_PATH = "/ws";
const TICKETS_PATH = "/ws/tickets";

const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_FORBIDDEN = 4403;

const BASE_RETRY_MS = 500;
const MAX_RETRY_MS = 15_000;
const DEFAULT_WATCHDOG_MS = 40_000;
const WATCHDOG_GRACE_MS = 15_000;
const MIN_WATCHDOG_MS = 5_000;
const MAX_WATCHDOG_MS = 120_000;
const MAX_FRAME_CHARS = 1_000_000;

interface WsTicket { ticket: string; expires_in: number; }

interface ReadyData { heartbeat_seconds?: number; }

export function notificationsChannel(userId: string): string {
  return `notifications:${userId}`;
}

export function attendanceChannel(activityId: string): string {
  return `attendance:${activityId}`;
}

export function activitiesChannel(orgId: string): string {
  return `activities:${orgId}`;
}

function wsUrl(ticket: string): string {
  const url = new URL(apiBaseUrl());
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  // Keep ticket in query per backend contract. Never log the returned URL.
  const basePath = url.pathname.replace(/\/+$/, "");
  url.pathname = `${basePath}${WS_PATH}`;
  url.search = `?ticket=${encodeURIComponent(ticket)}`;
  return url.toString();
}

class RealtimeClient {
  private socket: WebSocket | null = null;
  private readonly handlers = new Map<string, Set<ChannelHandler>>();
  private readonly denied = new Set<string>();
  private readonly statusHandlers = new Set<StatusHandler>();
  private status: RealtimeStatus = "idle";
  private retryAttempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdogMs = DEFAULT_WATCHDOG_MS;
  private manualClose = false;
  private connecting = false;
  private connectPromise: Promise<void> | null = null;

  getStatus(): RealtimeStatus { return this.status; }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => {
      this.statusHandlers.delete(handler);
      this.maybeTeardown();
    };
  }

  subscribe(channel: string, handler: ChannelHandler): () => void {
    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
    }
    set.add(handler);
    if (!this.denied.has(channel)) {
      this.ensureConnected();
      if (this.isOpen()) this.sendSubscribe(channel);
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
      if (this.isOpen()) this.send("unsubscribe.v1", { channel });
    }
    this.maybeTeardown();
  }

  private maybeTeardown(): void {
    if (this.handlers.size === 0 && this.statusHandlers.size === 0) this.teardown();
  }

  private isOpen(): boolean { return this.socket?.readyState === WebSocket.OPEN; }

  private setStatus(next: RealtimeStatus): void {
    if (this.status === next) return;
    this.status = next;
    for (const handler of this.statusHandlers) handler(next);
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
    this.connectPromise = this.connect();
    void this.connectPromise;
  }

  private async connect(): Promise<void> {
    if (this.connecting) return;
    this.connecting = true;
    try {
      this.setStatus(this.retryAttempt > 0 ? "reconnecting" : "connecting");
      let ticket: WsTicket;
      try {
        ticket = await apiFetch<WsTicket>(TICKETS_PATH, { method: "POST" });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          this.setStatus("offline");
          return;
        }
        this.scheduleRetry();
        return;
      }
      const socket = new WebSocket(wsUrl(ticket.ticket));
      this.socket = socket;
      socket.onopen = () => {
        this.retryAttempt = 0;
        this.setStatus("open");
        this.armWatchdog();
        this.resubscribe();
      };
      socket.onmessage = (event: MessageEvent) => this.handleMessage(event);
      socket.onclose = (event: CloseEvent) => this.handleClose(event);
    } finally {
      this.connecting = false;
      this.connectPromise = null;
    }
  }

  private handleMessage(event: MessageEvent): void {
    const raw = typeof event.data === "string" ? event.data : String(event.data);
    if (raw.length > MAX_FRAME_CHARS) return;
    this.armWatchdog();
    let frame: ServerEnvelope;
    try {
      frame = JSON.parse(raw) as ServerEnvelope;
    } catch {
      return;
    }
    if (typeof frame !== "object" || frame === null) return;
    if (typeof frame.type !== "string") return;
    if (frame.data === null || typeof frame.data !== "object") return;
    switch (frame.type) {
      case "ping.v1":
        this.send("pong.v1");
        break;
      case "ready.v1": {
        const ready = frame.data as ReadyData;
        const hb = ready.heartbeat_seconds;
        if (typeof hb === "number" && Number.isFinite(hb) && hb >= 5 && hb <= 120) {
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
      case "error.v1": {
        const code = frame.data["code"];
        const channel = frame.data["channel"];
        if (code === "FORBIDDEN" && typeof channel === "string") {
          this.denied.add(channel);
        }
        // TODO: Surface connection issues via a Feedback banner.
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
    this.connectPromise = null;
    if (this.manualClose) {
      this.manualClose = false;
      this.setStatus("idle");
      return;
    }
    if (event.code === CLOSE_UNAUTHORIZED) {
      this.retryAttempt = 0;
      this.clearRetryTimer();
      this.setStatus("offline");
      // TODO: Surface expired session via a Feedback banner.
      this.logDev("[realtime] socket closed while unauthorized");
      return;
    }
    if (event.code === CLOSE_FORBIDDEN) {
      this.setStatus("offline");
      // TODO: Surface denied access via a Feedback banner.
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
      delayOverride ?? Math.min(MAX_RETRY_MS, BASE_RETRY_MS * 2 ** this.retryAttempt);
    const jitter = 0.5 + Math.random() * 0.5;
    this.retryAttempt += 1;
    this.setStatus("reconnecting");
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.connect();
    }, base * jitter);
  }

  private resubscribe(): void {
    for (const channel of this.handlers.keys()) {
      if (!this.denied.has(channel)) this.sendSubscribe(channel);
    }
  }

  private sendSubscribe(channel: string): void {
    if (this.denied.has(channel)) return;
    this.send("subscribe.v1", { channel });
  }

  private send(type: string, data: Record<string, unknown> = {}): void {
    if (this.isOpen()) {
      this.socket?.send(JSON.stringify({ type, data }));
    }
  }

  private armWatchdog(): void {
    this.clearWatchdog();
    const clamped = Math.min(MAX_WATCHDOG_MS, Math.max(MIN_WATCHDOG_MS, this.watchdogMs));
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
    this.clearRetryTimer();
    this.clearWatchdog();
    this.denied.clear();
    this.retryAttempt = 0;
    this.connecting = false;
    this.connectPromise = null;
    if (this.socket !== null) {
      this.manualClose = true;
      this.socket.close();
      this.socket = null;
    } else {
      this.manualClose = false;
    }
    this.setStatus("idle");
  }
}

export const realtime = new RealtimeClient();

export function subscribeChannel(channel: string, handler: ChannelHandler): () => void {
  return realtime.subscribe(channel, handler);
}

export function onRealtimeStatus(handler: StatusHandler): () => void {
  return realtime.onStatus(handler);
}
