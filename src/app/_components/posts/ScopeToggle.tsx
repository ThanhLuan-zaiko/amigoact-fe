import Link from "next/link";
import { FiUserCheck } from "react-icons/fi";
import { listQuery } from "@/lib/tagLinks";
import { chipButton, chipPressed } from "../ui";

// Narrows the home feed to the organizations the viewer belongs to. It is a link, so
// the address can be shared, and a tag filter stays on when it changes.
export default function ScopeToggle({
  mine,
  tag,
}: {
  mine: boolean;
  tag: string | null;
}) {
  return (
    <Link
      href={`/${listQuery({ scope: mine ? null : "mine", tag })}`}
      aria-pressed={mine}
      className={`${mine ? chipPressed : chipButton} self-start`}
    >
      <FiUserCheck aria-hidden="true" />
      Tổ chức của tôi
    </Link>
  );
}
