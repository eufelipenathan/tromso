// src/features/companies/components/CompanyList.tsx
import React, { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Company } from "@/types";
import { formatDate } from "@/utils/dates";
import { ActionCellRenderer } from "./grid/ActionCellRenderer";
import { ContactFieldRenderer } from "./grid/ContactFieldRenderer";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyList({ companies, onEdit, onDelete }: CompanyListProps) {
  console.log("CompanyList Component Rendered");
  console.log("Props received - companies:", companies);
  console.log("Props received - onEdit function:", onEdit);
  console.log("Props received - onDelete function:", onDelete);

  const gridRef = useRef<AgGridReact>(null);
  console.log("Grid reference initialized:", gridRef);

  const columnDefs: ColDef[] = useMemo(() => {
    console.log("Defining columnDefs");
    return [
      {
        field: "actions",
        headerName: "Ações",
        cellRenderer: ActionCellRenderer,
        cellRendererParams: { onEdit, onDelete },
        width: 80,
        pinned: "left",
        resizable: false,
        suppressMenu: true,
        suppressMovable: true,
      },
      {
        field: "name",
        headerName: "Nome",
        minWidth: 200,
        flex: 1,
      },
      {
        field: "legalName",
        headerName: "Razão Social",
        minWidth: 200,
        flex: 1,
      },
      {
        field: "cnpj",
        headerName: "CNPJ",
        width: 150,
      },
      {
        field: "phones",
        headerName: "Telefones",
        cellRenderer: ContactFieldRenderer,
        minWidth: 200,
        flex: 1,
      },
      {
        field: "emails",
        headerName: "E-mails",
        cellRenderer: ContactFieldRenderer,
        minWidth: 200,
        flex: 1,
      },
      {
        field: "createdAt",
        headerName: "Criado em",
        valueFormatter: (params) => {
          console.log("Formatting createdAt value:", params.value);
          return formatDate(params.value);
        },
        width: 180,
      },
    ];
  }, [onEdit, onDelete]);

  console.log("Column Definitions:", columnDefs);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  console.log("Default Column Definition:", defaultColDef);

  React.useEffect(() => {
    if (gridRef.current) {
      console.log("Grid reference updated:", gridRef.current);
    }
  }, [gridRef]);

  React.useEffect(() => {
    console.log("Companies data changed:", companies);
  }, [companies]);

  return (
    <div className="ag-theme-alpine w-full h-full">
      <AgGridReact
        ref={gridRef}
        rowData={companies}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={25}
        onGridReady={(params) => {
          console.log("Grid is ready:", params.api);
        }}
        onRowDataUpdated={() => console.log("Row data updated")}
        onCellClicked={(event) =>
          console.log("Cell clicked:", { rowData: event.data, colId: event.colDef.field })
        }
      />
    </div>
  );
}
