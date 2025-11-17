import { CLASS_ROOM_PLATFORM } from "@/constants/class-room.constant";
import dayjs from "dayjs";
import * as zod from "zod";

const classRoomSessionAgendaSchema = zod.object({
  id: zod.string().optional(),
  title: zod.string().min(1, { message: "Tiêu đề không bỏ trống." }).max(100, "Tiêu đề tối đa 100 ký tự."),
  description: zod.string().min(1, { message: "Nội dung không bỏ trống." }),
  startDate: zod.iso.datetime({ error: "Ngày bắt đầu không hợp lệ." }),
  endDate: zod.iso.datetime({ error: "Ngày bắt đầu không hợp lệ." }),
});

const classRoomSessionSchema = zod
  .object({
    id: zod.string().optional(),
    title: zod.string(),
    description: zod.string(),
    thumbnailUrl: zod.string(),
    startDate: zod.iso.datetime({ error: "Ngày bắt đầu không hợp lệ." }),
    endDate: zod.iso.datetime({ error: "Ngày kết thúc không hợp lệ." }),
    isOnline: zod.boolean(),
    location: zod.string(), //only for offline class room
    channelProvider: zod.enum(["zoom", "google_meet", "microsoft_teams"]), //only for online class room
    channelInfo: zod.object({
      providerId: zod.string(),
      url: zod.string(),
      password: zod.string(),
    }),
    agendas: zod.array(classRoomSessionAgendaSchema),
    qrCode: zod.object({
      id: zod.string().optional(),
      isLimitTimeScanQrCode: zod.boolean(),
      startDate: zod.string(),
      endDate: zod.string(),
    }),
  })
  .superRefine(({ startDate, endDate, qrCode, isOnline, location, channelInfo }, ctx) => {
    if (dayjs(startDate).isAfter(endDate)) {
      ctx.addIssue({
        code: "custom",
        message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.",
        path: ["startDate"],
      });
    }
    /**
     * Only Validate if event is offline
     */

    if (isOnline) {
      if (!channelInfo.url.length) {
        ctx.addIssue({
          code: "custom",
          message: "Url không bỏ trống",
          path: ["channelInfo", "url"],
        });
      }
      if (channelInfo.url.length) {
        if (!channelInfo.url.startsWith("http://") && !channelInfo.url.startsWith("https://")) {
          ctx.addIssue({
            code: "custom",
            message: "Link tham dự không hợp lệ.",
            path: ["channelInfo", "url"],
          });
        }
      }
    } else {
      if (!location.length) {
        ctx.addIssue({
          code: "custom",
          message: "Địa điểm tổ chức không bỏ trống.",
          path: ["location"],
        });
      }
      if (qrCode.isLimitTimeScanQrCode) {
        if (!qrCode.startDate) {
          ctx.addIssue({
            code: "custom",
            message: "Thời gian bắt đầu không bỏ trống",
            path: ["qrCode", "startDate"],
          });
        } else {
          if (!dayjs(qrCode.startDate).isValid()) {
            ctx.addIssue({
              code: "custom",
              message: "Thời gian bắt đầu không hợp lệ.",
              path: ["qrCode", "startDate"],
            });
          }
        }

        if (!qrCode.endDate) {
          ctx.addIssue({
            code: "custom",
            message: "Thời gian kết thúc không bỏ trống",
            path: ["qrCode", "endDate"],
          });
        } else {
          if (!dayjs(qrCode.endDate).isValid()) {
            ctx.addIssue({
              code: "custom",
              message: "Thời gian kết thúc không hợp lệ.",
              path: ["qrCode", "endDate"],
            });
          }
        }
        if (qrCode.startDate && qrCode.endDate && dayjs(qrCode.startDate).isAfter(dayjs(qrCode.endDate))) {
          ctx.addIssue({
            code: "custom",
            message: "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.",
            path: ["qrCode", "startDate"],
          });
        }
      }
    }
  });

const classRoomSchema = zod
  .object({
    classRoomId: zod.string(),
    title: zod.string().min(1, { message: "Tên lớp học không bỏ trống." }).max(200, "Vui lòng nhập tối đa 200 ký tự"),
    description: zod.string().min(1, { error: "Không bỏ trống nội dung." }),
    slug: zod.string(),
    thumbnailUrl: zod
      .string()
      .min(1, { error: "Ảnh bìa không bỏ trống." })
      .superRefine((value, ctx) => {
        if (!value.startsWith("http://") && !value.startsWith("https://")) {
          ctx.addIssue({
            code: "invalid_format",
            format: "starts_with",
            message: "Đường dẫn không hợp lệ.",
          });
        }
      }),
    categories: zod
      .array(zod.string())
      .min(1, "Chọn tối thiểu 1 lĩnh vực và tối đa 3 lĩnh vực.")
      .max(3, "Chọn tối thiểu 1 lĩnh vực và tối đa 3 lĩnh vực."),
    status: zod.enum(["publish", "draft", "pending", "deleted", "active", "deactive"]),
    roomType: zod.enum(["single", "multiple"]),
    classRoomSessions: zod.array(classRoomSessionSchema),
    forWhom: zod
      .array(
        zod.object({
          id: zod.string().optional(),
          description: zod.string(),
        }),
      )
      .superRefine((values, context) => {
        if (values.length) {
          values.forEach(({ description }, i) => {
            if (!description.length) {
              context.addIssue({
                code: "custom",
                message: `Không bỏ trống.`,
                path: [i, "description"],
              });
            }
          });
        }
      }),
    docs: zod
      .array(
        zod.object({
          type: zod.string(),
          fileExtension: zod.string(),
          size: zod
            .number()
            .positive()
            .max(5 * 1024 * 1024, "Dung lượng file không vượt quá 5mb"),
          url: zod.string(),
        }),
      )
      .optional(),
    // whies: zod
    //   .array(
    //     zod.object({
    //       id: zod.string().optional(),
    //       description: zod.string(),
    //     }),
    //   )
    //   .superRefine((values, context) => {
    //     if (values.length) {
    //       values.forEach(({ description }, i) => {
    //         if (!description.length) {
    //           context.addIssue({
    //             code: "custom",
    //             message: `Không bỏ trống.`,
    //             path: [i, "description"],
    //           });
    //         }
    //       });
    //     }
    //   }),
    // galleries: zod.array(zod.string()).superRefine((values, ctx) => {
    //   if (values.length)
    //     values.forEach((v, i) => {
    //       if (!v.startsWith("http://")) {
    //         ctx.addIssue({
    //           code: "invalid_format",
    //           format: "starts_with",
    //           message: `Đường dẫn ${i} không hợp lệ.`,
    //         });
    //       }
    //     });
    // }),
    platform: zod.enum([CLASS_ROOM_PLATFORM.HYBRID, CLASS_ROOM_PLATFORM.ONLINE, CLASS_ROOM_PLATFORM.OFFLINE]),
  })
  .superRefine(({ roomType, classRoomSessions }, ctx) => {
    if (roomType === "multiple") {
      classRoomSessions.forEach((clrs, _index) => {
        if (!clrs.title.length) {
          ctx.addIssue({
            code: "custom",
            message: "Tiêu đề không bỏ trống.",
            path: ["classRoomSessions", _index, "title"],
          });
        }

        if (!clrs.description.length) {
          ctx.addIssue({
            code: "custom",
            message: "Nội dung không bỏ trống",
            path: ["classRoomSessions", _index, "description"],
          });
        }
      });
    }
  });

type ClassRoomSession = zod.infer<typeof classRoomSessionSchema>;
type ClassRoom = zod.infer<typeof classRoomSchema>;

export { classRoomSessionSchema, classRoomSchema, type ClassRoomSession, type ClassRoom };
