import { useState, type ReactElement } from "react";
import { FiCheckCircle, FiSearch, FiXCircle } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import { TextField } from "../core/components/TextField.tsx";
import { formatDateTime } from "../activities/dates.tsx";
import { verifyCertificate, type VerifyResult } from "./api.ts";
import {
  CERTIFICATE_STATUS_LABELS,
  toVietnameseCertificateError,
} from "./messages.tsx";

export function VerifyCertificatePage(): ReactElement {
  const [serial, setSerial] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const verify = async (): Promise<void> => {
    setError("");
    setResult(null);
    const code = serial.trim();
    if (!code) {
      setError("Nhập mã chứng nhận cần kiểm tra.");
      return;
    }
    setBusy(true);
    try {
      setResult(await verifyCertificate(code));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? toVietnameseCertificateError(err.code, err.message)
          : "Có lỗi xảy ra.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <BentoCard className="md:col-span-6 lg:col-span-8 lg:col-start-3">
      <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
        Xác thực chứng nhận
      </h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Nhập mã serial in trên chứng nhận để kiểm tra tính hợp lệ.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <TextField
          label="Mã serial"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="AMG-2026-XXXXXXXX"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") void verify();
          }}
        />
        <Button
          disabled={busy}
          onClick={() => void verify()}
          icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
        >
          Kiểm tra
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <div
          role="status"
          className={`mt-4 rounded-xl border p-4 ${
            result.status === "issued"
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
              : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
          }`}
        >
          <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
            {result.status === "issued" ? (
              <FiCheckCircle
                className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            ) : (
              <FiXCircle
                className="h-5 w-5 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            )}
            {CERTIFICATE_STATUS_LABELS[result.status] ?? result.status}
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-500">Hoạt động</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {result.activity_title || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Sinh viên</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {result.student_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Serial</dt>
              <dd className="font-mono text-zinc-900 dark:text-zinc-100">
                {result.serial_no}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Ngày cấp</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                {result.issued_at
                  ? formatDateTime(result.issued_at)
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </BentoCard>
  );
}
