import { useState, type ReactElement } from "react";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { lookupStudentCode } from "../structure-api.ts";
import { useCampuses } from "../structure-hooks.ts";

interface StudentLookupProps {
  orgId: string;
  onPick: (userId: string) => void;
}

/** Manager resolves a student code (per campus) into a user id. */
export function StudentLookup({
  orgId,
  onPick,
}: StudentLookupProps): ReactElement {
  const campuses = useCampuses(orgId);
  const [campusId, setCampusId] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "found" | "missing">(
    "idle",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const search = async (): Promise<void> => {
    setError("");
    setStatus("idle");
    if (!code.trim()) {
      setError("Nhập mã sinh viên.");
      return;
    }
    setBusy(true);
    try {
      const hit = await lookupStudentCode(
        orgId,
        code.trim(),
        campusId || undefined,
      );
      if (hit.user_id) {
        setResult(hit.user_id);
        setStatus("found");
      } else {
        setResult(null);
        setStatus("missing");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Có lỗi xảy ra.",
      );
    } finally {
      setBusy(false);
    }
  };

  const options = (campuses.data ?? [])
    .filter((c) => c.status === "active")
    .map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="rounded-xl border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
      <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Tra cứu theo mã sinh viên
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <SelectField
          label="Cơ sở"
          name="lookup-campus"
          value={campusId}
          onChange={setCampusId}
          options={[
            { value: "", label: "Tất cả cơ sở" },
            ...options,
          ]}
        />
        <TextField
          label="Mã sinh viên"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SV123456"
        />
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => void search()}
          icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
        >
          Tra cứu
        </Button>
      </div>
      {status === "found" && result && (
        <p
          role="status"
          className="mt-2 flex flex-wrap items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
        >
          Tìm thấy user <code className="text-xs">{result}</code>
          <Button
            variant="secondary"
            onClick={() => onPick(result)}
            icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Dùng ID này
          </Button>
        </p>
      )}
      {status === "missing" && (
        <p role="status" className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Không tìm thấy sinh viên với mã này.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
