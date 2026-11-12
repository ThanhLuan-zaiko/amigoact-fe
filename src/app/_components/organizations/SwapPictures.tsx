"use client";

import { useState, useTransition } from "react";
import { FiRepeat } from "react-icons/fi";
import { chooseOrgPictures } from "@/app/_actions/organizations";
import { assetIdFromUrl } from "@/lib/pictureRules";
import { chipButton } from "../ui";

// Swaps the saved logo and cover in one click. It sits inside the settings form,
// so it runs the action itself instead of being a form of its own.
export default function SwapPictures({
  slug,
  logoUrl,
  coverUrl,
}: {
  slug: string;
  logoUrl: string | null;
  coverUrl: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const logo = assetIdFromUrl(logoUrl);
  const cover = assetIdFromUrl(coverUrl);
  if (!logo || !cover) {
    return null;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const state = await chooseOrgPictures(slug, {
              logo: cover,
              cover: logo,
            });
            setError(state.error);
          })
        }
        className={`${chipButton} disabled:opacity-50`}
      >
        <FiRepeat aria-hidden="true" />
        {pending ? "Đang đổi…" : "Đổi chỗ logo và ảnh bìa"}
      </button>
      {error ? (
        <span className="text-xs font-semibold text-red-700 dark:text-red-400">
          {error}
        </span>
      ) : null}
    </div>
  );
}
