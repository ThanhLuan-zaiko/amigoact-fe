import { useState, type ReactElement } from "react";
import { FiPlus, FiTag } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";

interface CategoryCreatorProps {
  onCreate: (input: { name: string; slug: string }) => Promise<unknown>;
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Inline creator for org-scoped categories: the activity form's select
// picks it up once the categories query invalidates on success.
export function CategoryCreator({
  onCreate,
}: CategoryCreatorProps): ReactElement {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const create = async (): Promise<void> => {
    setError("");
    setBusy(true);
    try {
      await onCreate({ name: name.trim(), slug: slugify(name) });
      setName("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiTag className="h-4 w-4" aria-hidden="true" /> Danh mục mới
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <TextField
          label="Tên danh mục"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Môi trường"
        />
        <div className="self-end sm:col-span-2">
          <Button
            variant="secondary"
            disabled={busy || name.trim().length < 2}
            onClick={() => void create()}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
          >
            {busy ? "Đang tạo…" : "Tạo danh mục"}
          </Button>
        </div>
      </div>
    </div>
  );
}
