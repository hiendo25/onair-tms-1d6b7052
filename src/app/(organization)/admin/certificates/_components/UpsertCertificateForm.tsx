"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { FormProvider, useForm } from "react-hook-form";

import { useOrganizationId } from "@/hooks/useOrganizationId";
import {
  CertificateFormSchema,
  certificateFormSchema,
} from "@/modules/certificates/certificate-form.schema";
import { useLibraryStore } from "@/modules/library/store/libraryProvider";
import { useUserOrganization } from "@/modules/organization";
import { certificateFramesRepository } from "@/repository";

import FrameSelectionGrid from "./FrameSelectionGrid";

export interface UpsertCertificateFormProps {
  initialData?: CertificateFormSchema & { id?: string };
  initialFrameUrl?: string;
  onSubmit: (data: CertificateFormSchema) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const UpsertCertificateForm: React.FC<UpsertCertificateFormProps> = ({
  initialData,
  initialFrameUrl,
  onSubmit,
  onCancel,
  isLoading: externalLoading = false,
}) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { organizationId } = useOrganizationId();
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);
  const openLibrary = useLibraryStore((state) => state.openLibrary);

  const [selectedFrameUrl, setSelectedFrameUrl] = useState<string>(initialFrameUrl || "");
  const [isCreatingFrame, setIsCreatingFrame] = useState(false);

  const methods = useForm<CertificateFormSchema>({
    resolver: zodResolver(certificateFormSchema),
    defaultValues: initialData || {
      name: "",
      frame_id: "",
      layout_config: {
        completion_title: "Chứng nhận hoàn thành",
        awarded_to: "Chứng nhận này được trao cho",
        program_completion: "Hoàn thành xuất sắc chương trình",
        issue_date_label: "Ngày phát hành",
        expiry_date_label: "Ngày hết hạn",
      },
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const selectedFrameId = watch("frame_id");

  const handleFrameSelect = (frameId: string, imageUrl: string) => {
    setValue("frame_id", frameId, { shouldValidate: true });
    setSelectedFrameUrl(imageUrl);
  };

  const handleUploadFrameFromLibrary = async () => {
    // Open library to select an image
    const selectedResources = await openLibrary({ mode: "single" });
    const resource = selectedResources[0];

    if (!resource || !resource.mime_type?.includes("image") || !resource.path) {
      enqueueSnackbar("Vui lòng chọn một ảnh từ thư viện", { variant: "warning" });
      return;
    }

    if (!organizationId || !currentEmployee?.id) {
      enqueueSnackbar("Không tìm thấy thông tin tổ chức", { variant: "error" });
      return;
    }

    try {
      setIsCreatingFrame(true);
      // Create a new frame record in the database with the selected image
      const newFrame = await certificateFramesRepository.createCertificateFrame({
        organization_id: organizationId,
        created_by: currentEmployee.id,
        image_url: resource.path,
      });

      // Select the newly created frame
      setValue("frame_id", newFrame.id, { shouldValidate: true });
      setSelectedFrameUrl(newFrame.image_url || "");

      // Invalidate frames query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["certificate-frames", organizationId],
      });

      enqueueSnackbar("Thêm khung mẫu thành công", { variant: "success" });
    } catch (error) {
      console.error("Error creating frame:", error);
      enqueueSnackbar("Không thể tạo khung mẫu", { variant: "error" });
    } finally {
      setIsCreatingFrame(false);
    }
  };

  const isSubmitting = externalLoading || isCreatingFrame;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Action Buttons at Top */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            sx={{ textTransform: "none" }}
          >
            {initialData ? "Cập nhật" : "Lưu mẫu"}
          </Button>
        </Box>

        <Stack spacing={3} className="bg-white rounded-xl overflow-hidden p-3 md:p-6 border border-gray-200">
          <Typography variant="h5" component="h4">
            Thông tin mẫu chứng nhận
          </Typography>

          {/* Main Content */}
          <Grid container spacing={3}>
            {/* Left Side - Form */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                {/* Template Name */}
                <Box>
                  <Typography variant="body1" fontWeight={500} mb={1}>
                    Tên mẫu chứng nhận <span style={{ color: "red" }}>*</span>
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Nhập tên mẫu chứng nhận"
                    {...register("name")}
                    disabled={isSubmitting}
                    error={!!errors.name}
                    helperText={errors.name?.message || "Tối đa 40 ký tự"}
                    inputProps={{ maxLength: 40 }}
                  />
                </Box>

                {/* Frame Selection */}
                <Box>
                  <FrameSelectionGrid
                    selectedFrameId={selectedFrameId}
                    onFrameSelect={handleFrameSelect}
                  />
                  {errors.frame_id && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {errors.frame_id.message}
                    </Typography>
                  )}
                </Box>

                {/* Upload Frame from Library */}
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    Tải khung mẫu lên
                  </Typography>
                  <Typography className="text-xs mb-4">
                    Chọn khung viền có sẵn của bạn
                  </Typography>
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <Typography className="text-xs">
                      Kích thước chuẩn: <strong>1596 × 1200 px</strong>
                    </Typography>
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <Typography className="text-xs">File đuôi jpg, png, svg</Typography>
                    <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                    <Typography className="text-xs">Tối đa 5MB</Typography>
                  </div>
                  <Box
                    onClick={handleUploadFrameFromLibrary}
                    className="bg-gray-100 rounded-xl border border-dashed border-gray-300 flex items-center justify-center cursor-pointer"
                    sx={{
                      width: "100%",
                      maxWidth: "480px",
                      aspectRatio: "21/9",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Image
                        src="/assets/icons/upload-cloud.svg"
                        width={80}
                        height={40}
                        alt="upload icon"
                        className="mb-3 mx-auto"
                      />
                      <Typography
                        sx={(theme) => ({
                          color: theme.palette.primary.dark,
                          backgroundColor: theme.palette.primary.light,
                          fontWeight: "bold",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                        })}
                      >
                        Tải ảnh lên
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Stack>
            </Grid>

            {/* Right Side - Layout Config & Preview */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={3}>
                {/* Layout Configuration */}
                <Box>
                  <Typography variant="body1" fontWeight={500} mb={2}>
                    Cấu hình nội dung
                  </Typography>
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Chứng nhận hoàn thành"
                      placeholder="Chứng nhận hoàn thành"
                      {...register("layout_config.completion_title")}
                      disabled={isSubmitting}
                      error={!!errors.layout_config?.completion_title}
                      helperText={errors.layout_config?.completion_title?.message}
                    />
                    <TextField
                      fullWidth
                      label="Chứng nhận này được trao cho"
                      placeholder="Chứng nhận này được trao cho"
                      {...register("layout_config.awarded_to")}
                      disabled={isSubmitting}
                      error={!!errors.layout_config?.awarded_to}
                      helperText={errors.layout_config?.awarded_to?.message}
                    />
                    <TextField
                      fullWidth
                      label="Hoàn thành xuất sắc chương trình"
                      placeholder="Hoàn thành xuất sắc chương trình"
                      {...register("layout_config.program_completion")}
                      disabled={isSubmitting}
                      error={!!errors.layout_config?.program_completion}
                      helperText={errors.layout_config?.program_completion?.message}
                    />
                    <TextField
                      fullWidth
                      label="Ngày phát hành"
                      placeholder="Ngày phát hành"
                      {...register("layout_config.issue_date_label")}
                      disabled={isSubmitting}
                      error={!!errors.layout_config?.issue_date_label}
                      helperText={errors.layout_config?.issue_date_label?.message}
                    />
                    <TextField
                      fullWidth
                      label="Ngày hết hạn"
                      placeholder="Ngày hết hạn"
                      {...register("layout_config.expiry_date_label")}
                      disabled={isSubmitting}
                      error={!!errors.layout_config?.expiry_date_label}
                      helperText={errors.layout_config?.expiry_date_label?.message}
                    />
                  </Stack>
                </Box>

                {/* Preview */}
                <Box>
                  <Typography variant="body1" fontWeight={500} mb={1.5}>
                    Xem trước
                  </Typography>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      border: 1,
                      borderColor: "divider",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Base certificate image */}
                      <Image
                        src="/assets/images/certificate-standard.png"
                        width={1944}
                        height={1458}
                        alt="Certificate"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      {/* Frame overlay */}
                      {selectedFrameUrl && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${selectedFrameUrl})`,
                            backgroundSize: "100% 100%",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default UpsertCertificateForm;
