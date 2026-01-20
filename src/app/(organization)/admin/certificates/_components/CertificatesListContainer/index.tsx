"use client";

import React, { useEffect, useState, useTransition } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { useDeleteCertificateTemplateMutation } from "@/modules/certificates/operations/mutation";
import { useGetCertificateTemplatesQuery } from "@/modules/certificates/operations/query";
import { Edit02Icon, EyeIcon, SearchIcon, Trash01Icon } from "@/shared/assets/icons";
import CertificatePreview from "@/shared/ui/CertificatePreview";
import CertificateViewModal from "@/shared/ui/CertificateViewModal";

const CertificatesListContainer: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const { organizationId } = useOrganizationId();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isTransition, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [previewCertificate, setPreviewCertificate] = useState<{
    name: string;
    frameUrl?: string | null;
  } | null>(null);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch certificates using query hook
  const { data, isLoading, isPending } = useGetCertificateTemplatesQuery({
    organizationId: organizationId || "",
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  // Delete mutation
  const { mutate: deleteCertificate } = useDeleteCertificateTemplateMutation();

  const certificates = data?.data || [];
  const totalCount = data?.count || 0;

  const handleCreateCertificate = () => {
    startTransition(() => {
      router.push(PATHS.CERTIFICATES.CREATE);
    });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleViewCertificate = (name: string, frameUrl?: string | null) => () => {
    setPreviewCertificate({ name, frameUrl });
  };

  const handleClosePreview = () => {
    setPreviewCertificate(null);
  };

  const handleDeleteCertificate = (id: string, templateName: string) => async () => {
    const confirmed = await dialogs.confirm(
      `Bạn có chắc chắn muốn xóa "${templateName}"? Hành động này không thể hoàn tác.`,
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

    deleteCertificate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["certificate-templates", organizationId],
        });
        enqueueSnackbar("Xóa chứng nhận thành công", { variant: "success" });
      },
    });
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: { xs: "100%", sm: 300 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateCertificate}
          loading={isTransition}
          disabled={isTransition}
        >
          Tạo mẫu chứng nhận
        </Button>
      </Stack>

      {/* Loading State */}
      {(isLoading || isPending) && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && !isPending && certificates.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            {searchQuery ? "Không tìm thấy mẫu chứng nhận" : "Chưa có mẫu chứng nhận nào"}
          </Typography>
        </Box>
      )}

      {/* Grid of Certificate Cards */}
      {!isLoading && !isPending && certificates.length > 0 && (
        <Grid container spacing={3}>
          {certificates.map((certificate) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={certificate.id}>
              <Card
                sx={{
                  position: "relative",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  border: 1,
                  borderColor: "divider",
                  "&:hover": {
                    "& .card-actions": {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Certificate Preview with Actions Overlay */}
                <Box sx={{ position: "relative" }}>
                  <CertificatePreview frameUrl={certificate.frame?.image_url} />

                  {/* Card Actions Overlay - Centered on preview only */}
                  <Box
                    className="card-actions"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      bgcolor: "rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <IconButton
                      sx={{
                        bgcolor: "white",
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                      title="Xem"
                      onClick={handleViewCertificate(
                        certificate.name || "Mẫu chứng nhận",
                        certificate.frame?.image_url
                      )}
                    >
                      <EyeIcon className="w-5 h-5" />
                    </IconButton>
                    <Link href={PATHS.CERTIFICATES.EDIT(certificate.id)}>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          "&:hover": {
                            bgcolor: "grey.100",
                          },
                        }}
                        title="Chỉnh sửa"
                      >
                        <Edit02Icon className="w-5 h-5" />
                      </IconButton>
                    </Link>
                    <IconButton
                      sx={{
                        bgcolor: "white",
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        color: "error.main",
                        "&:hover": {
                          bgcolor: "grey.100",
                        },
                      }}
                      title="Xóa"
                      onClick={handleDeleteCertificate(
                        certificate.id,
                        certificate.name || "mẫu chứng nhận"
                      )}
                    >
                      <Trash01Icon className="w-5 h-5" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Certificate Info */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    py: 1.5,
                    "&:last-child": {
                      paddingBottom: 1.5,
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      textAlign: "center",
                    }}
                  >
                    {certificate.name || "Chưa có tên"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!isLoading && !isPending && totalCount > pageSize && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Trước
            </Button>
            <Typography variant="body2" sx={{ mx: 2 }}>
              Trang {page} / {Math.ceil(totalCount / pageSize)}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={page >= Math.ceil(totalCount / pageSize)}
              onClick={() => setPage(page + 1)}
            >
              Sau
            </Button>
          </Stack>
        </Box>
      )}

      {/* Certificate Preview Modal */}
      {previewCertificate && (
        <CertificateViewModal
          open={!!previewCertificate}
          onClose={handleClosePreview}
          certificateName={previewCertificate.name}
          previewComponent={
            <CertificatePreview
              frameUrl={previewCertificate.frameUrl}
              aspectRatio="4 / 3"
            />
          }
        />
      )}
    </Box>
  );
};

export default CertificatesListContainer;
