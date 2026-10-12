import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar.tsx";
import { ToastViewport } from "./ToastViewport.tsx";

export function PageShell(): ReactElement {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-6 lg:grid-cols-12">
          <Outlet />
        </div>
      </main>
      <ToastViewport />
    </div>
  );
}
