"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useLibraryStore } from "../store/libraryProvider";
import { Resource } from "../types";
import { LibraryBreadcrumbs } from "./LibraryBreadcrumbs";
import { ResourceCard } from "./ResourceCard";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { RenameResourceDialog } from "./RenameResourceDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import {
  createFileResource,
  createFolder,
  deleteResource,
  getLibraryResources,
  renameResource,
} from "@/services/libraries/library.service";
import { uploadFileToS3 } from "@/utils/s3-upload";

export function LibraryDialog() {
  const open = useLibraryStore((state) => state.open);
  const config = useLibraryStore((state) => state.config);
  const closeLibrary = useLibraryStore((state) => state.closeLibrary);
  const cancelLibrary = useLibraryStore((state) => state.cancelLibrary);
  const resources = useLibraryStore((state) => state.resources);
  const setResources = useLibraryStore((state) => state.setResources);

  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: string | null; name: string }>>([
    { id: null, name: "Root" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResourceForAction, setSelectedResourceForAction] = useState<Resource | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef<boolean>(false);
  const hasRestoredSelectionRef = useRef<boolean>(false);

  useEffect(() => {
    const fetchResources = async () => {
      if (open && config) {
        if (!config.libraryId) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        try {
          const fetchedResources = await getLibraryResources(config.libraryId);

          setResources(fetchedResources);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load resources");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchResources();
  }, [open, config?.libraryId, setResources]);

  useEffect(() => {
    const isDialogOpening = open && !prevOpenRef.current;

    if (isDialogOpening) {
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: "Root" }]);
      hasRestoredSelectionRef.current = false;
    } else if (!open) {
      setSelectedResources([]);
      setCurrentFolderId(null);
      setFolderPath([{ id: null, name: "Root" }]);
      hasRestoredSelectionRef.current = false;
    }

    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (open && config && resources.length > 0 && !hasRestoredSelectionRef.current) {
      const preSelected = resources.filter((resource: Resource) =>
        config.selectedIds.includes(resource.id) && resource.kind === "file",
      );
      setSelectedResources(preSelected);
      hasRestoredSelectionRef.current = true;
    }
  }, [open, config, resources]);

  const displayedResources = resources.filter(
    (resource: Resource) => resource.parent_id === currentFolderId,
  );

  const handleResourceClick = (resource: Resource) => {
    if (resource.kind === "folder") {
      return;
    }

    if (config?.mode === "single") {
      setSelectedResources((prev) => {
        const isSelected = prev.some((r) => r.id === resource.id);
        if (isSelected) {
          return [];
        } else {
          return [resource];
        }
      });
    } else {
      setSelectedResources((prev) => {
        const isSelected = prev.some((r) => r.id === resource.id);
        if (isSelected) {
          return prev.filter((r) => r.id !== resource.id);
        } else {
          return [...prev, resource];
        }
      });
    }
  };

  const handleFolderDoubleClick = (folder: Resource) => {
    if (folder.kind !== "folder") return;

    setCurrentFolderId(folder.id);
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    const index = folderPath.findIndex((f) => f.id === folderId);
    if (index !== -1) {
      setFolderPath(folderPath.slice(0, index + 1));
    }
  };

  const handleConfirm = () => {
    closeLibrary(selectedResources);
  };

  const handleCancel = () => {
    cancelLibrary();
  };

  const isResourceSelected = (resourceId: string) => {
    return selectedResources.some((r) => r.id === resourceId);
  };

  const refreshResources = async () => {
    if (!config?.libraryId) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedResources = await getLibraryResources(config.libraryId);
      setResources(fetchedResources);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  const handleCreateFolderClick = () => {
    handleActionMenuClose();
    setCreateFolderOpen(true);
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!config?.libraryId) return;

    setActionLoading(true);
    try {
      await createFolder(folderName, config.libraryId, currentFolderId);
      setCreateFolderOpen(false);
      await refreshResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameClick = (resource: Resource) => {
    setSelectedResourceForAction(resource);
    setRenameDialogOpen(true);
  };

  const handleRename = async (resourceId: string, newName: string) => {
    setActionLoading(true);
    try {
      await renameResource(resourceId, newName);
      setRenameDialogOpen(false);
      setSelectedResourceForAction(null);
      await refreshResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (resource: Resource) => {
    setSelectedResourceForAction(resource);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedResourceForAction) return;

    setActionLoading(true);
    try {
      await deleteResource(selectedResourceForAction.id);
      setDeleteDialogOpen(false);
      setSelectedResourceForAction(null);
      await refreshResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resource");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadClick = () => {
    handleActionMenuClose();
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !config?.libraryId) return;

    setUploadProgress(true);
    setUploadProgressPercent(0);
    setError(null);

    try {
      const uploadResult = await uploadFileToS3(file, {
        onProgress: (percent) => {
          setUploadProgressPercent(percent);
        },
      });

      const fileExtension = file.name.split('.').pop() || '';
      await createFileResource(
        uploadResult.fileName,
        config.libraryId,
        currentFolderId,
        uploadResult.url,
        uploadResult.fileSize,
        uploadResult.fileType,
        fileExtension,
        uploadResult.thumbnailUrl || null
      );

      await refreshResources();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploadProgress(false);
      setUploadProgressPercent(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!open || !config) return null;

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6">
              Thư viện tài liệu
            </Typography>
            <IconButton
              color="primary"
              onClick={handleActionMenuOpen}
              size="small"
            >
              <AddIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <LibraryBreadcrumbs folderPath={folderPath} onNavigate={handleBreadcrumbClick} />
          </Box>

          {uploadProgress && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgressPercent} />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Đang upload... {uploadProgressPercent}%
              </Typography>
            </Box>
          )}

        {loading ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Loading resources...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="error">
              {error}
            </Typography>
          </Box>
        ) : displayedResources.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Typography color="text.secondary">
              Không có tài liệu
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {displayedResources.map((resource: Resource) => {
              const selected = isResourceSelected(resource.id);

              return (
                <Grid size={{
                  xs: 12,
                  sm: 6,
                  md: 3,
                  lg: 2,
                }} key={resource.id}>
                  <ResourceCard
                    resource={resource}
                    selected={selected}
                    onClick={() => handleResourceClick(resource)}
                    onDoubleClick={() => handleFolderDoubleClick(resource)}
                    onRename={handleRenameClick}
                    onDelete={handleDeleteClick}
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleCancel}>Đóng</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
          >
            Xác nhận ({selectedResources.length})
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={handleCreateFolderClick}>
          <ListItemIcon>
            <CreateNewFolderIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tạo thư mục mới</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleUploadClick}>
          <ListItemIcon>
            <UploadFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tải lên từ máy tính</ListItemText>
        </MenuItem>
      </Menu>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onConfirm={handleCreateFolder}
        loading={actionLoading}
      />

      <RenameResourceDialog
        open={renameDialogOpen}
        resource={selectedResourceForAction}
        onClose={() => {
          setRenameDialogOpen(false);
          setSelectedResourceForAction(null);
        }}
        onConfirm={handleRename}
        loading={actionLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        resource={selectedResourceForAction}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedResourceForAction(null);
        }}
        onConfirm={handleDelete}
        loading={actionLoading}
      />
    </>
  );
}

