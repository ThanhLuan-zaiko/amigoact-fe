import { useState } from "react";
import type { ReactElement } from "react";
import QRCode from "react-qr-code";
import { FiCheck, FiCopy, FiShare2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

interface ChatShareCardProps {
  // Public slug of the room's org; empty hides the card entirely.
  orgSlug: string;
  orgName: string;
}

// Community share card inside the room info drawer: the public org link
// (/orgs/:slug) with a copy button and a scannable QR for offline shares.
export function ChatShareCard({
  orgSlug,
  orgName,
}: ChatShareCardProps): ReactElement | null {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  if (orgSlug === "") return null;

  const href = `${window.location.origin}/orgs/${orgSlug}`;

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      /* clipboard unavailable (permissions, http) - keep the href visible */
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
        {orgName}
      </p>
      <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
        {href}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => void copy()}
          icon={
            copied ? (
              <FiCheck className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiCopy className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          {copied ? "Đã sao chép" : "Sao chép link"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowQr((v) => !v)}
          aria-expanded={showQr}
          icon={<FiShare2 className="h-4 w-4" aria-hidden="true" />}
        >
          Mã QR
        </Button>
      </div>
      {showQr && (
        <div className="mt-3 flex justify-center rounded-xl bg-white p-4">
          <QRCode
            value={href}
            size={160}
            aria-label={`Mã QR tới trang cộng đồng ${orgName}`}
          />
        </div>
      )}
    </div>
  );
}
