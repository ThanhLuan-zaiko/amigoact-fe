import { useState, type ReactElement } from "react";
import { FiAward, FiSlash } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import {
  useActivityCertificates,
  useIssueCertificate,
  useRevokeCertificate,
  useTemplates,
} from "../../certificates/hooks.ts";
import { CERTIFICATE_STATUS_LABELS } from "../../certificates/messages.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";

interface RosterCertActionsProps {
  activityId: string;
  orgId: string;
  studentId: string;
  act: (fn: () => Promise<unknown>, success?: string) => Promise<void>;
}

// Certificate cell of one attended roster row: an issued/revoked badge
// plus the matching action — issue, or a danger revoke behind
// ConfirmDialog. The per-activity certificate list is one shared query,
// so every row reads the same fetch from the cache.
export function RosterCertActions({
  activityId,
  orgId,
  studentId,
  act,
}: RosterCertActionsProps): ReactElement | null {
  const certs = useActivityCertificates(activityId);
  const templates = useTemplates(orgId);
  const issue = useIssueCertificate(activityId);
  const revoke = useRevokeCertificate(activityId);
  const [confirming, setConfirming] = useState(false);
  const [templateId, setTemplateId] = useState("");
  if (certs.isPending) return null;
  const cert = (certs.data ?? []).find((c) => c.student_id === studentId);
  const busy = issue.isPending || revoke.isPending;
  const activeTemplates = (templates.data ?? []).filter(
    (t) => t.is_active === true,
  );

  const badge =
    cert !== undefined ? (
      <span
        className={
          "inline-flex items-center rounded-full border px-2 py-0.5 " +
          "text-xs font-medium " +
          (cert.status === "issued"
            ? "border-emerald-300 bg-emerald-50 text-emerald-700 " +
              "dark:border-emerald-800 dark:bg-emerald-950 " +
              "dark:text-emerald-400"
            : "border-zinc-300 bg-zinc-50 text-zinc-500 " +
              "dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400")
        }
      >
        {CERTIFICATE_STATUS_LABELS[cert.status] ?? cert.status}
      </span>
    ) : null;

  return (
    <>
      {badge}
      {cert?.status === "issued" ? (
        <Button
          variant="ghost"
          disabled={busy}
          onClick={() => setConfirming(true)}
          icon={<FiSlash className="h-4 w-4" aria-hidden="true" />}
        >
          Thu hồi
        </Button>
      ) : (
        <>
          {activeTemplates.length > 0 && (
            <span className="inline-block w-36">
              <SelectField
                label="Mẫu chứng nhận"
                name={`tpl-${studentId}`}
                value={templateId}
                onChange={setTemplateId}
                options={[
                  { value: "", label: "Mặc định" },
                  ...activeTemplates.map((t) => ({
                    value: t.template_id,
                    label: t.name ?? "Mẫu",
                  })),
                ]}
              />
            </span>
          )}
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() =>
              void act(() =>
                issue.mutateAsync({
                  studentId,
                  templateId: templateId || undefined,
                }),
              )
            }
            icon={<FiAward className="h-4 w-4" aria-hidden="true" />}
          >
            Cấp chứng nhận
          </Button>
        </>
      )}
      <ConfirmDialog
        open={confirming}
        danger
        title="Thu hồi chứng nhận"
        message="Chứng nhận sẽ bị đánh dấu thu hồi và không còn hợp lệ khi xác thực."
        confirmLabel="Thu hồi"
        busyLabel="Đang thu hồi…"
        busy={revoke.isPending}
        onConfirm={() => {
          setConfirming(false);
          void act(() => revoke.mutateAsync({ studentId }));
        }}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
