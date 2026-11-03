import { authedFetch } from "@/lib/auth";

// Gallery files can be 50 MB, too large for a Server Action, so each one comes here.
// The browser still never talks to the backend, and the token stays in the cookie.
export async function POST(request: Request) {
  // A cookie alone must not let another site upload in the user's name.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return Response.json({ code: "forbidden" }, { status: 403 });
  }

  let file: FormDataEntryValue | null;
  try {
    file = (await request.formData()).get("file");
  } catch {
    return Response.json({ code: "file_too_large" }, { status: 413 });
  }
  if (!(file instanceof File)) {
    return Response.json({ code: "file_empty" }, { status: 400 });
  }

  const upload = new FormData();
  upload.set("file", file);
  const result = await authedFetch<{ id: string }>("/media", { form: upload });
  return result.ok
    ? Response.json({ id: result.data.id }, { status: 201 })
    : Response.json({ code: result.code }, { status: result.status });
}
