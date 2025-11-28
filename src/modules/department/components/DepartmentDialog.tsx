"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
} from "../operations/mutation";
import type { DepartmentDto } from "@/types/dto/departments";
import { departmentRepository } from "@/repository";
import useNotifications from "@/hooks/useNotifications/useNotifications";

interface DepartmentFormData {
  name: string;
  organization_id: string;
}

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  department?: DepartmentDto | null;
  organizationId: string;
  onSuccess?: () => void;
}

export function DepartmentDialog({
  open,
  onClose,
  department,
  organizationId,
  onSuccess,
}: DepartmentDialogProps) {
  const isEditMode = !!department;
  const notifications = useNotifications();

  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    organization_id: organizationId,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof DepartmentFormData, string>>
  >({});

  const { mutateAsync: createDepartment, isPending: isCreating } =
    useCreateDepartmentMutation();
  const { mutateAsync: updateDepartment, isPending: isUpdating } =
    useUpdateDepartmentMutation();

  useEffect(() => {
    if (open) {
      if (department) {
        setFormData({
          name: department.name,
          organization_id: department.organization_id,
        });
      } else {
        setFormData({
          name: "",
          organization_id: organizationId,
        });
      }
      setErrors({});
    }
  }, [open, department, organizationId]);

  const handleInputChange = (field: keyof DepartmentFormData, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = async () => {
    const newErrors: Partial<Record<keyof DepartmentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên phòng ban không được để trống";
    } else if (formData.name.length > 100) {
      newErrors.name = "Tên phòng ban không được vượt quá 100 ký tự";
    } else {
      try {
				
        const nameExists = await departmentRepository.departmentRepository.checkNameExists(
          formData.name,
          formData.organization_id,
          department?.id
        );
        if (nameExists) {
          newErrors.name = "Tên phòng ban đã tồn tại";
        }
      } catch (error) {
        console.error("Failed to check name:", error);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      if (isEditMode && department) {
        await updateDepartment({
          id: department.id,
          name: formData.name,
        });
        notifications.show("Cập nhật phòng ban thành công!", {
          severity: "success",
        });
      } else {
        await createDepartment({
          name: formData.name,
          organization_id: formData.organization_id,
        });
        notifications.show("Tạo phòng ban thành công!", {
          severity: "success",
        });
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to save department:", error);
      notifications.show(
        error.message || "Có lỗi xảy ra khi lưu phòng ban",
        { severity: "error" }
      );
      setErrors({
        name: error.message || "Có lỗi xảy ra khi lưu phòng ban",
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  const isFormValid = formData.name.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEditMode ? "Chỉnh sửa phòng ban" : "Tạo phòng ban"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Tên phòng ban"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            inputProps={{ maxLength: 100 }}
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
