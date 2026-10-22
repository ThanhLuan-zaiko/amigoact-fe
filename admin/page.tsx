import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { AdminGuard } from "./components/AdminGuard.tsx";
import { AdminSidebar } from "./components/AdminSidebar.tsx";

export function AdminPage(): ReactElement {
  return (
    <AdminGuard>
      <div>
        <h1 className="sr-only">Quản trị nền tảng</h1>
        <div className="flex flex-col gap-4 @4xl:flex-row @4xl:items-start">
          <AdminSidebar />
          <section
            aria-label="Nội dung quản trị"
            className="flex min-w-0 flex-1 flex-col"
          >
            <Outlet />
          </section>
        </div>
      </div>
    </AdminGuard>
  );
}
