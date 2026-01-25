"use client";

import React, { useState } from "react";
import { CloudUpload } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import * as XLSX from "xlsx";

import useNotifications from "@/hooks/useNotifications/useNotifications";
import type { BranchImportRow } from "@/types/dto/branches";
import { useImportBranchesMutation } from "../operations/mutation";

interface ImportBranchDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

export function ImportBranchDialog({
  open,
  onClose,
  organizationId,
  onSuccess,
}: ImportBranchDialogProps) {
  const notifications = useNotifications();
  const [file, setFile] = useState<File | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const { mutateAsync: importBranches, isPending } = useImportBranchesMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError(
        "Định dạng file không hợp lệ. Vui lòng chọn file .xlsx hoặc .csv"
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setImportErrors([]);
    setImportSuccess(false);
  };

  const parseFile = async (file: File): Promise<BranchImportRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let workbook: XLSX.WorkBook;

          if (file.name.endsWith(".csv")) {
            const text = data as string;
            workbook = XLSX.read(text, { type: "string" });
          } else {
            const arrayBuffer = data as ArrayBuffer;
            workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
          }

          const firstSheet = workbook.Sheets[workbook.SheetNames[0]!];
          if (!firstSheet) {
            reject(new Error("File không có dữ liệu"));
            return;
          }

          const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet, { header: 1 });

          if (jsonData.length < 2) {
            reject(new Error("File phải có ít nhất 1 dòng dữ liệu"));
            return;
          }

          // Parse header to find columns
          const headers = (jsonData[0] as any[]).map((h) => String(h || "").trim());
          const nameIndex = headers.findIndex(
            (h) => h === "Tên chi nhánh" || h === "name" || h === "Name"
          );
          const codeIndex = headers.findIndex(
            (h) => h === "Mã chi nhánh" || h === "code" || h === "Code"
          );
          const addressIndex = headers.findIndex(
            (h) => h === "Địa điểm" || h === "address" || h === "Address"
          );

          if (nameIndex === -1) {
            reject(
              new Error(
                'File phải có cột "Tên chi nhánh" hoặc "name"'
              )
            );
            return;
          }

          if (codeIndex === -1) {
            reject(
              new Error(
                'File phải có cột "Mã chi nhánh" hoặc "code"'
              )
            );
            return;
          }

          if (addressIndex === -1) {
            reject(
              new Error(
                'File phải có cột "Địa điểm" hoặc "address"'
              )
            );
            return;
          }

          // Parse data rows
          const rows: BranchImportRow[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const values = jsonData[i] as any[];
            if (values && values[nameIndex] && values[codeIndex] && values[addressIndex]) {
              rows.push({
                name: String(values[nameIndex] || "").trim(),
                code: String(values[codeIndex] || "").trim(),
                address: String(values[addressIndex] || "").trim(),
              });
            }
          }

          resolve(rows);
        } catch {
          reject(
            new Error("Không thể đọc file. Vui lòng kiểm tra định dạng file.")
          );
        }
      };

      reader.onerror = () => {
        reject(new Error("Lỗi khi đọc file"));
      };

      if (file.name.endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setError("");
      setImportErrors([]);
      setImportSuccess(false);

      // Parse file
      const rows = await parseFile(file);

      if (rows.length === 0) {
        setError("File không chứa dữ liệu hợp lệ");
        return;
      }

      // Import branches
      const result = await importBranches({
        branches: rows,
        organizationId,
      });

      if (result.success) {
        setImportSuccess(true);
        notifications.show(`Import thành công ${result.imported} chi nhánh!`, {
          severity: "success",
          autoHideDuration: 3000,
        });
        onSuccess?.();
        setTimeout(() => {
          onClose();
          handleReset();
        }, 2000);
      } else {
        setImportErrors(result.errors);
        notifications.show("Import thất bại. Vui lòng kiểm tra lỗi.", {
          severity: "error",
          autoHideDuration: 5000,
        });
      }
    } catch (error: any) {
      setError(error.message || "Có lỗi xảy ra khi import");
      notifications.show(error.message || "Có lỗi xảy ra khi import", {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setError("");
    setImportErrors([]);
    setImportSuccess(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import chi nhánh</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          {/* Instructions */}
          <Alert severity="info">
            <Typography variant="body2">
              File import cần có cột <strong>&quot;Tên chi nhánh&quot;</strong> hoặc{" "}
              <strong>&quot;name&quot;</strong>, <strong>&quot;Mã chi nhánh&quot;</strong> hoặc{" "}
              <strong>&quot;code&quot;</strong>, và <strong>&quot;Địa điểm&quot;</strong> hoặc{" "}
              <strong>&quot;address&quot;</strong>.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Định dạng file hỗ trợ: .xlsx, .csv
            </Typography>
          </Alert>

          {/* File upload area */}
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "action.hover",
              },
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <CloudUpload sx={{ fontSize: 48, color: "action.active", mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Kéo & thả file hoặc <strong>chọn file</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hỗ trợ: .xlsx, .csv
            </Typography>
          </Box>

          {/* Selected file info */}
          {file && (
            <Alert severity="success">
              <Typography variant="body2">
                <strong>Đã chọn:</strong> {file.name} (
                {(file.size / 1024).toFixed(2)} KB)
              </Typography>
            </Alert>
          )}

          {/* Error message */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Import result */}
          {importSuccess && (
            <Alert severity="success">Import thành công!</Alert>
          )}

          {importErrors.length > 0 && (
            <Alert severity="error">
              <Typography variant="body2" gutterBottom>
                <strong>Import thất bại.</strong> Có {importErrors.length} lỗi:
              </Typography>
              <List dense>
                {importErrors.slice(0, 10).map((err, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemText
                      primary={err}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                ))}
                {importErrors.length > 10 && (
                  <ListItem sx={{ py: 0 }}>
                    <ListItemText
                      primary={`... và ${importErrors.length - 10} lỗi khác`}
                      primaryTypographyProps={{
                        variant: "body2",
                        color: "text.secondary",
                      }}
                    />
                  </ListItem>
                )}
              </List>
            </Alert>
          )}

          {/* Loading indicator */}
          {isPending && (
            <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          {importSuccess ? "Đóng" : "Huỷ"}
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!file || isPending || importSuccess}
          startIcon={isPending && <CircularProgress size={20} />}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
}
