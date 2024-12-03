"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CompanySearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CompanySearch({ value, onChange }: CompanySearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar empresas..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}