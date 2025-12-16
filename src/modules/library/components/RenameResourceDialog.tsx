"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { Resource } from "../types";

interface RenameResourceDialogProps {
  open: boolean;
  resource: Resource | null;
  onClose: () => void;
  onConfirm: (resourceId: string, newName: string) => void;
  loading?: boolean;
}

export function RenameResourceDialog({
  open,
  resource,
  onClose,
  onConfirm,
  loading,
}: RenameResourceDialogProps) {
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (resource) {
      setNewName(resource.name);
    }
  }, [resource]);

  const handleClose = () => {
    setNewName("");
    onClose();
  };

  const handleConfirm = () => {
    if (resource && newName.trim() && newName.trim() !== resource.name) {
      onConfirm(resource.id, newName.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && newName.trim() && newName.trim() !== resource?.name) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Đổi tên {resource?.kind === "folder" ? "Folder" : "File"}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!newName.trim() || newName.trim() === resource?.name || loading}
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

