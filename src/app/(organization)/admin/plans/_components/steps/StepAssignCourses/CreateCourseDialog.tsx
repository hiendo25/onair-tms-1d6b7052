"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Controller, useForm } from "react-hook-form";
import { Course } from "@/modules/plans/plan-form.schema";

interface CreateCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateCourse: (course: { title: string; description?: string }) => void;
  isSubmitting?: boolean;
}

interface CreateCourseFormData {
  title: string;
  notes: string;
}

export default function CreateCourseDialog({
  open,
  onClose,
  onCreateCourse,
  isSubmitting = false,
}: CreateCourseDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCourseFormData>({
    defaultValues: {
      title: "",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: CreateCourseFormData) => {
    onCreateCourse({
      title: data.title,
      description: data.notes,
    });
    reset();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmit)(e);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Tạo môn học
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Course Title Field */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Tên môn học
              </Typography>
              <Controller
                name="title"
                control={control}
                rules={{
                  required: "Tên môn học không được bỏ trống",
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    placeholder="Nhập tên môn học"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    size="medium"
                  />
                )}
              />
            </Box>

            {/* Notes Field */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Ghi chú
              </Typography>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Nhập ghi chú"
                    size="medium"
                  />
                )}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            type="button"
            onClick={handleClose}
            variant="outlined"
            sx={{ textTransform: "none", minWidth: 100 }}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ textTransform: "none", minWidth: 100 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo môn học"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
