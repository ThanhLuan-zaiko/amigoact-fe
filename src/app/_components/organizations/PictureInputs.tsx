import type { PictureRole } from "./CurrentPictures";

// The hidden fields PicturePicker sends with the organization form.
// Pictures not marked as logo or cover travel as "extra_picture_id" and the
// action adds them to the gallery.
export default function PictureInputs({
  ids,
  picked,
}: {
  ids: string[];
  picked: Record<PictureRole, string | null>;
}) {
  return (
    <>
      {ids
        .filter((id) => id !== picked.logo && id !== picked.cover)
        .map((id) => (
          <input key={id} type="hidden" name="extra_picture_id" value={id} />
        ))}
      {picked.logo ? (
        <input type="hidden" name="logo_asset_id" value={picked.logo} />
      ) : null}
      {picked.cover ? (
        <input type="hidden" name="cover_asset_id" value={picked.cover} />
      ) : null}
    </>
  );
}
