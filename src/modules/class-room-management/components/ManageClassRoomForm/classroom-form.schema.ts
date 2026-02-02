import dayjs from "dayjs";
import * as zod from "zod";

import { CLASS_ROOM_PLATFORM, ClassRoomPlatformType } from "@/constants/class-room.constant";
import { ClassRoomStatus, ClassRoomType } from "@/model/class-room.model";
import { ClassSessionChannelProvider, ClassSessionType } from "@/model/class-session.model";
import { EmployeeType } from "@/model/employee.model";
import { ClassType, DayOfWeek } from "@/model/enum-type.model";
const googleMeetRegex = /^https?:\/\/meet\.google\.com\//i;

const zoomRegex = /^https?:\/\/([a-z0-9-]+\.)?zoom\.us\//i;

const teamsRegex = /^https?:\/\/teams\.microsoft\.com\//i;
const TITLE_CLASS_ROOM_MAX_LENGTH = 100;
const courseResourceSchema = zod.object({
  id: zod.string(),
  url: zod.string(),
  name: zod.string(),
  mimeType: zod.string(),
});

const classRoomSessionAgendaSchema = zod
  .object({
    id: zod.string().optional(),
    title: zod.string().min(1, { error: "Tiêu đề không bỏ trống." }).max(100, "Tiêu đề tối đa 100 ký tự."),
    description: zod.string().min(1, { error: "Nội dung không bỏ trống." }),
    startDate: zod.string(),
    endDate: zod.string(),
  })
  .superRefine(({ startDate, endDate }, ctx) => {
    if (startDate && endDate) {
      if (dayjs(startDate).isAfter(endDate)) {
        ctx.addIssue({
          code: "custom",
          message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.",
          path: ["startDate"],
        });
        ctx.addIssue({
          code: "custom",
          message: "Ngày kết thúc phải nhỏ hơn ngày bắt đầu.",
          path: ["endDate"],
        });
      }
    }
  });

const coursePeriodWeeklyScheduleSchema = zod.object({
  time: zod.string().optional(),
  day: zod.enum<DayOfWeek[]>(["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]).optional(),
});
const requireDate = (value: string | undefined, ctx: zod.RefinementCtx, path: (string | number)[], message: string) => {
  if (!value) {
    ctx.addIssue({ code: "custom", message, path });
    return false;
  }
  if (!dayjs(value).isValid()) {
    ctx.addIssue({ code: "custom", message: "Ngày không hợp lệ.", path });
    return false;
  }
  return true;
};
const validateMeetingUrl = (provider: ClassSessionChannelProvider, url: string) => {
  if (provider === "zoom") return zoomRegex.test(url);
  if (provider === "google_meet") return googleMeetRegex.test(url);
  if (provider === "microsoft_teams") return teamsRegex.test(url);
  return false;
};
const classRoomSessionSchema = zod
  .object({
    id: zod.string().optional(),
    title: zod.string(),
    description: zod.string(),
    thumbnailUrl: zod.string(),
    startDate: zod.string(),
    endDate: zod.string(),
    location: zod.string(), //only for CLASS_ROOM_PLATFORM.OFFLINE
    channelProvider: zod.enum<NonNullable<ClassSessionChannelProvider>[]>(["zoom", "google_meet", "microsoft_teams"]), //only for CLASS_ROOM_PLATFORM.LIVE class room
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
    coursesPeriod: zod
      .array(
        zod.object({
          id: zod.number().optional(),
          course: zod.object({
            id: zod.string(),
            title: zod.string(),
          }),
          teachers: zod
            .array(
              zod.object({
                recordId: zod.number().optional(),
                teacherId: zod.string(),
                teacherName: zod.string(),
                teacherDepartment: zod.string(),
              }),
            )
            .min(1, { error: "Chọn ít nhất 1 giảng viên phụ trách." }),
          startAt: zod.string(),
          endAt: zod.string(),
          weeklySchedule: zod
            .object({
              from: coursePeriodWeeklyScheduleSchema.optional(),
              to: coursePeriodWeeklyScheduleSchema.optional(),
              isDuration: zod.boolean(),
              duration: zod
                .object({
                  hours: zod.number(),
                  minutes: zod.number(),
                })
                .optional(),
            })
            .optional(),
        }),
      )
      .min(1, { error: "Chọn ít nhất 1 môn học." }),
    assignments: zod.array(
      zod.object({ recordId: zod.number().optional(), assignmentBankId: zod.string(), name: zod.string().optional() }),
    ),
    weeklySchedule: zod
      .object({
        from: coursePeriodWeeklyScheduleSchema.optional(),
        to: coursePeriodWeeklyScheduleSchema.optional(),
      })
      .optional(),
    sessionType: zod.enum<ClassSessionType[]>(["live", "offline", "online"]),
    classType: zod.enum<ClassType[]>(["learning_path", "room"]).optional(),
  })
  .superRefine(
    (
      {
        startDate,
        endDate,
        qrCode,
        sessionType,
        location,
        channelInfo,
        channelProvider,
        classType,
        coursesPeriod,
        weeklySchedule,
      },
      ctx,
    ) => {
      if (classType === "room") {
        const startValid = requireDate(startDate, ctx, ["startDate"], "Ngày bắt đầu không bỏ trống.");
        const endValid = requireDate(endDate, ctx, ["endDate"], "Ngày kết thúc không bỏ trống.");

        if (startValid && endValid) {
          if (dayjs(startDate).isBefore(dayjs())) {
            ctx.addIssue({
              code: "custom",
              message: "Ngày bắt đầu phải lớn hơn ngày hiện tại.",
              path: ["startDate"],
            });
          }
          if (dayjs(startDate).isAfter(dayjs(endDate))) {
            ctx.addIssue({
              code: "custom",
              message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.",
              path: ["endDate"],
            });
          }
        }

        coursesPeriod.forEach((item, _index) => {
          if (!item.startAt) {
            ctx.addIssue({
              code: "custom",
              message: "Ngày bắt đầu không bỏ trống.",
              path: ["coursesPeriod", _index, "startAt"],
            });
          }

          if (!item.endAt) {
            ctx.addIssue({
              code: "custom",
              message: "Ngày kết thúc không bỏ trống.",
              path: ["coursesPeriod", _index, "endAt"],
            });
          }

          if (item.endAt && item.startAt && dayjs(item.startAt).isAfter(dayjs(item.endAt))) {
            ctx.addIssue({
              code: "custom",
              message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc.",
              path: ["coursesPeriod", _index, "startAt"],
            });
          }
        });
      }

      if (classType === "learning_path") {
        if (!weeklySchedule?.from?.day || !weeklySchedule?.from?.time) {
          ctx.addIssue({
            path: ["weeklySchedule", "from"],
            code: "custom",
            message: "Thời gian bắt đầu không bỏ trống.",
          });
        }
        if (!weeklySchedule?.to?.day || !weeklySchedule?.to?.time) {
          ctx.addIssue({
            path: ["weeklySchedule", "to"],
            code: "custom",
            message: "Thời gian thúc không bỏ trống.",
          });
        }

        coursesPeriod.forEach((item, _coursePeriodIndex) => {
          if (!item?.weeklySchedule?.from?.day || !item?.weeklySchedule?.from?.time) {
            ctx.addIssue({
              path: ["coursesPeriod", _coursePeriodIndex, "weeklySchedule", "from"],
              code: "custom",
              message: "Thời gian bắt đầu không bỏ trống.",
            });
          }
          if (!item?.weeklySchedule?.to?.day || !item?.weeklySchedule?.to?.time) {
            ctx.addIssue({
              code: "custom",
              message: "Thời gian kết thúc không bỏ trống.",
              path: ["coursesPeriod", _coursePeriodIndex, "weeklySchedule", "to"],
            });
          }

          if (item.weeklySchedule?.isDuration) {
            if (
              !item.weeklySchedule.duration ||
              (!item.weeklySchedule.duration.hours && !item.weeklySchedule.duration?.minutes) ||
              (item.weeklySchedule.duration?.hours === 0 && item.weeklySchedule.duration?.minutes === 0)
            ) {
              ctx.addIssue({
                code: "custom",
                message: "Thời lượng học không hợp lệ.",
                path: ["coursesPeriod", _coursePeriodIndex, "weeklySchedule", "duration"],
              });
            }
          }
        });
      }
      /**
       * Only Validate if event is offline
       */

      if (sessionType === "live") {
        if (!channelInfo.url) {
          ctx.addIssue({
            code: "custom",
            message: "Url không bỏ trống",
            path: ["channelInfo", "url"],
          });
        } else if (!validateMeetingUrl(channelProvider, channelInfo.url)) {
          ctx.addIssue({
            code: "custom",
            message: "Link tham dự không hợp lệ.",
            path: ["channelInfo", "url"],
          });
        }
      }

      if (sessionType === "offline") {
        if (!location) {
          ctx.addIssue({
            code: "custom",
            message: "Địa điểm tổ chức không bỏ trống.",
            path: ["location"],
          });
        }
        if (qrCode.isLimitTimeScanQrCode) {
          requireDate(qrCode.startDate, ctx, ["qrCode", "startDate"], "Thời gian bắt đầu không bỏ trống.");
          requireDate(qrCode.endDate, ctx, ["qrCode", "endDate"], "Thời gian kết thúc không bỏ trống.");

          if (qrCode.startDate && qrCode.endDate && dayjs(qrCode.startDate).isAfter(dayjs(qrCode.endDate))) {
            ctx.addIssue({
              code: "custom",
              message: "Thời gian bắt đầu phải nhỏ hơn hoặc bằng thời gian kết thúc.",
              path: ["qrCode", "startDate"],
            });
          }
        }
      }
    },
  );

const classRoomSchema = zod
  .object({
    classRoomId: zod.string(),
    title: zod
      .string()
      .min(1, { error: "Tên lớp học không bỏ trống." })
      .max(TITLE_CLASS_ROOM_MAX_LENGTH, `Tiêu đề tối đa ${TITLE_CLASS_ROOM_MAX_LENGTH} ký tự.`),
    slug: zod.string(),
    description: zod.string().min(1, { error: "Không bỏ trống nội dung." }),
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
    categories: zod.array(zod.string()).min(1, "Chọn tối thiểu 1 lĩnh vực và tối đa 3 lĩnh vực."),
    roomType: zod.enum<ClassRoomType[]>(["single", "multiple"]),
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
    docs: zod.array(courseResourceSchema).optional(),
    platform: zod.enum<ClassRoomPlatformType[]>(["live", "offline", "online", "hybrid"]),
    status: zod.enum<ClassRoomStatus[]>(["publish", "draft", "pending", "deleted"]),
    classType: zod.enum<ClassType[]>(["learning_path", "room"]),
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

type ClassRoomSessionFormValues = zod.infer<typeof classRoomSessionSchema>;
type ClassRoomFormValues = zod.infer<typeof classRoomSchema>;

export { classRoomSessionSchema, classRoomSchema, type ClassRoomSessionFormValues, type ClassRoomFormValues };
