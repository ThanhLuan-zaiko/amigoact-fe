import "server-only";
import type { FormState } from "./account";
import { authedFetch } from "./auth";
import { failureState } from "./forms";

export type PictureField = "logo" | "cover";

export type PictureChange =
  | { ok: true; assetId: string | null | undefined }
  | { ok: false; state: FormState };

// Reads one picture field of a submitted organization form.
// - A chosen file is uploaded to POST /media, and its asset id is returned.
// - The "remove" checkbox returns null, which clears the picture.
// - Neither returns undefined. JSON leaves that key out, so the picture stays as it is.
export async function readPicture(
  formData: FormData,
  field: PictureField,
): Promise<PictureChange> {
  const file = formData.get(field);
  if (file instanceof File && file.size > 0) {
    const upload = new FormData();
    upload.set("file", file);
    const result = await authedFetch<{ id: string }>("/media", {
      form: upload,
    });
    if (!result.ok) {
      return {
        ok: false,
        state: failureState(result.code, result.issues),
      };
    }
    return { ok: true, assetId: result.data.id };
  }
  const remove = formData.get(`remove_${field}`) === "on";
  return { ok: true, assetId: remove ? null : undefined };
}
