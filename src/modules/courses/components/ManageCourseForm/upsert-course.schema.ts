import { Course } from "@/model/course.model";
import { LessonType } from "@/model/lesson.model";
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
    assignmentId: zod.string().optional(),
  })
  .superRefine(({ mainResource, lessonType, assignmentId }, context) => {
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
        if (!assignmentId) {
          context.addIssue({
            code: "custom",
            message: "Chưa chọn bài kiểm tra.",
            path: ["assignmentId"],
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
  // benefits: zod
  //   .array(
  //     zod.object({
  //       content: zod.string(),
  //     }),
  //   )
  //   .superRefine((values, context) => {
  //     if (values.length) {
  //       values.forEach(({ content }, i) => {
  //         if (!content.length) {
  //           context.addIssue({
  //             code: "custom",
  //             message: `Không bỏ trống.`,
  //             path: [i, "content"],
  //           });
  //         }
  //       });
  //     }
  //   }),
});

type CourseSectionFormData = zod.infer<typeof courseSectionSchema>;
type UpsertCourseFormData = zod.infer<typeof upsertCourseSchema>;

export { courseSectionSchema, upsertCourseSchema, type CourseSectionFormData, type UpsertCourseFormData };
