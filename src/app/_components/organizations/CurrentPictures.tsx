import type { IconType } from "react-icons";
import { FiAward, FiImage } from "react-icons/fi";

export type PictureRole = "logo" | "cover";

export const ROLE_LABEL: Record<PictureRole, string> = {
  logo: "Logo",
  cover: "Ảnh bìa",
};

const ROLE_ICON: Record<PictureRole, IconType> = {
  logo: FiAward,
  cover: FiImage,
};

type CurrentPicturesProps = {
  urls: Record<PictureRole, string | null>;
  // A role with a newly chosen picture replaces the current one.
  replaced: Record<PictureRole, boolean>;
};

const ROLES: PictureRole[] = ["logo", "cover"];

// Saved logo and cover of an organization being edited, each marked with its
// role. Changing them is one click: swap them, or pick a gallery picture.
export default function CurrentPictures({
  urls,
  replaced,
}: CurrentPicturesProps) {
  return ROLES.map((role) => {
    const url = urls[role];
    if (!url) {
      return null;
    }
    const Icon = ROLE_ICON[role];
    return (
      <div
        key={role}
        className="flex items-center gap-3 border-b border-slate-200 pb-3 dark:border-slate-800"
      >
        {/* biome-ignore lint/performance/noImgElement: same-origin proxy path. */}
        <img
          src={url}
          alt={ROLE_LABEL[role]}
          className="h-14 w-14 rounded-md border border-slate-200 object-cover dark:border-slate-800"
        />
        <span className="inline-flex items-center gap-1 rounded-sm border border-teal-700 bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400">
          <Icon aria-hidden="true" />
          {ROLE_LABEL[role]}
        </span>
        {replaced[role] ? (
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Sẽ được thay khi lưu
          </span>
        ) : null}
      </div>
    );
  });
}
