import type { ReactElement } from "react";
import { FiUsers } from "react-icons/fi";
import { apiBaseUrl } from "../../core/api.ts";
import type { PublicOrg } from "../api.ts";

interface OrgLogoProps {
  org: Pick<PublicOrg, "name" | "logo_url">;
  className?: string;
  iconClassName?: string;
}

export function OrgLogo({
  org,
  className = "h-12 w-12",
  iconClassName = "h-5 w-5",
}: OrgLogoProps): ReactElement {
  const src = org.logo_url ? `${apiBaseUrl()}${org.logo_url}` : null;
  if (src !== null) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className={
          `${className} rounded-full border border-zinc-200 bg-white ` +
          "object-cover dark:border-zinc-800 dark:bg-zinc-900"
        }
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={
        `${className} flex items-center justify-center rounded-full ` +
        "border border-zinc-300 bg-zinc-100 text-zinc-700 " +
        "dark:border-zinc-700 dark:text-zinc-300"
      }
    >
      <FiUsers className={iconClassName} />
    </span>
  );
}
