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
import type { LibraryItem } from "../types/library";

interface LibraryItemDialogsProps {
  itemToBorrow: LibraryItem | null;
  itemToDelete: LibraryItem | null;
  itemToReturn: LibraryItem | null;
  userName?: string;
  onCloseBorrow: () => void;
  onCloseDelete: () => void;
  onCloseReturn: () => void;
  onConfirmBorrow: () => void;
  onConfirmDelete: () => void;
  onConfirmReturn: () => void;
}

function LibraryItemDialogs({
  itemToBorrow,
  itemToDelete,
  itemToReturn,
  userName,
  onCloseBorrow,
  onCloseDelete,
  onCloseReturn,
  onConfirmBorrow,
  onConfirmDelete,
  onConfirmReturn,
}: LibraryItemDialogsProps) {
  const { t } = useTranslation();

  const dialogPaperProps = {
    borderRadius: "16px",
    padding: "8px",
    maxWidth: "440px",
    width: "100%",
  };

  const cancelButtonSx = {
    borderColor: "#6d28d9",
    color: "#6d28d9",
    "&:hover": {
      borderColor: "#5b21b6",
      backgroundColor: "#f5f3ff",
    },
  };

  const confirmButtonSx = {
    backgroundColor: "#6d28d9",
    "&:hover": {
      backgroundColor: "#5b21b6",
    },
  };

  return (
    <>
      <Dialog
        open={itemToBorrow !== null}
        onClose={onCloseBorrow}
        aria-labelledby="borrow-library-item-title"
        slotProps={{
          paper: {
            sx: dialogPaperProps,
          },
        }}
      >
        <DialogTitle id="borrow-library-item-title" sx={{ color: "#6d28d9" }}>
          {t("library.borrowDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.borrowDialogDescription", {
              title: itemToBorrow?.title ?? "",
              name: userName ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={onCloseBorrow}
            variant="outlined"
            sx={cancelButtonSx}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={onConfirmBorrow}
            variant="contained"
            sx={confirmButtonSx}
          >
            {t("library.confirmBorrow")}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemToDelete !== null}
        onClose={onCloseDelete}
        aria-labelledby="delete-library-item-title"
        slotProps={{
          paper: {
            sx: dialogPaperProps,
          },
        }}
      >
        <DialogTitle
          id="delete-library-item-title"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "#b91c1c",
          }}
        >
          <AlertTriangle size={24} />
          {t("library.deleteDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.deleteDialogDescription", {
              title: itemToDelete?.title ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={onCloseDelete}
            variant="outlined"
            sx={cancelButtonSx}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={onConfirmDelete}
            variant="contained"
            startIcon={<Trash2 size={18} />}
            sx={{
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
            }}
          >
            {t("library.delete")}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={itemToReturn !== null}
        onClose={onCloseReturn}
        aria-labelledby="return-library-item-title"
        slotProps={{
          paper: {
            sx: dialogPaperProps,
          },
        }}
      >
        <DialogTitle id="return-library-item-title" sx={{ color: "#6d28d9" }}>
          {t("library.returnDialogTitle")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {t("library.returnDialogDescription", {
              title: itemToReturn?.title ?? "",
            })}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ padding: "16px 24px" }}>
          <MuiButton
            onClick={onCloseReturn}
            variant="outlined"
            sx={cancelButtonSx}
          >
            {t("library.cancel")}
          </MuiButton>

          <MuiButton
            onClick={onConfirmReturn}
            variant="contained"
            sx={confirmButtonSx}
          >
            {t("library.confirmReturn")}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default LibraryItemDialogs;
