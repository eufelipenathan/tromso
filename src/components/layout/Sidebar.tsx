"use client";

import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
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
            "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
            isActive ? "bg-primary/5 text-primary" : "hover:bg-muted"
          )}
          onClick={() => item.href && router.push(item.href)}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="text-sm">{item.label}</span>
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
          className="group"
        />
      );
    });
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
          sx={{
            '& .MuiTreeItem-content': {
              padding: '0 !important',
              backgroundColor: 'transparent !important',
            },
            '& .MuiTreeItem-group': {
              marginLeft: '1.5rem !important',
              borderLeft: '1px dashed rgba(0,0,0,0.1)',
              dark: {
                borderColor: 'rgba(255,255,255,0.1)',
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'transparent !important',
            },
            '& .Mui-focused': {
              backgroundColor: 'transparent !important',
            },
          }}
        >
          {renderTreeItems(navigation)}
        </TreeView>
      </nav>
    </div>
  );
}