import { useState, type ReactElement } from "react";
import { FiPlus } from "react-icons/fi";
import type { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import { useCreateMyTag } from "../tags-hooks.ts";

function createError(code: string): string {
  if (code === "TAG_EXISTS") return "Bạn đã có thẻ này.";
  return toVietnameseTagMessage(code);
}

// A tag is only a name here. Posts pick it up later on the board.
export function TagCreateForm(): ReactElement {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const create = useCreateMyTag();

  function submit(): void {
    const trimmed = name.trim();
    if (!trimmed || create.isPending) return;
    setError("");
    create.mutate(
      { name: trimmed },
      {
        onSuccess: () => setName(""),
        onError: (err: ApiError) => setError(createError(err.code)),
      },
    );
  }

  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="min-w-0 flex-1">
        <TextField
          label="Tên thẻ"
          hideLabel
          placeholder="Tên thẻ"
          maxLength={40}
          value={name}
          autoComplete="off"
          onChange={(event) => setName(event.target.value)}
          error={error || undefined}
          hint="Chỉ cần một cái tên. Khi viết bài, chọn thẻ này để gắn vào bài."
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={!name.trim() || create.isPending}
        icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
      >
        Thêm thẻ
      </Button>
    </form>
  );
}
