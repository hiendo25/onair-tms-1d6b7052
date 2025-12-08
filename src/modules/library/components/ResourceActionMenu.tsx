"use client";

import { useState } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Resource } from "../types";

interface ResourceActionMenuProps {
  resource: Resource;
  onRename: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
}

export function ResourceActionMenu({ resource, onRename, onDelete }: ResourceActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };

  const handleRename = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onRename(resource);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    handleClose();
    onDelete(resource);
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={handleClick}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "background.paper",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Đổi tên</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

