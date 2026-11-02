import { type ReactNode, Suspense } from "react";
import AppHeader from "../_components/AppHeader";
import MobileNav from "../_components/MobileNav";
import JoinedOrganizations from "../_components/organizations/JoinedOrganizations";
import SideNav from "../_components/SideNav";

// Shell for every page: header, side navigation and mobile navigation.
// The navigation reads the current path, so each one sits behind a Suspense boundary.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="mx-auto flex w-full max-w-[1200px] flex-1 gap-6 p-4 pb-24 sm:p-6 md:pb-6">
        <aside className="sticky top-20 hidden w-52 shrink-0 self-start md:block">
          <Suspense fallback={null}>
            <SideNav>
              <Suspense fallback={null}>
                <JoinedOrganizations />
              </Suspense>
            </SideNav>
          </Suspense>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </>
  );
}
