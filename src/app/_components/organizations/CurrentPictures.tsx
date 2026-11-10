export type PictureRole = "logo" | "cover";

export const ROLE_LABEL: Record<PictureRole, string> = {
  logo: "Logo",
  cover: "Ảnh bìa",
};

type CurrentPicturesProps = {
  urls: Record<PictureRole, string | null>;
  // A role with a newly chosen picture replaces the current one.
  replaced: Record<PictureRole, boolean>;
  removed: Record<PictureRole, boolean>;
  onRemoveChange: (role: PictureRole, checked: boolean) => void;
};

const ROLES: PictureRole[] = ["logo", "cover"];

// Saved logo and cover of an organization being edited, each with a remove checkbox.
export default function CurrentPictures({
  urls,
  replaced,
  removed,
  onRemoveChange,
}: CurrentPicturesProps) {
  return ROLES.map((role) => {
    const url = urls[role];
    if (!url) {
      return null;
    }
    let note = "";
    if (replaced[role]) {
      note = " (sẽ được thay)";
    } else if (removed[role]) {
      note = " (sẽ gỡ)";
    }
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
        <span className="min-w-0 flex-1 text-sm text-slate-700 dark:text-slate-300">
          {ROLE_LABEL[role]} hiện tại
          {note}
        </span>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={removed[role]}
            onChange={(event) =>
              onRemoveChange(role, event.currentTarget.checked)
            }
            className="h-4 w-4 accent-teal-700 dark:accent-teal-400"
          />
          Gỡ
        </label>
      </div>
    );
  });
}
