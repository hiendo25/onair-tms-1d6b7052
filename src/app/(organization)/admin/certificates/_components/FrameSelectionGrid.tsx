"use client";

import React, { useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";

import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useGetCertificateFramesQuery } from "@/modules/certificates/operations/frame-query";

interface FrameSelectionGridProps {
  selectedFrameId?: string;
  onFrameSelect: (frameId: string, imageUrl: string) => void;
}

const FrameSelectionGrid: React.FC<FrameSelectionGridProps> = ({
  selectedFrameId,
  onFrameSelect,
}) => {
  const { organizationId } = useOrganizationId();
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, error } = useGetCertificateFramesQuery({
    organizationId: organizationId || "",
    page: 1,
    pageSize: showAll ? 50 : 8,
  });

  const frames = data?.data || [];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "Failed to load frames"}
      </Alert>
    );
  }

  if (frames.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">
          Chưa có khung mẫu nào. Vui lòng tải lên khung mẫu mới.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Chọn khung có sẵn
        </Typography>
        {!showAll && frames.length === 8 && (
          <Button
            variant="text"
            size="small"
            onClick={() => setShowAll(true)}
            sx={{ textTransform: "none" }}
          >
            Xem thêm
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {frames.map((frame) => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={frame.id}>
            <Card
              onClick={() => onFrameSelect(frame.id, frame.image_url || "")}
              sx={{
                cursor: "pointer",
                position: "relative",
                border: selectedFrameId === frame.id ? 2 : 1,
                borderColor: selectedFrameId === frame.id ? "primary.main" : "divider",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "primary.light",
                },
              }}
            >
              {selectedFrameId === frame.id && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 1,
                  }}
                >
                  <CheckCircleIcon color="primary" />
                </Box>
              )}
              <CardMedia
                component="img"
                height="120"
                image={frame.image_url || "/assets/images/placeholder-image.png"}
                alt="Certificate frame"
                sx={{
                  objectFit: "cover",
                  bgcolor: "grey.50",
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FrameSelectionGrid;
