"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  FileBarChart,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Renda", href: "/income", icon: Wallet },
  { name: "Gastos", href: "/expenses", icon: Receipt },
  { name: "Planejamento", href: "/planning", icon: Target },
  { name: "Relatórios", href: "/reports", icon: FileBarChart },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6">
      <div className="mb-8 px-4 text-xl font-bold tracking-tight">
        Finanças 💰
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
