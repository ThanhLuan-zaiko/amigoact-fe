"use server";

import { authedFetch } from "@/lib/auth";
import { asFocus, type Focus } from "@/lib/focus";
import { isPictureId } from "@/lib/pictureRules";

export type FocusResult =
  | { ok: true; focus: Focus }
  | { ok: false; message: string };

const FAILED = "Không lưu được điểm lấy nét. Vui lòng thử lại.";
const NOT_UPLOADER = "Chỉ người tải ảnh này lên mới đổi được điểm lấy nét.";

// Moves the spot that crops of an uploaded picture keep in view. Only the uploader
// may do this; the backend answers 404 for anyone else.
export async function setMediaFocus(
  assetId: string,
  point: Focus,
): Promise<FocusResult> {
  const valid = asFocus(point);
  if (!isPictureId(assetId) || valid === null) {
    return { ok: false, message: FAILED };
  }
  try {
    const result = await authedFetch<{ focus?: unknown }>(
      `/media/${assetId}/focus`,
      { method: "PUT", body: valid },
    );
    if (!result.ok) {
      return {
        ok: false,
        message: result.status === 404 ? NOT_UPLOADER : FAILED,
      };
    }
    const focus = asFocus(result.data.focus);
    return focus ? { ok: true, focus } : { ok: false, message: FAILED };
  } catch {
    return { ok: false, message: FAILED };
  }
}
