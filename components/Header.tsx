"use client";

import { usePathname, useRouter } from "next/navigation";
import { MonthSelector } from "./MonthSelector";
import { LogOut } from "lucide-react";
import { Button } from "./ui/button";

const routeNames: Record<string, string> = {
  "/": "Dashboard",
  "/income": "Renda",
  "/expenses": "Gastos",
  "/planning": "Planejamento",
  "/reports": "Relatórios",
  "/settings": "Configurações",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const title = routeNames[pathname] || "Finanças";

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        <MonthSelector />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Sair"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
