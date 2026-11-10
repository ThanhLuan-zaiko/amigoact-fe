import { uploadMessage } from "@/lib/forms";

export // Each file goes to POST /media/upload, which returns its asset id.
async function uploadFile(
  file: File,
): Promise<{ id?: string; error?: string }> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/media/upload", { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: uploadMessage(data.code ?? "network_error") };
  }
  return { id: data.id };
}
