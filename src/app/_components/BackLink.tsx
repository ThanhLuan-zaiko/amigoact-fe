"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { hasEarlierPage } from "@/lib/back";
import { iconButton } from "./ui";

// The one back arrow of the app. A click returns to the page the viewer came from. The
// href is the fallback for a tab with no earlier page, and it still works without
// JavaScript, so pages pass the parent address they want when there is no history.
export default function BackLink({ href }: { href: string }) {
  const router = useRouter();
  function goBack(event: MouseEvent<HTMLAnchorElement>) {
    if (hasEarlierPage(window.history.length)) {
      event.preventDefault();
      router.back();
    }
  }
  return (
    <Link
      href={href}
      onClick={goBack}
      aria-label="Quay lại"
      title="Quay lại"
      className={iconButton}
    >
      <FiArrowLeft aria-hidden="true" />
    </Link>
  );
}
