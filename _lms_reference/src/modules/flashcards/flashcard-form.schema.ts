import { z } from "zod";

export const flashcardFormSchema = z.object({
  name: z.string().min(1, "Tên flashcard không được để trống").max(100, "Tối đa 100 ký tự"),
  content: z.string().min(1, "Nội dung không được để trống"),
  image_url: z.string().min(1, "Vui lòng chọn ảnh bìa"),
  status: z.enum(["active", "inactive"]),
});

export type FlashcardFormSchema = z.infer<typeof flashcardFormSchema>;
