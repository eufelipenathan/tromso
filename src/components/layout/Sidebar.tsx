"use client";

import { TreeView } from "@mui/x-tree-view/TreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  Users,
  Settings,
  Target,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    nodeId: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    nodeId: "empresas",
    label: "Empresas",
    href: "/empresas",
    icon: Building2,
  },
  {
    nodeId: "contatos",
    label: "Contatos",
    href: "/contatos",
    icon: Users,
  },
  {
    nodeId: "negocios",
    label: "Negócios",
    href: "/negocios",
    icon: Target,
  },
  {
    nodeId: "configuracoes",
    label: "Configurações",
    icon: Settings,
    children: [
      {
        nodeId: "configuracoes-pipelines",
        label: "Pipelines",
        href: "/configuracoes/pipelines",
      },
      {
        nodeId: "configuracoes-motivos-perda",
        label: "Motivos de Perda",
        href: "/configuracoes/motivos-perda",
      },
      {
        nodeId: "configuracoes-secoes-campos",
        label: "Seções e campos",
        href: "/configuracoes/secoes-campos",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const renderTreeItems = (items: any[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive = pathname === item.href;

      const label = (
        <div
          className={cn(
            "sidebar-item",
            isActive ? "sidebar-item-active" : "sidebar-item-hover",
            item.children && "mb-1"
          )}
          onClick={() => item.href && router.push(item.href)}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="text-[15px]">{item.label}</span>
        </div>
      );

      if (item.children) {
        return (
          <TreeItem
            key={item.nodeId}
            nodeId={item.nodeId}
            label={label}
            className="group"
          >
            <div className="sidebar-group">
              {item.children.map((child: any) => (
                <div
                  key={child.nodeId}
                  className={cn(
                    "py-2 px-2 rounded-md cursor-pointer text-[15px]",
                    pathname === child.href
                      ? "text-primary font-medium"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => router.push(child.href)}
                >
                  {child.label}
                </div>
              ))}
            </div>
          </TreeItem>
        );
      }

      return (
        <TreeItem
          key={item.nodeId}
          nodeId={item.nodeId}
          label={label}
          className="group"
        />
      );
    });
  };

  return (
    <div className="sticky top-0 h-screen w-64 flex flex-col sidebar-gradient">
      <div className="h-14 flex items-center px-6 border-b">
        <h1 className="text-xl font-bold">CRM SaaS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <TreeView
          defaultCollapseIcon={
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
          defaultExpandIcon={
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          }
          sx={{
            "& .MuiTreeItem-content": {
              padding: "0 !important",
              backgroundColor: "transparent !important",
            },
            "& .MuiTreeItem-group": {
              marginLeft: "1.5rem !important",
              paddingLeft: "2px !important",
              borderLeft: "1px dashed var(--border)",
            },
            "& .Mui-selected": {
              backgroundColor: "transparent !important",
            },
            "& .Mui-focused": {
              backgroundColor: "transparent !important",
            },
          }}
        >
          {renderTreeItems(navigation)}
        </TreeView>
      </nav>
    </div>
  );
}
