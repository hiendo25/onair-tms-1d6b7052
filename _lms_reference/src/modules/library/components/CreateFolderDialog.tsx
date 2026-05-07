"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (folderName: string) => void;
  loading?: boolean;
}

export function CreateFolderDialog({ open, onClose, onConfirm, loading }: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  const handleConfirm = () => {
    if (folderName.trim()) {
      onConfirm(folderName.trim());
      setFolderName("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && folderName.trim()) {
      handleConfirm();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Tạo thư mục</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Tên thư mục"
          type="text"
          fullWidth
          variant="outlined"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
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
          disabled={!folderName.trim() || loading}
        >
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

