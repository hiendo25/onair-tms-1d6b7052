import { z } from "zod";

export const certificateLayoutConfigSchema = z.object({
  completion_title: z.string().min(1, "Tiêu đề là bắt buộc"),
  awarded_to: z.string().min(1, "Trao cho là bắt buộc"),
  program_completion: z.string().min(1, "Chương trình là bắt buộc"),
  issue_date_label: z.string().min(1, "Nhãn ngày phát hành là bắt buộc"),
  expiry_date_label: z.string().min(1, "Nhãn ngày hết hạn là bắt buộc"),
});

export const certificateFormSchema = z.object({
  name: z.string().min(1, "Tên mẫu chứng nhận là bắt buộc").max(40, "Tối đa 40 ký tự"),
  frame_id: z.string().min(1, "Vui lòng chọn khung mẫu"),
  layout_config: certificateLayoutConfigSchema,
});

export type CertificateLayoutConfig = z.infer<typeof certificateLayoutConfigSchema>;
export type CertificateFormSchema = z.infer<typeof certificateFormSchema>;
