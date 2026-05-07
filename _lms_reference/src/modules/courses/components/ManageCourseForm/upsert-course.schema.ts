import * as zod from "zod";

const courseResourceSchema = zod.object({
  id: zod.string(),
  url: zod.string(),
  name: zod.string(),
  mimeType: zod.string(),
});
const lessonSchema = zod
  .object({
    id: zod.string().optional(),
    title: zod.string().min(1, { message: "Tiêu đề không bỏ trống." }).max(200, "Tiêu đề tối đa 200 ký tự."),
    content: zod.string().min(1, { message: "Nội dung không bỏ trống." }),
    status: zod.enum(["active", "deactive"]),
    mainResource: courseResourceSchema.optional(),
    resources: zod.array(courseResourceSchema),
    lessonType: zod.enum(["file", "video", "assessment"]),
    assignmentBankId: zod.string().optional(),
  })
  .superRefine(({ mainResource, lessonType, assignmentBankId }, context) => {
    switch (lessonType) {
      case "file": {
        if (!mainResource) {
          context.addIssue({
            code: "custom",
            message: "Chưa chọn tài nguyên.",
            path: ["mainResource"],
          });
        }
        break;
      }
      case "video": {
        if (!mainResource) {
          context.addIssue({
            code: "custom",
            message: "Chưa chọn video.",
            path: ["mainResource"],
          });
        }
        break;
      }
      case "assessment": {
        if (!assignmentBankId) {
          context.addIssue({
            code: "custom",
            message: "Chưa chọn bài kiểm tra.",
            path: ["assignmentBankId"],
          });
        }
        break;
      }
    }
  });

const courseSectionSchema = zod.object({
  id: zod.string().optional(),
  title: zod.string(),
  description: zod.string(),
  lessons: zod.array(lessonSchema).min(1, { message: "Học phần hiện chưa có bài học nào." }),
  status: zod.enum(["active", "deactive"]),
});

const upsertCourseSchema = zod.object({
  id: zod.string().optional(),
  title: zod.string().min(1, { error: "Tên môn học không bỏ trống." }).max(200, "Vui lòng nhập tối đa 200 ký tự"),
  description: zod.string().min(1, { error: "Không bỏ trống nội dung." }),
  slug: zod.string(),
  categories: zod.array(zod.string()).min(1, "Chọn tối thiểu 1 lĩnh vực."),
  status: zod.enum(["published", "pending", "draft", "deleted", "unpublished"]),
  sections: zod.array(courseSectionSchema).min(1, { error: "Học phần dang trống." }),
});

type CourseSectionFormData = zod.infer<typeof courseSectionSchema>;
type UpsertCourseFormData = zod.infer<typeof upsertCourseSchema>;

export { courseSectionSchema, upsertCourseSchema, type CourseSectionFormData, type UpsertCourseFormData };
