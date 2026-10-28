/**
 * Heartbeat watchdog for the realtime socket (see docs/REALTIME.md, item 4).
 * Every inbound frame re-arms it; when it expires, `onExpire` closes the socket.
 * Split from realtime-client.ts so that file stays under the size budget.
 */

const DEFAULT_MS = 40_000;
const GRACE_MS = 15_000;
const MIN_MS = 5_000;
const MAX_MS = 120_000;

type Timer = ReturnType<typeof setTimeout>;

export class Watchdog {
  private timer: Timer | null = null;
  private ms = DEFAULT_MS;
  private readonly onExpire: () => void;

  constructor(onExpire: () => void) {
    this.onExpire = onExpire;
  }

  /** Takes heartbeat_seconds from ready.v1; out-of-range or missing values use the default. */
  setHeartbeat(seconds: number | undefined): void {
    if (
      typeof seconds === "number" &&
      Number.isFinite(seconds) &&
      seconds >= 5 &&
      seconds <= 120
    ) {
      this.ms = seconds * 1000 + GRACE_MS;
    } else {
      this.ms = DEFAULT_MS;
    }
  }

  arm(): void {
    this.clear();
    const clamped = Math.min(MAX_MS, Math.max(MIN_MS, this.ms));
    this.timer = setTimeout(this.onExpire, clamped);
  }

  clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
