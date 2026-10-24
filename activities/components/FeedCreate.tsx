import { useState, type ReactElement } from "react";
import { SelectField } from "../../core/components/SelectField.tsx";
import type { MyActivityOrg } from "../feed-api.ts";
import { useCategories, useCreateActivity } from "../hooks.ts";
import { ActivityForm } from "./ActivityForm.tsx";

// Create form for the cross-org feed: the caller picks which org opens the
// draft. Only orgs the caller may create in are offered.
export function FeedCreate({
  orgs,
  initialOrgId,
  onDone,
}: {
  orgs: MyActivityOrg[];
  initialOrgId: string;
  onDone: () => void;
}): ReactElement {
  const [orgId, setOrgId] = useState(initialOrgId);
  const categories = useCategories(orgId);
  const create = useCreateActivity(orgId);
  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label="Tổ chức"
        name="create-org"
        value={orgId}
        onChange={setOrgId}
        options={orgs.map((org) => ({ value: org.id, label: org.name }))}
      />
      <ActivityForm
        key={orgId}
        categories={categories.data ?? []}
        submitLabel="Tạo bản nháp"
        onSubmit={(input) => create.mutateAsync(input)}
        onDone={onDone}
      />
    </div>
  );
}
