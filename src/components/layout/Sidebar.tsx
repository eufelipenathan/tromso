"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  BarChart3,
  Users,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Empresas", href: "/empresas", icon: Building2 },
  { name: "Contatos", href: "/contatos", icon: Users },
  { name: "Negócios", href: "/negocios", icon: Target },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    submenu: [
      { name: "Pipelines", href: "/configuracoes/pipelines" },
      { name: "Motivos de Perda", href: "/configuracoes/motivos-perda" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 h-screen w-64 flex flex-col border-r bg-card">
      <div className="h-14 flex items-center border-b px-6">
        <h1 className="text-xl font-bold">CRM SaaS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.name}
                </Link>
                {item.submenu && isActive && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subitem) => {
                      const isSubActive = pathname === subitem.href;
                      return (
                        <Link
                          key={subitem.name}
                          href={subitem.href}
                          className={cn(
                            "group flex items-center px-2 py-1.5 text-sm font-medium rounded-md",
                            isSubActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {subitem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}