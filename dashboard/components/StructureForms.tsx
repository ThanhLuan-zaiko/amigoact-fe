import { useState, type ReactElement } from "react";
import {
  FiArchive,
  FiCornerDownRight,
  FiPlus,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";

export function DeptRow({
  name,
  code,
  campusName,
  onArchive,
  busy,
}: {
  name: string;
  code: string | null;
  campusName: string | null;
  onArchive: () => void;
  busy: boolean;
}): ReactElement {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-zinc-100 px-3 py-1.5 dark:border-zinc-800">
      <span className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <FiCornerDownRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
        {name}
        {code && (
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            {code}
          </span>
        )}
        {campusName && (
          <span className="text-xs text-zinc-400">· {campusName}</span>
        )}
      </span>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={onArchive}
        icon={<FiArchive className="h-4 w-4" aria-hidden="true" />}
      >
        Lưu trữ
      </Button>
    </li>
  );
}

interface CampusFormProps {
  busy: boolean;
  onSubmit: (name: string, address: string) => Promise<void>;
}

export function CampusForm({
  busy,
  onSubmit,
}: CampusFormProps): ReactElement {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <TextField
        label="Tên cơ sở"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Cơ sở chính"
      />
      <TextField
        label="Địa chỉ"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Số 1 Đại Cồ Việt"
      />
      <Button
        variant="secondary"
        disabled={busy}
        onClick={() =>
          void onSubmit(name.trim(), address.trim()).then(() => {
            setName("");
            setAddress("");
          })
        }
        icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
      >
        Thêm cơ sở
      </Button>
    </div>
  );
}

interface DepartmentFormProps {
  busy: boolean;
  campuses: { id: string; name: string }[];
  onSubmit: (
    name: string,
    code: string,
    campusId: string,
  ) => Promise<void>;
}

export function DepartmentForm({
  busy,
  campuses,
  onSubmit,
}: DepartmentFormProps): ReactElement {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [campusId, setCampusId] = useState("");
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_1fr_auto] sm:items-end">
      <TextField
        label="Tên khoa/phòng"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Khoa CNTT"
      />
      <TextField
        label="Mã"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="IT"
      />
      <SelectField
        label="Thuộc cơ sở"
        name="dept-campus"
        value={campusId}
        onChange={setCampusId}
        options={[
          { value: "", label: "Không gắn cơ sở" },
          ...campuses.map((c) => ({ value: c.id, label: c.name })),
        ]}
      />
      <Button
        variant="secondary"
        disabled={busy}
        onClick={() =>
          void onSubmit(name.trim(), code.trim(), campusId).then(() => {
            setName("");
            setCode("");
            setCampusId("");
          })
        }
        icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
      >
        Thêm khoa
      </Button>
    </div>
  );
}
