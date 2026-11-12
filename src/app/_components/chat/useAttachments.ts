"use client";

import { useEffect, useRef, useState } from "react";
import { ATTACHMENT_MAX } from "@/lib/chat";
import { uploadMessage } from "@/lib/forms";
import { galleryFileError, isVideo } from "@/lib/pictureRules";

export type Draft = {
  key: string;
  name: string;
  kind: "image" | "video";
  preview: string;
  // 0 to 100 while uploading. The asset id arrives when the upload is done.
  progress: number;
  assetId: string | null;
  error: string | null;
};

// The /media/upload route keeps the token in its cookie. XHR, not fetch, so the
// composer can show how far each file is.
function upload(
  file: File,
  onProgress: (percent: number) => void,
): Promise<{ id?: string; error?: string }> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/media/upload");
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      const data = (request.response ?? {}) as { id?: string; code?: string };
      resolve(
        request.status === 201 && data.id
          ? { id: data.id }
          : { error: uploadMessage(data.code ?? "network_error") },
      );
    };
    request.onerror = () => resolve({ error: uploadMessage("network_error") });
    const body = new FormData();
    body.set("file", file);
    request.send(body);
  });
}

// Pictures and videos waiting in the composer. Each starts uploading as soon as it is chosen.
export function useAttachments() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const countRef = useRef(0);
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  });

  // Local previews are freed when the composer goes away.
  useEffect(
    () => () => {
      for (const draft of draftsRef.current) {
        URL.revokeObjectURL(draft.preview);
      }
    },
    [],
  );

  function update(key: string, change: Partial<Draft>) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.key === key ? { ...draft, ...change } : draft,
      ),
    );
  }

  function add(files: File[]) {
    const room = ATTACHMENT_MAX - draftsRef.current.length;
    const problems: string[] = [];
    if (files.length > room) {
      problems.push(`Mỗi tin gửi tối đa ${ATTACHMENT_MAX} ảnh hoặc video.`);
    }
    for (const file of files.slice(0, Math.max(0, room))) {
      const invalid = galleryFileError(file);
      if (invalid) {
        problems.push(`${file.name}: ${invalid}`);
        continue;
      }
      countRef.current += 1;
      const key = `draft-${countRef.current}`;
      const draft: Draft = {
        key,
        name: file.name,
        kind: isVideo(file.type) ? "video" : "image",
        preview: URL.createObjectURL(file),
        progress: 0,
        assetId: null,
        error: null,
      };
      setDrafts((current) => [...current, draft]);
      upload(file, (progress) => update(key, { progress })).then((result) =>
        update(
          key,
          result.id
            ? { assetId: result.id, progress: 100 }
            : { error: result.error ?? uploadMessage("network_error") },
        ),
      );
    }
    setNotice(problems.length > 0 ? problems.join(" ") : null);
  }

  function remove(key: string) {
    setDrafts((current) => {
      const gone = current.find((draft) => draft.key === key);
      if (gone) {
        URL.revokeObjectURL(gone.preview);
      }
      return current.filter((draft) => draft.key !== key);
    });
  }

  function clear() {
    for (const draft of draftsRef.current) {
      URL.revokeObjectURL(draft.preview);
    }
    setDrafts([]);
    setNotice(null);
  }

  const uploading = drafts.some((d) => d.assetId === null && d.error === null);
  const failed = drafts.some((draft) => draft.error !== null);
  const ids = drafts.flatMap((draft) => (draft.assetId ? [draft.assetId] : []));

  return { drafts, notice, uploading, failed, ids, add, remove, clear };
}

export type Attachments = ReturnType<typeof useAttachments>;
