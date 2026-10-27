const SHARE =
  /^Luồng: ([^\n]{1,80})\n\/manage\/chat\?room=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

// Wire format of a shared sub-thread message; the card that renders it
// lives in ChatThreadShareCard.tsx.
export function threadShareBody(roomId: string, name: string): string {
  return `Luồng: ${name}\n/manage/chat?room=${roomId}`;
}

export function parseThreadShare(
  body: string,
): { roomId: string; name: string } | null {
  const match = body.match(SHARE);
  if (match === null) return null;
  return { name: match[1], roomId: match[2] };
}
