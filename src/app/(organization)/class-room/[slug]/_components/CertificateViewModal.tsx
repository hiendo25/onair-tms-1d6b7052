"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import Image from "next/image";

interface CertificateViewModalProps {
  open: boolean;
  onClose: () => void;
  certificateName: string;
  certificateImageUrl: string;
}

export default function CertificateViewModal({
  open,
  onClose,
  certificateName,
  certificateImageUrl,
}: CertificateViewModalProps) {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Fetch the image as a blob to handle CORS and external URLs
      const response = await fetch(certificateImageUrl);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${certificateName}.png`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Failed to download certificate:", error);
      // Fallback to direct link if fetch fails
      const link = document.createElement("a");
      link.href = certificateImageUrl;
      link.download = `${certificateName}.png`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight={700}>
            Xem chứng nhận
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            position: "relative",
            width: "100%",
            minHeight: 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {isImageLoading && (
            <Typography color="text.secondary">Đang tải chứng nhận...</Typography>
          )}
          <Image
            src={certificateImageUrl}
            alt={certificateName}
            width={1200}
            height={900}
            style={{
              width: "100%",
              height: "auto",
              objectFit: "contain",
              display: isImageLoading ? "none" : "block",
            }}
            onLoad={() => setIsImageLoading(false)}
            priority
          />
        </Box>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body1" fontWeight={600}>
            Bạn đã nhận được chứng nhận "{certificateName}"
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" size="small" disabled={isDownloading}>
          Hủy
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          size="small"
          startIcon={<DownloadIcon />}
          disabled={isDownloading}
        >
          {isDownloading ? "Đang tải..." : "Tải xuống"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
