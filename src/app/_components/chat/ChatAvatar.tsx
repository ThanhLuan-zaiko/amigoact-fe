import { FiHash, FiLock } from "react-icons/fi";
import { initials } from "@/lib/organizations";

type ChatAvatarProps = {
  name: string;
  url: string | null;
  // A channel shows its mark instead of a picture, so it reads apart from the general room.
  channel?: "open" | "restricted" | null;
  size?: "sm" | "md";
};

const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
};

// A round picture, or the initials when there is none.
export default function ChatAvatar({
  name,
  url,
  channel = null,
  size = "md",
}: ChatAvatarProps) {
  const box = `flex ${SIZES[size]} shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300`;
  if (channel) {
    const Icon = channel === "restricted" ? FiLock : FiHash;
    return (
      <span aria-hidden="true" className={box}>
        <Icon />
      </span>
    );
  }
  if (url) {
    return (
      <span aria-hidden="true" className={box}>
        {/* biome-ignore lint/performance/noImgElement: served by the media route with the viewer's cookie. */}
        <img src={url} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span aria-hidden="true" className={box}>
      {initials(name) || "?"}
    </span>
  );
}
