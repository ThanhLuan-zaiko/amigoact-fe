// Transcoded videos (see the backend docs/media.md). Until a video is ready, the
// original upload plays. Once ready it has MP4 copies at 480p/720p/1080p, a poster
// frame, and for longer videos an HLS stream that adapts to the connection.

export type VideoStatus = "pending" | "processing" | "ready" | "failed";

export type VideoInfo = {
  status: VideoStatus;
  qualities: number[];
  hls: boolean;
  poster: boolean;
  duration: number | null;
};

const STATUSES: readonly string[] = [
  "pending",
  "processing",
  "ready",
  "failed",
];
const QUALITY = /^[1-9][0-9]{2,3}$/;
const HLS_FILE =
  /^(?:master\.m3u8|r\d{3,4}\/(?:index\.m3u8|init\.mp4|seg\d{5}\.m4s))$/;

export const VIDEO_EVENT = "media.video";

// Reads the API body, dropping anything malformed. Older videos read as pending.
export function asVideoInfo(value: unknown): VideoInfo | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const raw = value as Record<string, unknown>;
  const status =
    typeof raw.status === "string" && STATUSES.includes(raw.status)
      ? (raw.status as VideoStatus)
      : "pending";
  const qualities = Array.isArray(raw.qualities)
    ? raw.qualities.filter((q): q is number => Number.isInteger(q))
    : [];
  return {
    status,
    qualities,
    hls: raw.hls === true,
    poster: raw.poster === true,
    duration: typeof raw.duration === "number" ? raw.duration : null,
  };
}

// ?q= for /media/[id]/video: a plain whole number from 144 to 2160.
export function parseQuality(raw: string | null): number | null {
  if (raw === null || !QUALITY.test(raw)) {
    return null;
  }
  const value = Number(raw);
  return value >= 144 && value <= 2160 ? value : null;
}

// The catch-all segments of /media/[id]/hls/..., if they name a stream file.
export function hlsFileName(parts: readonly string[]): string | null {
  const name = parts.join("/");
  return HLS_FILE.test(name) ? name : null;
}

export function isWaiting(info: VideoInfo | null | undefined): boolean {
  return info?.status === "pending" || info?.status === "processing";
}

// Where a player loads from. `mp4` always works: it is the 720p copy when ready,
// otherwise the upload. `hls` is set only when the stream exists.
export function videoSources(
  id: string,
  info: VideoInfo | null | undefined,
): { mp4: string; hls: string | null; poster: string | null } {
  const base = `/media/${id}`;
  const ready = info?.status === "ready";
  return {
    mp4: `${base}/video`,
    hls: ready && info?.hls ? `${base}/hls/master.m3u8` : null,
    poster: ready && info?.poster ? `${base}/poster?w=1080` : null,
  };
}

// Chat attachments carry the upload URL. Its /video sibling plays the 720p copy
// once ready, and the upload until then.
export function transcodedUrl(fileUrl: string): string {
  return /^\/media\/[0-9a-f-]{36}\/file$/i.test(fileUrl)
    ? fileUrl.replace(/\/file$/, "/video")
    : fileUrl;
}
