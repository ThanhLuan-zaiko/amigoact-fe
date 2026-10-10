import type { ReactElement } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useRiseIn } from "../core/motion.ts";
import { AdminGuard } from "./components/AdminGuard.tsx";
import { AdminSidebar } from "./components/AdminSidebar.tsx";

export function AdminPage(): ReactElement {
  const { pathname } = useLocation();
  const scope = useRiseIn<HTMLDivElement>([pathname]);

  return (
    <AdminGuard>
      <div className="col-span-1 md:col-span-6 lg:col-span-12">
        <h1 className="sr-only">Quản trị nền tảng</h1>
        <div
          ref={scope}
          className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start"
        >
          <AdminSidebar />
          <section
            aria-label="Nội dung quản trị"
            className="grid min-w-0 flex-1 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-12"
          >
            <Outlet />
          </section>
        </div>
      </div>
    </AdminGuard>
  );
}
