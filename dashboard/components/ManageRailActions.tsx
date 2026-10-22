import type { ReactElement } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { FiEdit3, FiPlus, FiTrash2, FiUserPlus } from "react-icons/fi";
import { useOrgTags } from "../../activities/tags-hooks.ts";
import { Button } from "../../core/components/Button.tsx";
import { useOrgMembers } from "../members-hooks.ts";
import type { MemberSortParam } from "../members-api.ts";

const SORTS = ["newest", "name", "role"] as const;

function toggleParam(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  key: string,
  on: boolean,
): void {
  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev);
      if (on) next.set(key, "1");
      else next.delete(key);
      return next;
    },
    { replace: true },
  );
}

// Page actions for the manage rail. Query keys match the page so the
// member roster request is the one the center column already cached.
export function ManageActions({
  orgId,
}: {
  orgId: string | null;
}): ReactElement | null {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const onMembers = pathname.startsWith("/manage/members");
  const onTags = pathname.startsWith("/manage/tags");
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: MemberSortParam = (SORTS as readonly string[]).includes(sortParam)
    ? (sortParam as MemberSortParam)
    : "newest";
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const bucket = searchParams.get("status") ?? "all";
  const query = searchParams.get("q") ?? "";
  const members = useOrgMembers(onMembers ? orgId : null, {
    q: query || undefined,
    status: bucket === "all" ? undefined : bucket,
    sort,
    limit: 10,
    offset: (page - 1) * 10,
  });
  const tags = useOrgTags(onTags ? orgId : null);
  const canInvite =
    members.data?.viewer_role === "owner" ||
    (members.data?.viewer_permissions ?? []).includes("member:invite");
  const inviting = searchParams.get("invite") === "1";
  const creating = searchParams.get("create") === "1";
  const trash = searchParams.get("trash") === "1";
  const buttons: ReactElement[] = [];

  if (
    pathname.startsWith("/manage/overview") ||
    pathname.startsWith("/manage/orgs")
  ) {
    buttons.push(
      <Button
        key="create-org"
        to="/manage/orgs/create"
        variant="primary"
        icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
      >
        Tạo tổ chức
      </Button>,
    );
  }
  if (pathname.startsWith("/manage/events") && orgId !== null) {
    buttons.push(
      <Button
        key="create-activity"
        type="button"
        variant={creating ? "secondary" : "primary"}
        aria-pressed={creating}
        onClick={() => toggleParam(setSearchParams, "create", !creating)}
        icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
      >
        {creating ? "Đóng biểu mẫu" : "Tạo hoạt động"}
      </Button>,
      <Button
        key="trash-activity"
        type="button"
        variant={trash ? "primary" : "secondary"}
        aria-pressed={trash}
        onClick={() => toggleParam(setSearchParams, "trash", !trash)}
        icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
      >
        Thùng rác
      </Button>,
    );
  }
  if (onTags && tags.data?.can_manage) {
    buttons.push(
      <Button
        key="trash-tags"
        type="button"
        variant={trash ? "primary" : "secondary"}
        aria-pressed={trash}
        onClick={() => toggleParam(setSearchParams, "trash", !trash)}
        icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
      >
        {`Thùng rác · ${tags.data.trash_count}`}
      </Button>,
    );
  }
  if (onMembers && canInvite && orgId !== null) {
    buttons.push(
      <Button
        key="invite"
        type="button"
        variant={inviting ? "primary" : "secondary"}
        aria-pressed={inviting}
        onClick={() => toggleParam(setSearchParams, "invite", !inviting)}
        icon={<FiUserPlus className="h-4 w-4" aria-hidden="true" />}
      >
        Mời thành viên
      </Button>,
    );
  }
  if (pathname.startsWith("/manage/board") && orgId !== null) {
    buttons.push(
      <Button
        key="write"
        to={`/manage/board/write?org=${orgId}`}
        variant="primary"
        icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
      >
        Viết bài
      </Button>,
    );
  }
  if (buttons.length === 0) return null;
  return <div className="flex flex-wrap gap-2">{buttons}</div>;
}
