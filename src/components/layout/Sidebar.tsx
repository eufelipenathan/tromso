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
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const renderTreeItems = (items: any[]) => {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive =
        pathname === item.href || pathname?.startsWith(item.href + "/");

      const label = (
        <div
          className={cn(
            "flex items-center gap-2 py-2 transition-colors duration-200",
            isActive
              ? "text-primary font-medium"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span>{item.label}</span>
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
            {renderTreeItems(item.children)}
          </TreeItem>
        );
      }

      return (
        <TreeItem
          key={item.nodeId}
          nodeId={item.nodeId}
          label={label}
          onClick={() => item.href && router.push(item.href)}
          className={cn(
            "group transition-colors duration-200",
            isActive && "bg-primary/5 rounded-md"
          )}
        />
      );
    });
  };

  // Find the parent nodeId of the current active path
  const findExpandedParent = () => {
    const activeItem = navigation.find((item) =>
      item.children?.some((child) => pathname?.startsWith(child.href))
    );
    return activeItem ? [activeItem.nodeId] : [];
  };

  return (
    <div className="sticky top-0 h-screen w-64 flex flex-col border-r bg-card">
      <div className="h-14 flex items-center border-b px-6">
        <h1 className="text-xl font-bold">CRM SaaS</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <TreeView
          defaultCollapseIcon={<ChevronDown className="h-4 w-4" />}
          defaultExpandIcon={<ChevronRight className="h-4 w-4" />}
          defaultExpanded={findExpandedParent()}
          sx={{
            "& .MuiTreeItem-content": {
              padding: "2px 8px",
              borderRadius: "6px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "var(--mui-palette-action-hover)",
              },
              "&.Mui-focused, &.Mui-selected": {
                backgroundColor: "transparent",
              },
            },
            "& .MuiTreeItem-group": {
              marginLeft: "16px",
              borderLeft: "1px dashed var(--mui-palette-divider)",
              paddingLeft: "8px",
            },
          }}
        >
          {renderTreeItems(navigation)}
        </TreeView>
      </nav>
    </div>
  );
}
