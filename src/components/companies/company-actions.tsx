"use client";

import { useState } from "react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import { useToast } from "@/hooks/use-toast";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "@/stores/use-company-store";

export function CompanyActions(params: GridRenderCellParams) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { setShowCompanyForm, setFormData } = useCompanyStore();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    router.push(`/empresas/${params.row.id}`);
    handleClose();
  };

  const handleEdit = () => {
    setFormData(params.row);
    setShowCompanyForm(true);
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
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              "& .MuiMenuItem-root": {
                fontSize: "0.875rem",
                py: 1,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleProfile}>Perfil</MenuItem>
        <MenuItem onClick={handleEdit}>Editar</MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            setShowDeleteDialog(true);
          }}
          sx={{ color: "error.main" }}
        >
          Excluir
        </MenuItem>
      </Menu>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir empresa"
        description="Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDelete}
      />
    </>
  );
}
