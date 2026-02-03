"use client";

import React, { memo, useCallback, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SearchIcon from "@mui/icons-material/Search";
import { Box, InputAdornment,TextField, Typography } from "@mui/material";
import { useFormContext } from "react-hook-form";

import { useGetFlashcardsQuery } from "@/modules/flashcards/query";
import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";
import { ClassRoomFormValues } from "../classroom-form.schema";

interface FlashcardSelectorProps {}

const FlashcardSelector: React.FC<FlashcardSelectorProps> = () => {
  const { setValue, watch } = useFormContext<ClassRoomFormValues>();
  const currentOrganization = useUserOrganization((state) => state.currentOrganization);
  const organizationId = currentOrganization.orgId;
  const [search, setSearch] = useState("");

  const { data: flashcardsData, isPending } = useGetFlashcardsQuery(
    { page: 1, pageSize: 100, organizationId, search: search || undefined },
    { enabled: !!organizationId },
  );

  const flashcards = flashcardsData?.data || [];
  const selectedFlashcards = watch("flashcards") || [];

  const handleToggle = useCallback(
    (flashcardId: string) => {
      const isSelected = selectedFlashcards.includes(flashcardId);
      let newSelected: string[];

      if (isSelected) {
        // Remove from selection
        newSelected = selectedFlashcards.filter((id) => id !== flashcardId);
      } else {
        // Add to selection (at the end)
        newSelected = [...selectedFlashcards, flashcardId];
      }

      setValue("flashcards", newSelected, { shouldValidate: true });
    },
    [selectedFlashcards, setValue],
  );

  const getSelectionIndex = (flashcardId: string) => {
    const index = selectedFlashcards.indexOf(flashcardId);
    return index >= 0 ? index + 1 : null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm kiếm flashcard..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
      />

      {/* Flashcard grid */}
      {isPending ? (
        <Typography color="text.secondary">Đang tải...</Typography>
      ) : flashcards.length === 0 ? (
        <Typography color="text.secondary">
          {search ? "Không tìm thấy flashcard nào" : "Không có flashcard nào"}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 2,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {flashcards.map((flashcard) => {
            const isSelected = selectedFlashcards.includes(flashcard.id);
            const selectionIndex = getSelectionIndex(flashcard.id);

            return (
              <Box
                key={flashcard.id}
                onClick={() => handleToggle(flashcard.id)}
                sx={{
                  position: "relative",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "primary.50" : "background.paper",
                  cursor: "pointer",
                }}
              >
                {/* Selection order badge */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: isSelected ? "primary.main" : "grey.200",
                    color: isSelected ? "white" : "grey.500",
                  }}
                >
                  {isSelected ? (
                    selectionIndex ? (
                      <Typography variant="caption" fontWeight="bold">
                        {selectionIndex}
                      </Typography>
                    ) : (
                      <CheckCircleIcon fontSize="small" />
                    )
                  ) : (
                    <RadioButtonUncheckedIcon fontSize="small" />
                  )}
                </Box>

                {/* Flashcard name */}
                <Typography variant="body2" fontWeight="medium" noWrap pr={4}>
                  {flashcard.name || "Untitled"}
                </Typography>

                {/* Image thumbnail if available */}
                {flashcard.image_url && (
                  <Box
                    sx={{
                      mt: 1,
                      height: 60,
                      borderRadius: 1,
                      overflow: "hidden",
                      bgcolor: "grey.100",
                    }}
                  >
                    <Box
                      component="img"
                      src={flashcard.image_url}
                      alt={flashcard.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </div>
  );
};

export default memo(FlashcardSelector);
