"use client";

import { FiAward, FiImage } from "react-icons/fi";
import { chooseOrgPictures } from "@/app/_actions/organizations";
import { iconButton } from "../ui";
import ActionButton from "./ActionButton";

const chosen =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-teal-700 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400";

// One click makes a gallery picture the logo or the cover. The button of the
// role the picture already holds is tinted.
export default function GalleryRoleButtons({
  slug,
  assetId,
  isLogo,
  isCover,
}: {
  slug: string;
  assetId: string;
  isLogo: boolean;
  isCover: boolean;
}) {
  return (
    <>
      <ActionButton
        action={chooseOrgPictures.bind(null, slug, { logo: assetId })}
        label={isLogo ? "Đang là logo" : "Đặt làm logo"}
        className={isLogo ? chosen : iconButton}
      >
        <FiAward aria-hidden="true" />
      </ActionButton>
      <ActionButton
        action={chooseOrgPictures.bind(null, slug, { cover: assetId })}
        label={isCover ? "Đang là ảnh bìa" : "Đặt làm ảnh bìa"}
        className={isCover ? chosen : iconButton}
      >
        <FiImage aria-hidden="true" />
      </ActionButton>
    </>
  );
}
