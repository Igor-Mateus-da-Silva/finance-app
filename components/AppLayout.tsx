"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isOpen, setOpen } = useSidebar();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </>
  );
}
