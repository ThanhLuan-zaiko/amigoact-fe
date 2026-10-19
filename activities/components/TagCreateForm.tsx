import { useState, type ReactElement } from "react";
import { FiPlus } from "react-icons/fi";
import type { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { toVietnameseTagMessage } from "../messages.tsx";
import { useCreateOrgTag } from "../tags-hooks.ts";

export function TagCreateForm({
  orgId,
}: {
  orgId: string;
}): ReactElement {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const create = useCreateOrgTag(orgId);
  return (
    <form
      className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        create.mutate(
          { name },
          {
            onSuccess: () => setName(""),
            onError: (err: ApiError) =>
              setError(toVietnameseTagMessage(err.code)),
          },
        );
      }}
    >
      <div className="flex-1">
        <TextField
          label="Tên thẻ"
          hideLabel
          placeholder="Tên thẻ"
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={error || undefined}
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
