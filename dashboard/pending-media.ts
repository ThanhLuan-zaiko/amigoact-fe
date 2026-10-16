import { useState } from "react";
import { assignMediaRole } from "./schemas.ts";
import type { PendingMedia } from "./schemas.ts";

export function usePendingMedia() {
  const [pendingFiles, setPendingFiles] = useState<PendingMedia[]>([]);
  return {
    pendingFiles,
    clear: () => setPendingFiles([]),
    add: (picked: { file: File; decodable: boolean }[]) =>
      setPendingFiles((prev) => [
        ...prev,
        ...picked.map(({ file, decodable }) => ({
          file,
          role: "gallery" as const,
          cropped: false,
          decodable,
        })),
      ]),
    remove: (index: number) =>
      setPendingFiles((prev) => prev.filter((_, i) => i !== index)),
    setRole: (index: number, role: PendingMedia["role"]) =>
      setPendingFiles((prev) => assignMediaRole(prev, index, role)),
    applyCrop: (index: number, file: File) =>
      setPendingFiles((prev) =>
        prev.map((item, i) => (i === index ? { ...item, file, cropped: true } : item)),
      ),
  };
}
