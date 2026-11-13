import { roleDot } from "@/lib/roles";

// A small colored dot that stands for a role. The name always sits beside it.
export default function RoleDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-3 w-3 shrink-0 rounded-full ${roleDot(color)}`}
    />
  );
}
