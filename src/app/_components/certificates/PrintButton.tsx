"use client";

import { FiPrinter } from "react-icons/fi";
import { iconButton } from "../ui";

// Opens the browser's print dialog. A PDF of the certificate is not built yet.
export default function PrintButton() {
  return (
    <button
      type="button"
      aria-label="In"
      title="In"
      onClick={() => window.print()}
      className={`${iconButton} print:hidden`}
    >
      <FiPrinter aria-hidden="true" />
    </button>
  );
}
