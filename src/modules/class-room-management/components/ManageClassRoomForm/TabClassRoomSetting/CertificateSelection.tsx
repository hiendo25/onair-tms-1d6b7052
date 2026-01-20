"use client";

import React from "react";
import {
  Box,
  Grid,
  MenuItem,
  Select,
  Typography,
  FormControl,
  Paper,
} from "@mui/material";

import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useGetCertificateTemplatesQuery } from "@/modules/certificates/operations/query";
import { useClassRoomStore } from "@/modules/class-room-management/store/class-room-context";
import CertificatePreview from "@/shared/ui/CertificatePreview";

const CertificateSelection: React.FC = () => {
  const { organizationId } = useOrganizationId();
  const selectedCertificate = useClassRoomStore((state) => state.state.selectedCertificate);
  const setSelectedCertificate = useClassRoomStore((state) => state.actions.setSelectedCertificate);

  const { data: certificatesData } = useGetCertificateTemplatesQuery({
    organizationId: organizationId || "",
    page: 1,
    pageSize: 100,
  });

  const certificates = certificatesData?.data || [];

  const handleCertificateChange = (certificateId: string) => {
    if (!certificateId) {
      setSelectedCertificate(null);
      return;
    }

    const certificate = certificates.find((c) => c.id === certificateId);
    if (certificate) {
      setSelectedCertificate({
        id: certificate.id,
        name: certificate.name || "",
        frameUrl: certificate.frame?.image_url || null,
      });
    }
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Chứng nhận sẽ được tự động cấp cho học viên khi hoàn thành lớp học theo điều kiện thiết lập.
      </Typography>

      <Grid container spacing={3}>
        {/* Left Side - Selection */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <FormControl fullWidth>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Chọn mẫu chứng nhận
              </Typography>
              <Select
                labelId="certificate-select-label"
                id="certificate-select"
                value={selectedCertificate?.id || ""}
                onChange={(e) => handleCertificateChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Không chọn</em>
                </MenuItem>
                {certificates.map((cert) => (
                  <MenuItem key={cert.id} value={cert.id}>
                    {cert.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Right Side - Preview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              Xem trước chứng nhận
            </Typography>
            {selectedCertificate ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "grey.50",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <CertificatePreview frameUrl={selectedCertificate.frameUrl} />

                {/* Certificate Info */}
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {selectedCertificate.name}
                  </Typography>
                </Box>
              </Paper>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  bgcolor: "grey.50",
                  border: 1,
                  borderColor: "divider",
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  Vui lòng chọn mẫu chứng nhận để xem trước
                </Typography>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CertificateSelection;
