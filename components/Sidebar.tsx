import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, generateId } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  FileBarChart,
  Settings,
  X,
} from "lucide-react";
import { Button } from "./ui/button";

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
  const { isOpen, setOpen } = useSidebar();

  const handleLinkClick = () => {
    // No mobile, fecha a sidebar ao clicar em um link
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r bg-card px-4 py-6 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="mb-8 flex items-center justify-between px-4">
        <div className="text-xl font-bold tracking-tight">Finanças 💰</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
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
