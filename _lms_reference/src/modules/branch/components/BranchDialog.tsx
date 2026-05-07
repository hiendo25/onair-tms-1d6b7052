"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  SvgIcon,
  TextField,
} from "@mui/material";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import { branchRepository } from "@/repository/branch";
import type { BranchDto } from "@/types/dto/branches";
import { useCreateBranchMutation, useGenerateBranchCodeMutation, useUpdateBranchMutation } from "../operations/mutation";

interface BranchFormData {
  name: string;
  code: string;
  address: string;
  organization_id: string;
}

interface BranchDialogProps {
  open: boolean;
  onClose: () => void;
  branch?: BranchDto | null;
  organizationId: string;
  onSuccess?: () => void;
}

export function BranchDialog({
  open,
  onClose,
  branch,
  organizationId,
  onSuccess,
}: BranchDialogProps) {
  const isEditMode = !!branch;
  const notifications = useNotifications();

  const [formData, setFormData] = useState<BranchFormData>({
    name: "",
    code: "",
    address: "",
    organization_id: organizationId,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof BranchFormData, string>>
  >({});
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isAutoGenerateCode, setIsAutoGenerateCode] = useState(true);

  const { mutateAsync: createBranch, isPending: isCreating } = useCreateBranchMutation();
  const { mutateAsync: updateBranch, isPending: isUpdating } = useUpdateBranchMutation();
  const { mutateAsync: generateCode, isPending: isGeneratingCode } = useGenerateBranchCodeMutation();

  useEffect(() => {
    const generateBranchCode = async () => {
      if (!organizationId) return;
      
      try {
        const result = await generateCode(organizationId);
        setFormData((prev) => ({ ...prev, code: result.data.code }));
      } catch (error) {
        console.error("Error generating branch code:", error);
        notifications.show("Có lỗi xảy ra khi tạo mã chi nhánh", {
          severity: "error",
          autoHideDuration: 3000,
        });
      }
    };

    if (open) {
      if (branch) {
        // Edit mode: use existing code, manual mode
        setFormData({
          name: branch.name,
          code: branch.code,
          address: branch.address,
          organization_id: branch.organization_id,
        });
        setIsAutoGenerateCode(false);
      } else {
        // Create mode: auto-generate code by default
        setFormData({
          name: "",
          code: "",
          address: "",
          organization_id: organizationId,
        });
        setIsAutoGenerateCode(true);
        // Auto-generate code when dialog opens in create mode
        if (organizationId) {
          generateBranchCode();
        }
      }
      setErrors({});
    }
  }, [open, branch, organizationId, notifications, generateCode]);

  const handleInputChange = (field: keyof BranchFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleToggleCodeMode = async () => {
    const newMode = !isAutoGenerateCode;
    setIsAutoGenerateCode(newMode);
    
    if (newMode) {
      // Switched to auto-generate mode - generate new code
      if (!organizationId) return;
      
      try {
        const result = await generateCode(organizationId);
        setFormData((prev) => ({ ...prev, code: result.data.code }));
      } catch (error) {
        console.error("Error generating branch code:", error);
        notifications.show("Có lỗi xảy ra khi tạo mã chi nhánh", {
          severity: "error",
          autoHideDuration: 3000,
        });
      }
    } else {
      // Switched to manual mode - clear the code
      setFormData((prev) => ({ ...prev, code: "" }));
    }
  };

  const validateForm = async () => {
    const newErrors: Partial<Record<keyof BranchFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên chi nhánh không được để trống";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên chi nhánh không được vượt quá 100 ký tự";
    } else {
      try {
        setIsCheckingName(true);
        const nameExists = await branchRepository.checkNameExists(
          formData.name,
          formData.organization_id,
          branch?.id
        );
        if (nameExists) {
          newErrors.name = "Tên chi nhánh đã tồn tại";
        }
      } catch (error) {
        console.error("Failed to check name:", error);
      } finally {
        setIsCheckingName(false);
      }
    }

    if (!formData.code.trim()) {
      newErrors.code = "Mã chi nhánh không được để trống";
    } else if (formData.code.length > 50) {
      newErrors.code = "Mã chi nhánh không được vượt quá 50 ký tự";
    } else {
      // Check if code already exists
      try {
        const codeExists = await branchRepository.checkCodeExists(
          formData.code,
          formData.organization_id,
          branch?.id
        );
        if (codeExists) {
          newErrors.code = "Mã chi nhánh đã tồn tại";
        }
      } catch (error) {
        console.error("Failed to check code:", error);
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Địa điểm không được để trống";
    } else if (formData.address.length > 255) {
      newErrors.address = "Địa điểm không được vượt quá 255 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      if (isEditMode && branch) {
        await updateBranch({
          id: branch.id,
          name: formData.name,
          code: formData.code,
          address: formData.address,
        });
        notifications.show("Cập nhật chi nhánh thành công!", {
          severity: "success",
          autoHideDuration: 3000,
        });
      } else {
        await createBranch({
          name: formData.name,
          code: formData.code,
          address: formData.address,
          organization_id: formData.organization_id,
        });
        notifications.show("Tạo chi nhánh thành công!", {
          severity: "success",
          autoHideDuration: 3000,
        });
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to save branch:", error);
      notifications.show(
        error.message || "Có lỗi xảy ra khi lưu chi nhánh",
        {
          severity: "error",
          autoHideDuration: 5000,
        }
      );
    }
  };

  const isLoading = isCreating || isUpdating || isCheckingName || isGeneratingCode;
  const isFormValid = formData.name.trim() && formData.code.trim() && formData.address.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Chỉnh sửa chi nhánh" : "Tạo chi nhánh"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Tên chi nhánh"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Mã chi nhánh"
            required
            fullWidth
            value={formData.code}
            onChange={(e) => handleInputChange("code", e.target.value)}
            error={!!errors.code}
            helperText={
              errors.code ||
              (isAutoGenerateCode
                ? "Hệ thống tự sinh mã"
                : "Nhập mã chi nhánh thủ công")
            }
            disabled={isLoading || isAutoGenerateCode}
            inputProps={{ maxLength: 50 }}
            InputProps={{
              endAdornment: !isEditMode && (
                <IconButton
                  onClick={handleToggleCodeMode}
                  disabled={isLoading || isGeneratingCode}
                  edge="end"
                  size="small"
                  sx={{ ml: 1 }}
                  title={isAutoGenerateCode ? "Chuyển sang nhập thủ công" : "Chuyển sang tự động"}
                >
                  <SvgIcon sx={{ fontSize: 20 }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="20"
                      viewBox="0 0 18 20"
                      fill="none"
                    >
                      <path
                        d="M17 15H1M1 15L5 11M1 15L5 19M1 5H17M17 5L13 1M17 5L13 9"
                        stroke="#0050FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </SvgIcon>
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Địa điểm"
            required
            fullWidth
            multiline
            rows={3}
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            disabled={isLoading}
            inputProps={{ maxLength: 255 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Huỷ
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid || isLoading}
          startIcon={isLoading && <CircularProgress size={20} />}
        >
          {isEditMode ? "Lưu" : "Tạo mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
