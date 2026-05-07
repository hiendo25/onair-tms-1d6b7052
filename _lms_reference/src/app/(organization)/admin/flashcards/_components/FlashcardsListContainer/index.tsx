"use client";

import React, { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import { useDialogs } from "@/hooks/useDialogs/useDialogs";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import {
  useDeleteFlashcardMutation,
  useGetFlashcardsQuery,
  useToggleFlashcardMutation,
} from "@/modules/flashcards";
import { SearchIcon } from "@/shared/assets/icons";
import { FlashcardCard } from "@/shared/ui/flashcards";

const FlashcardsListContainer: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const dialogs = useDialogs();
  const { organizationId } = useOrganizationId();

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Debounce search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch flashcards using query hook
  const { data: flashcardsData, isLoading } = useGetFlashcardsQuery({
    organizationId: organizationId || "",
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  // Delete mutation
  const { mutate: deleteFlashcard } = useDeleteFlashcardMutation();

  // Toggle mutation
  const { mutate: toggleFlashcard } = useToggleFlashcardMutation();

  const flashcards = flashcardsData?.data || [];
  const totalCount = flashcardsData?.count || 0;

  const handleCreateFlashcard = () => {
    router.push(PATHS.FLASHCARDS.CREATE);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleToggleFlashcard = (id: string, isActive: boolean) => {
    const newStatus = isActive ? "active" : "inactive";
    toggleFlashcard(
      { id, status: newStatus },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["flashcards", organizationId] });
          enqueueSnackbar(isActive ? "Flashcard đã được kích hoạt" : "Flashcard đã được vô hiệu hóa", {
            variant: "success",
          });
        },
        onError: () => {
          enqueueSnackbar("Không thể cập nhật trạng thái flashcard", { variant: "error" });
        },
      }
    );
  };

  const handleEditFlashcard = (id: string) => {
    router.push(PATHS.FLASHCARDS.EDIT(id));
  };

  const handleViewFlashcard = (id: string) => {
    router.push(PATHS.FLASHCARDS.DETAIL(id));
  };

  const handleDeleteFlashcard = (id: string, flashcardName: string) => async () => {
    const confirmed = await dialogs.confirm(
      `Bạn có chắc chắn muốn xóa "${flashcardName}"? Hành động này không thể hoàn tác.`,
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

    deleteFlashcard(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["flashcards", organizationId] });
        enqueueSnackbar("Xóa flashcard thành công", { variant: "success" });
      },
    });
  };

  const displayFlashcards = flashcards || [];

  return (
    <Box>
      {/* Search and Create Button */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <TextField
          placeholder="Tìm kiếm flashcard..."
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
          onClick={handleCreateFlashcard}
          sx={{
            borderRadius: 1,
            textTransform: "none",
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Tạo Flashcard
        </Button>
      </Stack>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && displayFlashcards.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography color="text.secondary">
            {searchQuery ? "Không tìm thấy flashcard" : "Chưa có flashcard nào"}
          </Typography>
        </Box>
      )}

      {/* Flashcard Grid */}
      {!isLoading && displayFlashcards.length > 0 && (
        <Grid container spacing={3}>
          {displayFlashcards.map((flashcard) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={flashcard.id}>
              <FlashcardCard
                id={flashcard.id}
                name={flashcard.name}
                imageUrl={flashcard.image_url}
                status={flashcard.status}
                // viewCount={flashcard.viewCount}
                // className={flashcard.className}
                // extraTag={flashcard.extraTag}
                isActive={flashcard.status === "active"}
                onToggle={handleToggleFlashcard}
                onView={handleViewFlashcard}
                onEdit={handleEditFlashcard}
                onDelete={handleDeleteFlashcard}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {!isLoading && totalCount > pageSize && (
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
    </Box>
  );
};

export default FlashcardsListContainer;
