import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button as MuiButton,
} from "@mui/material";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Category } from "../types/library";

interface DeleteCategoryDialogProps {
  category: Category | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

function DeleteCategoryDialog({
  category,
  onClose,
  onConfirm,
}: DeleteCategoryDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={category !== null}
      onClose={onClose}
      aria-labelledby="delete-category-title"
      aria-describedby="delete-category-description"
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "20px",
            padding: "8px",
            boxShadow: "0 20px 60px rgba(55, 35, 91, 0.18)",
          },
        },
      }}
    >
      <DialogTitle
        id="delete-category-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          color: "#302642",
          fontWeight: 750,
          fontSize: "20px",
        }}
      >
        <AlertTriangle size={23} color="#7c3aed" />
        {t("categoryManager.deleteTitle")}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          id="delete-category-description"
          sx={{ color: "#807990", lineHeight: 1.8 }}
        >
          {t("categoryManager.deleteDescription", {
            name: category?.name ?? "",
          })}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ padding: "16px", gap: 1 }}>
        <MuiButton
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#6d28d9",
            backgroundColor: "#ffffff",
            border: "1px solid #d8ccff",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            padding: "9px 16px",
            boxShadow: "none",
            "&:hover": {
              color: "#6d28d9",
              backgroundColor: "#eee5ff",
              border: "1px solid #7c3aed",
              boxShadow: "0 4px 12px rgba(124, 58, 237, 0.15)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {t("categoryManager.cancel")}
        </MuiButton>

        <MuiButton
          onClick={onConfirm}
          variant="contained"
          startIcon={<Trash2 size={17} />}
          sx={{
            backgroundColor: "#7c3aed",
            "&:hover": { backgroundColor: "#6d28d9" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "10px",
            padding: "9px 16px",
            boxShadow: "none",
          }}
        >
          {t("categoryManager.delete")}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteCategoryDialog;
