/**
 * App-wide toast store (AGENTS.md 12.5: realtime/mutation feedback toasts).
 *
 * A tiny external store consumed by `ToastViewport` via useSyncExternalStore,
 * so pushToast() works from anywhere: components, mutation callbacks, and
 * realtime channel handlers (which are not React code). Vietnamese copy is
 * built by callers in .tsx modules; this file stays ASCII-only.
 */

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  message?: string;
  durationMs: number;
}

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  message?: string;
  durationMs?: number;
}

export const DEFAULT_TOAST_MS = 4500;
export const ERROR_TOAST_MS = 6000;
const MAX_TOASTS = 4;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getToasts(): Toast[] {
  return toasts;
}

export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(input: ToastInput): number {
  const id = nextId;
  nextId += 1;
  const tone = input.tone ?? "info";
  const toast: Toast = {
    id,
    tone,
    title: input.title,
    message: input.message,
    durationMs: input.durationMs ?? (tone === "error" ? ERROR_TOAST_MS : DEFAULT_TOAST_MS),
  };
  // Cap the stack: drop the oldest toast once the queue is full.
  toasts = [...toasts, toast].slice(-MAX_TOASTS);
  emit();
  return id;
}

export function dismissToast(id: number): void {
  const next = toasts.filter((toast) => toast.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}
