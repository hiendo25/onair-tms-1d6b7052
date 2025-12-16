"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Resource } from "../types";

interface DeleteConfirmDialogProps {
  open: boolean;
  resource: Resource | null;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteConfirmDialog({
                                      open,
                                      resource,
                                      onClose,
                                      onConfirm,
                                      loading,
                                    }: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Xóa {resource?.kind === "folder" ? "Thư mục" : "File"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc muốn xóa &quot;{resource?.name}&quot;?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={loading}>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}

