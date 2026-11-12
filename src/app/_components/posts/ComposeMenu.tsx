import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import { getMyOrganizations } from "@/lib/organizationApi";
import { postableOrganizations } from "@/lib/posts";
import { primaryButton } from "../ui";

function ButtonFace() {
  return (
    <>
      <FiPlus aria-hidden="true" />
      <span className="hidden sm:inline">Tạo bài</span>
    </>
  );
}

// Posts live inside an organization. With one place to post, the button opens its
// form. With several, it lists them. With none, it leads to the organization list.
// Read behind a Suspense boundary, because it reads the session.
export default async function ComposeMenu() {
  const choices = postableOrganizations(
    await getMyOrganizations(),
    "discussion",
  );
  if (choices.length <= 1) {
    const href = choices[0]
      ? `/org/${choices[0].slug}/posts/new`
      : "/organizations";
    return (
      <Link
        href={href}
        aria-label="Tạo bài"
        title="Tạo bài"
        className={primaryButton}
      >
        <ButtonFace />
      </Link>
    );
  }
  // A native disclosure: it opens and closes without JavaScript and with the keyboard.
  return (
    <details className="relative">
      <summary
        aria-label="Tạo bài"
        title="Tạo bài"
        className={`${primaryButton} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
      >
        <ButtonFace />
      </summary>
      <div className="absolute right-0 z-20 mt-2 flex w-64 flex-col rounded-md border border-slate-200 bg-white py-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <p className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          Đăng bài trong
        </p>
        {choices.map((org) => (
          <Link
            key={org.id}
            href={`/org/${org.slug}/posts/new`}
            className="truncate px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-400"
          >
            {org.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
