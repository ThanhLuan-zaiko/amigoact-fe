import { FiRotateCcw } from "react-icons/fi";
import { restoreOrganization } from "@/app/_actions/organizations";
import { type DeletedOrganization, formatDate } from "@/lib/organizations";
import { mutedText, panel, secondaryButton, sectionTitle } from "../ui";
import ActionButton from "./ActionButton";

// The owner's trash. A deleted organization has no public page, so it is restored from here.
export default function DeletedOrganizations({
  organizations,
}: {
  organizations: DeletedOrganization[];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <h2 className={sectionTitle}>Thùng rác</h2>
        <span className={mutedText}>{organizations.length}</span>
      </div>
      {organizations.map((organization) => (
        <div
          key={organization.id}
          className={`${panel} flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="min-w-0">
            <p className="truncate font-semibold">{organization.name}</p>
            <p className={mutedText}>
              Xóa ngày {formatDate(organization.deleted_at)}
            </p>
          </div>
          <ActionButton
            action={restoreOrganization.bind(null, organization.id)}
            label={`Khôi phục ${organization.name}`}
            className={secondaryButton}
          >
            <FiRotateCcw aria-hidden="true" />
            Khôi phục
          </ActionButton>
        </div>
      ))}
    </section>
  );
}
