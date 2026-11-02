"use client";

import { FiRefreshCw } from "react-icons/fi";
import {
  mutedText,
  panel,
  primaryButton,
  sectionTitle,
} from "../_components/ui";

export default function AppError({ retry }: { retry: () => void }) {
  return (
    <section className={`${panel} flex flex-col items-start gap-3 p-4 sm:p-6`}>
      <h1 className={sectionTitle}>Không tải được trang này</h1>
      <p className={mutedText}>
        Máy chủ đang gặp sự cố hoặc không kết nối được. Vui lòng thử lại.
      </p>
      <button type="button" onClick={() => retry()} className={primaryButton}>
        <FiRefreshCw aria-hidden="true" />
        Thử lại
      </button>
    </section>
  );
}
