"use client";

import { useState } from "react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useToast } from "@/hooks/use-toast";

export function CompanyActions(params: GridRenderCellParams) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { toast } = useToast();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // TODO: Implement edit functionality
    handleClose();
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/companies/${params.row.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir empresa");
      }

      toast({
        title: "Sucesso",
        description: "Empresa excluída com sucesso",
      });

      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir a empresa",
      });
    }
    handleClose();
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Excluir
        </MenuItem>
      </Menu>
    </>
  );
}