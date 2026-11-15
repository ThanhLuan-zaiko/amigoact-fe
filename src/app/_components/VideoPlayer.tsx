"use client";

import { useEffect, useRef } from "react";
import { ME } from "@/lib/realtime";
import {
  isWaiting,
  VIDEO_EVENT,
  type VideoInfo,
  videoSources,
} from "@/lib/video";
import { useLiveRefresh } from "./realtime/hooks";

const HLS_TYPE = "application/vnd.apple.mpegurl";

// An uploaded video. Once transcoded it streams over HLS, so a weak connection
// drops to a smaller copy instead of stalling: hls.js is loaded on demand, and
// browsers without Media Source Extensions (older iOS) use their own HLS.
// Anything that cannot stream plays the 720p MP4.
// While the video is still being transcoded the upload plays, and the page
// refreshes itself when the worker reports the copies are ready.
export default function VideoPlayer({
  id,
  info,
  className,
}: {
  id: string;
  info?: VideoInfo | null;
  className: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { mp4, hls, poster } = videoSources(id, info);
  useLiveRefresh(isWaiting(info) ? ME : null, [VIDEO_EVENT]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !hls) {
      return;
    }
    // Any failure of the stream falls back to the MP4 copy, once.
    const fallBack = () => {
      if (video.src !== new URL(mp4, window.location.href).href) {
        video.src = mp4;
      }
    };
    let stopped = false;
    let player: { destroy: () => void } | null = null;
    import("hls.js")
      .then(({ default: Hls }) => {
        if (stopped) {
          return;
        }
        // hls.js comes first: some Chromium builds answer "maybe" for native HLS
        // and then fail to play fMP4 segments. Native HLS is for Safari on iOS.
        if (!Hls.isSupported()) {
          if (video.canPlayType(HLS_TYPE)) {
            video.addEventListener("error", fallBack, { once: true });
            video.src = hls;
          } else {
            fallBack();
          }
          return;
        }
        const stream = new Hls({ capLevelToPlayerSize: true });
        stream.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            stream.destroy();
            player = null;
            fallBack();
          }
        });
        stream.loadSource(hls);
        stream.attachMedia(video);
        player = stream;
      })
      .catch(() => {
        if (!stopped) {
          fallBack();
        }
      });
    return () => {
      stopped = true;
      player?.destroy();
    };
  }, [hls, mp4]);

  return (
    // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
    <video
      ref={ref}
      src={hls ? undefined : mp4}
      poster={poster ?? undefined}
      controls
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
