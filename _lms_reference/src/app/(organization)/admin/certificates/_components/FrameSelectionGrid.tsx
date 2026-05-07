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
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useDeleteCertificateFrameMutation } from "@/modules/certificates/operations/frame-mutation";
import { useGetCertificateFramesQuery } from "@/modules/certificates/operations/frame-query";
import { Trash01Icon } from "@/shared/assets/icons";

interface FrameSelectionGridProps {
  selectedFrameId?: string;
  onFrameSelect: (frameId: string, imageUrl: string) => void;
}

const FrameSelectionGrid: React.FC<FrameSelectionGridProps> = ({
  selectedFrameId,
  onFrameSelect,
}) => {
  const { organizationId } = useOrganizationId();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const [showAll, setShowAll] = useState(false);
  const [hoveredFrameId, setHoveredFrameId] = useState<string | null>(null);

  const { data, isLoading, error } = useGetCertificateFramesQuery({
    organizationId: organizationId || "",
    page: 1,
    pageSize: showAll ? 50 : 8,
  });

  const { mutate: deleteFrame } = useDeleteCertificateFrameMutation();

  // Transform data to include link counts
  const frames = (data?.data || []).map((frame: any) => ({
    ...frame,
    templatesCount: frame.certificate_templates?.[0]?.count || 0,
  }));

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

  const handleDeleteFrame = (frameId: string, templatesCount: number) => async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (templatesCount > 0) {
      return; // Button is disabled, should not trigger
    }

    const confirmed = await dialogs.confirm(
      "Bạn có chắc chắn muốn xóa khung mẫu này? Hành động này không thể hoàn tác.",
      {
        title: "Xác nhận xóa",
        okText: "Xóa",
        cancelText: "Hủy",
        severity: "error",
      }
    );

    if (!confirmed) {
      return;
    }

    deleteFrame(frameId, {
      onSuccess: () => {
        // If the deleted frame was selected, clear the selection
        if (selectedFrameId === frameId) {
          onFrameSelect("", "");
        }

        queryClient.invalidateQueries({
          queryKey: ["certificate-frames", organizationId],
        });
        enqueueSnackbar("Xóa khung mẫu thành công", { variant: "success" });
      },
      onError: (error) => {
        enqueueSnackbar(
          error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa khung mẫu",
          { variant: "error" }
        );
      },
    });
  };

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
        {frames.map((frame) => {
          const isHovered = hoveredFrameId === frame.id;
          const isLinked = frame.templatesCount > 0;

          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={frame.id}>
              <Card
                onClick={() => onFrameSelect(frame.id, frame.image_url || "")}
                onMouseEnter={() => setHoveredFrameId(frame.id)}
                onMouseLeave={() => setHoveredFrameId(null)}
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

                {/* Delete Button - Shows on hover */}
                {isHovered && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 2,
                    }}
                  >
                    <Tooltip
                      title={
                        isLinked
                          ? `Không thể xóa vì đã được sử dụng trong ${frame.templatesCount} mẫu chứng nhận`
                          : "Xóa khung mẫu"
                      }
                      placement="top"
                    >
                      <span>
                        <IconButton
                          size="small"
                          sx={{
                            bgcolor: "white",
                            width: 32,
                            height: 32,
                            color: isLinked ? "text.disabled" : "error.main",
                            "&:hover": {
                              bgcolor: isLinked ? "white" : "grey.100",
                            },
                            "&.Mui-disabled": {
                              bgcolor: "white",
                              color: "text.disabled",
                            },
                          }}
                          disabled={isLinked}
                          onClick={handleDeleteFrame(frame.id, frame.templatesCount)}
                        >
                          <Trash01Icon className="w-4 h-4" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                )}

                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    overflow: "hidden",
                    bgcolor: "grey.50",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={frame.image_url || "/assets/images/placeholder-image.png"}
                    alt="Certificate frame"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default FrameSelectionGrid;
