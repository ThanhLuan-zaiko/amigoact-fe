import { useState, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiHash, FiLock, FiSearch, FiTrash2 } from "react-icons/fi";
import { Button } from "../core/components/Button.tsx";
import { Section } from "../core/components/Section.tsx";
import { TextField } from "../core/components/TextField.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useMyOrgs } from "../dashboard/hooks.ts";
import { MemberOrgPicker } from "../dashboard/components/MemberOrgPicker.tsx";
import { useWorkspaceOrg } from "../workspace/hooks.ts";
import { useLiveActivities } from "./hooks.ts";
import { useOrgTags } from "./tags-hooks.ts";
import { foldTag } from "./tag-utils.ts";
import { toVietnameseTagMessage } from "./messages.tsx";
import { TagCreateForm } from "./components/TagCreateForm.tsx";
import { TagRow } from "./components/TagRow.tsx";
import { TagTrashRow } from "./components/TagTrashRow.tsx";

// Org tag catalog: live list plus a manager-only trash bucket. Soft
// deletes detach a tag from every activity and remember the edges; the
// restore re-attaches exactly those activities. The slug stays
// reserved while trashed (TAG_DELETED on reuse).
export function ManageTagsPage(): ReactElement {
  const orgs = useMyOrgs();
  const { orgId, selectOrg } = useWorkspaceOrg(orgs.data?.items ?? []);
  useLiveActivities(orgId ?? undefined);
  const [searchParams, setSearchParams] = useSearchParams();
  const wantTrash = searchParams.get("trash") === "1";
  const [query, setQuery] = useState("");
  const needle = foldTag(query);

  // The live list always loads: it carries can_manage and trash_count.
  const live = useOrgTags(orgId);
  const canManage = live.data?.can_manage ?? false;
  const trashCount = live.data?.trash_count ?? 0;
  const trashView = wantTrash && canManage;
  const trash = useOrgTags(orgId, true, canManage && trashView);

  const catalog = live.data?.items ?? [];
  const active = trashView ? trash : live;
  const items = (active.data?.items ?? []).filter(
    (t) =>
      !needle ||
      foldTag(t.name).includes(needle) ||
      t.slug.includes(needle),
  );

  function setTrash(next: boolean): void {
    setSearchParams(
      (params) => {
        if (next) params.set("trash", "1");
        else params.delete("trash");
        return params;
      },
      { replace: true },
    );
  }

  return (
    <>
      <Section>
        <div data-rise className="flex items-center gap-2">
          <FiHash
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Thẻ
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Mỗi tổ chức có bộ thẻ riêng. Đổi tên, gộp hoặc xóa thẻ sẽ cập
          nhật mọi hoạt động đang dùng thẻ đó, kể cả hoạt động trong thùng
          rác.
        </p>
        {orgs.isPending && <LoadingState label="Đang tải tổ chức…" />}
        {orgs.isSuccess && orgs.data.items.length === 0 && (
          <EmptyState
            title="Chưa có tổ chức"
            message="Tạo tổ chức trước khi quản lý thẻ."
          />
        )}
        {orgs.isSuccess && orgs.data.items.length > 0 && (
          <MemberOrgPicker
            orgs={orgs.data.items}
            selectedId={orgId}
            onSelect={selectOrg}
          />
        )}
        {orgId && live.isSuccess && canManage && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={trashView ? "secondary" : "primary"}
              onClick={() => setTrash(false)}
              aria-pressed={!trashView}
              icon={<FiHash className="h-4 w-4" aria-hidden="true" />}
            >
              {`Đang dùng · ${catalog.length}`}
            </Button>
            <Button
              type="button"
              variant={trashView ? "primary" : "secondary"}
              onClick={() => setTrash(true)}
              aria-pressed={trashView}
              icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
            >
              {`Thùng rác · ${trashCount}`}
            </Button>
          </div>
        )}
        {orgId && live.isSuccess && canManage && !trashView && (
          <TagCreateForm orgId={orgId} />
        )}
        {orgId && live.isSuccess && !canManage && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
            <FiLock className="h-4 w-4" aria-hidden="true" />
            Bạn chỉ có quyền xem. Cần quyền &quot;Quản lý thẻ&quot; để
            thêm, đổi tên, gộp hoặc xóa thẻ.
          </p>
        )}
      </Section>

      {orgId && (
        <Section>
          {trashView && (
            <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
              Thẻ đã xóa mềm được gỡ khỏi các hoạt động. Khôi phục để gắn
              lại thẻ cho đúng những hoạt động đó, hoặc xóa cứng để xóa
              vĩnh viễn.
            </p>
          )}
          <TextField
            label="Tìm thẻ"
            hideLabel
            placeholder="Tìm thẻ…"
            icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {items.length} thẻ
          </p>
          {active.isPending && (
            <LoadingState
              label={trashView ? "Đang tải thùng rác…" : "Đang tải thẻ…"}
            />
          )}
          {active.isError && (
            <ErrorState
              title="Không tải được"
              message={toVietnameseTagMessage(active.error.code)}
            />
          )}
          {active.isSuccess && items.length === 0 && !needle && (
            <EmptyState
              title={trashView ? "Thùng rác trống" : "Chưa có thẻ"}
              message={
                trashView
                  ? "Thẻ đã xóa mềm sẽ nằm ở đây để khôi phục hoặc xóa vĩnh viễn."
                  : canManage
                    ? "Thêm thẻ đầu tiên ở trên hoặc gắn thẻ khi tạo hoạt động."
                    : "Thêm thẻ đầu tiên bằng cách gắn thẻ khi tạo hoạt động."
              }
            />
          )}
          {active.isSuccess && items.length === 0 && needle && (
            <EmptyState
              title="Không có thẻ phù hợp."
              message="Thử từ khóa khác."
            />
          )}
          {active.isSuccess && items.length > 0 && (
            <ul className="-mx-4 divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((tag) =>
                trashView ? (
                  <TagTrashRow key={tag.id} orgId={orgId} tag={tag} />
                ) : (
                  <TagRow
                    key={tag.id}
                    orgId={orgId}
                    tag={tag}
                    others={catalog.filter((t) => t.slug !== tag.slug)}
                    canManage={canManage}
                  />
                ),
              )}
            </ul>
          )}
        </Section>
      )}
    </>
  );
}
