import { Suspense } from "react";
import {
  FiCalendar,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { getOrganization } from "@/lib/organizationApi";
import { formatDate } from "@/lib/organizations";
import IconStat from "../../../_components/IconStat";
import { mutedText, panel } from "../../../_components/ui";

const linkClass =
  "font-semibold text-teal-700 hover:underline dark:text-teal-400";

async function OrganizationAbout({
  params,
}: {
  params: PageProps<"/organizations/[slug]">["params"];
}) {
  const { slug } = await params;
  const organization = await getOrganization(slug);
  // The layout already shows the not-found page for an unknown organization.
  if (!organization) {
    return null;
  }
  const location = [organization.address, organization.city]
    .filter(Boolean)
    .join(", ");

  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      {organization.description ? (
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
          {organization.description}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <IconStat icon={FiUser} label="Chủ sở hữu">
          {organization.owner_name}
        </IconStat>
        <IconStat icon={FiCalendar} label="Ngày tạo">
          {formatDate(organization.created_at)}
        </IconStat>
        {organization.email ? (
          <IconStat icon={FiMail} label="Email">
            <a href={`mailto:${organization.email}`} className={linkClass}>
              {organization.email}
            </a>
          </IconStat>
        ) : null}
        {organization.phone ? (
          <IconStat icon={FiPhone} label="Điện thoại">
            <a href={`tel:${organization.phone}`} className={linkClass}>
              {organization.phone}
            </a>
          </IconStat>
        ) : null}
        {/* The backend accepts only http and https here, so this link is safe. */}
        {organization.website ? (
          <IconStat icon={FiGlobe} label="Website">
            <a
              href={organization.website}
              rel="noopener noreferrer"
              className={linkClass}
            >
              {organization.website}
            </a>
          </IconStat>
        ) : null}
        {location ? (
          <IconStat icon={FiMapPin} label="Địa chỉ">
            {location}
          </IconStat>
        ) : null}
      </div>
    </section>
  );
}

export default function OrganizationPage({
  params,
}: PageProps<"/organizations/[slug]">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <OrganizationAbout params={params} />
    </Suspense>
  );
}
