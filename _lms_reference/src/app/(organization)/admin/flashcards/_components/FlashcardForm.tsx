"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { FormProvider, useForm } from "react-hook-form";

import { PATHS } from "@/constants/path.constant";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import {
  useCreateFlashcardMutation,
  useGetFlashcardByIdQuery,
  useUpdateFlashcardMutation,
} from "@/modules/flashcards";
import {
  FlashcardFormSchema,
  flashcardFormSchema,
} from "@/modules/flashcards/flashcard-form.schema";
import { useUserOrganization } from "@/modules/organization";
import Editor from "@/shared/ui/form/Editor";
import RHFThumbnailUpload from "@/shared/ui/form/RHFThumbnailUpload";

interface FlashcardFormProps {
  mode: "create" | "edit";
  flashcardId?: string;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ mode, flashcardId }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { organizationId } = useOrganizationId();
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);

  const { mutate: createFlashcard, isPending: isCreating } = useCreateFlashcardMutation();
  const { data: flashcard, isLoading: isFetching } = useGetFlashcardByIdQuery(flashcardId || "", {
    enabled: mode === "edit" && !!flashcardId,
  });
  const { mutate: updateFlashcard, isPending: isUpdating } = useUpdateFlashcardMutation();

  const isLoading = isCreating || (mode === "edit" && isFetching);
  const isSubmitting = isCreating || isUpdating;

  const methods = useForm<FlashcardFormSchema>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      name: "",
      content: "",
      image_url: "",
      status: "active",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = methods;

  const watchContent = watch("content");

  // Reset form with fetched data for edit mode
  React.useEffect(() => {
    if (mode === "edit" && flashcard) {
      reset({
        name: flashcard.name || "",
        content: flashcard.content || "",
        image_url: flashcard.image_url || "",
        status: (flashcard.status as "active" | "inactive") || "active",
      });
    }
  }, [mode, flashcard, reset]);

  const onSubmit = (data: FlashcardFormSchema) => {
    if (!organizationId || !currentEmployee?.id) {
      enqueueSnackbar("Không tìm thấy thông tin tổ chức", { variant: "error" });
      return;
    }

    if (mode === "create") {
      createFlashcard(
        {
          ...data,
          organization_id: organizationId,
          created_by: currentEmployee.id,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", organizationId] });
            enqueueSnackbar("Tạo flashcard thành công", { variant: "success" });
            router.push(PATHS.FLASHCARDS.ROOT);
          },
          onError: () => {
            enqueueSnackbar("Không thể tạo flashcard", { variant: "error" });
          },
        }
      );
    } else {
      updateFlashcard(
        {
          id: flashcardId!,
          ...data,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["flashcards", organizationId] });
            enqueueSnackbar("Cập nhật flashcard thành công", { variant: "success" });
          },
          onError: () => {
            enqueueSnackbar("Không thể cập nhật flashcard", { variant: "error" });
          },
        }
      );
    }
  };

  const handleCancel = () => {
    router.push(PATHS.FLASHCARDS.ROOT);
  };

  if (mode === "edit" && isFetching) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography>Đang tải...</Typography>
      </Box>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
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
            {mode === "create" ? "Tạo Flashcard" : "Lưu thay đổi"}
          </Button>
        </Box>

        <Stack spacing={3} className="bg-white rounded-xl p-3 md:p-6 border border-gray-200">
          <Typography variant="h5">
            {mode === "create" ? "Tạo Flashcard mới" : "Chỉnh sửa Flashcard"}
          </Typography>

          {/* Flashcard Name */}
          <Box>
            <Typography variant="body1" fontWeight={500} mb={1}>
              Tên Flashcard <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập tên flashcard"
              {...register("name")}
              disabled={isSubmitting}
              error={!!errors.name}
              helperText={errors.name?.message || "Tối đa 100 ký tự"}
              inputProps={{ maxLength: 100 }}
            />
          </Box>

          {/* Content */}
          <Box>
            <Typography variant="body1" fontWeight={500} mb={1}>
              Nội dung <span style={{ color: "red" }}>*</span>
            </Typography>
            <Editor
              value={watchContent}
              onChange={(value) => setValue("content", value, { shouldValidate: true })}
              placeholder="Nhập nội dung flashcard..."
              error={!!errors.content}
              helperText={errors.content?.message}
              sx={{ minHeight: 300 }}
            />
          </Box>

          {/* Cover Image */}
          <RHFThumbnailUpload
            control={control}
            name="image_url"
            label="Ảnh bìa đại diện"
            subTitle="Hình ảnh đại diện cho flashcard của bạn"
            required
            aspectRatio="4/3"
            width="400px"
            accepts={[".jpg", ".jpeg", ".png"]}
            description={
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <Typography className="text-xs">
                  Kích thước chuẩn: <strong>800 × 600 px (4:3)</strong>
                </Typography>
                <span className="w-1 h-1 rounded-full bg-slate-500"></span>
                <Typography className="text-xs">File đuôi jpg, png</Typography>
              </div>
            }
          />
        </Stack>
      </form>
    </FormProvider>
  );
};

export default FlashcardForm;
