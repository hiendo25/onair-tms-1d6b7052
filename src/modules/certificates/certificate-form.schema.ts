import { z } from "zod";

export const certificateFormSchema = z.object({
  name: z.string().min(1, "Tên mẫu chứng nhận là bắt buộc").max(40, "Tối đa 40 ký tự"),
  frame_id: z.string().min(1, "Vui lòng chọn khung mẫu"),
  description: z.string().min(1, "Nội dung chứng nhận là bắt buộc"),
});

export type CertificateFormSchema = z.infer<typeof certificateFormSchema>;
