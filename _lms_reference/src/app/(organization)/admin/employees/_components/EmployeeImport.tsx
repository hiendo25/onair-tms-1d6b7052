"use client";
import * as React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import ErrorIcon from "@mui/icons-material/Error";
import PeopleIcon from "@mui/icons-material/People";
import { Alert, AlertTitle, Box, Button, Card, IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { alpha } from "@mui/material/styles";
import { useRouter } from "next/navigation";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import type { ValidateEmployeeFileResultDto } from "@/types/dto/employees";

import EmployeeValidationTable, { DEFAULT_TEMPLATE_STRUCTURE } from "./EmployeeValidationTable";

const EmployeeImport = () => {
  const router = useRouter();
  const notifications = useNotifications();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState<ValidateEmployeeFileResultDto | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.endsWith(".csv") &&
      !selectedFile.name.endsWith(".xlsx")
    ) {
      notifications.show("Chỉ hỗ trợ file .csv hoặc .xlsx", {
        severity: "error",
        autoHideDuration: 5000,
      });
      return;
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB in bytes
    if (selectedFile.size > maxSize) {
      notifications.show("Kích thước file không được vượt quá 4MB", {
        severity: "error",
        autoHideDuration: 5000,
      });
      return;
    }

    setFile(selectedFile);
    validateFile(selectedFile);
  };

  const validateFile = async (file: File) => {
    setIsProcessing(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/employees/validate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to validate file");
      }

      const validation: ValidateEmployeeFileResultDto = await response.json();
      setValidationResult(validation);
    } catch (error) {
      console.error("Error validating file:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xác thực file";
      notifications.show(errorMessage, {
        severity: "error",
        autoHideDuration: 5000,
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setValidationResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (!file) {
      notifications.show("Vui lòng chọn file để import", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (!validationResult || validationResult.invalidCount > 0) {
      notifications.show("Vui lòng sửa các lỗi trước khi import", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (validationResult.validRecords.length === 0) {
      notifications.show("Không có bản ghi hợp lệ để import", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/employees/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import employees");
      }

      const result = await response.json();

      if (result.failedCount === 0) {
        notifications.show(`Import thành công ${result.successCount} nhân viên!`, {
          severity: "success",
          autoHideDuration: 3000,
        });

        setTimeout(() => {
          router.push("/admin/employees");
        }, 2000);
      } else {
        notifications.show(`Import hoàn tất: ${result.successCount} thành công, ${result.failedCount} thất bại`, {
          severity: "warning",
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      console.error("Error importing employees:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi import nhân viên";
      notifications.show(errorMessage, {
        severity: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const totalCount = validationResult?.totalCount || 0;
  const validCount = validationResult?.validCount || 0;
  const errorCount = validationResult?.invalidCount || 0;

  const startImportable = !(!file || errorCount > 0 || isProcessing || isImporting);

  return (
    <Box sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* File Upload Area */}
        <Card
          sx={{
            p: 2,
          }}
        >
          <Stack
            sx={{
              gap: 2,
            }}
          >
            <Box
              sx={{
                p: 4,
                border: "2px dashed",
                borderColor: isDragging ? "primary.main" : "divider",
                borderRadius: 2,
                bgcolor: isDragging ? "action.hover" : "background.paper",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "action.hover",
                },
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Button
                startIcon={<CloudUploadIcon sx={{ fontSize: 48, color: "text.secondary" }} />}
                color="inherit"
                size="small"
                disabled
                sx={{
                  mb: 2,
                }}
              >
                Tải lên
              </Button>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Kéo thả file vào đây hoặc chọn file
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hỗ trợ .xlsx, .csv (tối đa 4MB)
              </Typography>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
            </Box>

            {isProcessing && (
              <Box>
                <LinearProgress />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Đang xử lý file...
                </Typography>
              </Box>
            )}

            {/* Uploaded File Display */}
            {file && !isProcessing && (
              <Box
                sx={{
                  margin: "0 auto !important",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "40%",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DescriptionIcon sx={{ color: "success.main" }} />
                  <Typography color="text.primary" variant="body2" fontWeight={700}>
                    {file.name}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={handleRemoveFile} color="inherit">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Stack>
        </Card>

        {/* Statistics Cards - Only show if file is uploaded */}
        {file && validationResult && (
          <Card
            sx={{
              p: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: (theme) => alpha(theme.palette.grey[300], 0.2),
                    borderColor: (theme) => alpha(theme.palette.grey[300], 0.2),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PeopleIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Số lượng nhân viên
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {totalCount}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: (theme) => alpha(theme.palette.success.light, 0.2),
                    borderColor: (theme) => alpha(theme.palette.success.light, 0.2),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Hợp lệ
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {validCount}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
              <Grid size={4}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: (theme) => alpha(theme.palette.error.light, 0.2),
                    borderColor: (theme) => alpha(theme.palette.error.light, 0.2),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <ErrorIcon sx={{ fontSize: 40, color: "error.main" }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Lỗi
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {errorCount}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            </Grid>

            {/* Success/Error Display */}
            {errorCount === 0 ? (
              <Alert
                severity="success"
                icon={
                  <CheckCircleIcon
                    sx={{
                      color: "success.main",
                    }}
                  />
                }
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.success.light, 0.3),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.success.light, 0.3),
                  color: "success.darker",
                  mt: 2,
                })}
              >
                <AlertTitle>
                  <Typography variant="body2">Không có lỗi nào trong tệp. Bạn có thể tiếp tục import ngay.</Typography>
                </AlertTitle>
              </Alert>
            ) : (
              /* Data Preview Table - Show only when there are invalid rows */
              <Box sx={{ mt: 2 }}>
                <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle1" color="text.primary">
                    Xem trước dữ liệu
                  </Typography>
                </Box>

                <EmployeeValidationTable
                  validationResult={validationResult}
                  templateColumns={DEFAULT_TEMPLATE_STRUCTURE.columns}
                />
              </Box>
            )}
          </Card>
        )}

        {startImportable && (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" onClick={handleImport}>
              {isImporting ? "Đang import..." : "Thêm hàng loạt"}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default EmployeeImport;
