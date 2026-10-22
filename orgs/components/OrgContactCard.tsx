import type { ReactElement } from "react";
import {
  FiExternalLink,
  FiFileText,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
} from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import type { PublicOrgDetail } from "../api.ts";
import { LEGAL_STATUS_LABELS } from "../messages.tsx";

interface OrgContactCardProps {
  org: PublicOrgDetail;
}

function websiteHref(site: string): string {
  return site.startsWith("http") ? site : `https://${site}`;
}

export function OrgContactCard({ org }: OrgContactCardProps): ReactElement {
  const hasContact =
    org.website !== null || org.email !== null || org.phone !== null;
  const location = [org.address, org.city, org.country]
    .filter((part): part is string => part !== null)
    .join(", ");
  const hasLegal =
    org.legal_name !== null ||
    org.license_number !== null ||
    org.tax_code !== null ||
    org.legal_status !== "none";
  return (
    <Section>
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
          <FiMail
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          Liên hệ
        </h2>
        {hasContact || location !== "" ? (
          <ul className="mt-3 space-y-2.5 text-sm">
            {org.website && (
              <li>
                <a
                  href={websiteHref(org.website)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 break-all text-zinc-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:focus-visible:outline-zinc-400"
                >
                  <FiGlobe className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {org.website}
                  <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
              </li>
            )}
            {org.email && (
              <li>
                <a
                  href={`mailto:${org.email}`}
                  className="flex items-center gap-2 break-all text-zinc-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:focus-visible:outline-zinc-400"
                >
                  <FiMail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {org.email}
                </a>
              </li>
            )}
            {org.phone && (
              <li>
                <a
                  href={`tel:${org.phone}`}
                  className="flex items-center gap-2 text-zinc-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:focus-visible:outline-zinc-400"
                >
                  <FiPhone className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {org.phone}
                </a>
              </li>
            )}
            {location !== "" && (
              <li className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {location}
              </li>
            )}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="Chưa công khai liên hệ"
              message="Tổ chức chưa cung cấp kênh liên hệ nào trên hồ sơ công khai."
            />
          </div>
        )}
        {hasLegal && (
          <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <FiFileText className="h-4 w-4" aria-hidden="true" />
              Thông tin pháp lý
            </h3>
            <dl className="mt-2 space-y-1.5 text-sm">
              {org.legal_name && (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Tên đăng ký</dt>
                  <dd className="text-right text-zinc-700 dark:text-zinc-300">
                    {org.legal_name}
                  </dd>
                </div>
              )}
              {org.tax_code && (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Mã số thuế</dt>
                  <dd className="text-right text-zinc-700 dark:text-zinc-300">
                    {org.tax_code}
                  </dd>
                </div>
              )}
              {org.license_number && (
                <div className="flex justify-between gap-2">
                  <dt className="text-zinc-500 dark:text-zinc-400">Giấy phép</dt>
                  <dd className="text-right text-zinc-700 dark:text-zinc-300">
                    {org.license_number}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-zinc-500 dark:text-zinc-400">Trạng thái</dt>
                <dd className="text-right text-zinc-700 dark:text-zinc-300">
                  {LEGAL_STATUS_LABELS[org.legal_status] ?? org.legal_status}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </Section>
  );
}
