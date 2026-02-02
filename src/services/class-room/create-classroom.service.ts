import dayjs from "dayjs";

import { eventBus } from "@/infrastructure/events";
import { ClassRoomFormValues } from "@/modules/class-room-management/components/ManageClassRoomForm/classroom-form.schema";
import { ClassRoomStore } from "@/modules/class-room-management/store/class-room-store";
import {
  assignmentBankRepository,
  assignmentsRepository,
  classRoomCertificateTemplatesRepository,
  classRoomMetaRepository,
  classRoomRepository,
  classRoomSessionRepository,
  classSessionAgendaRepository,
  qrAttendanceRepository,
} from "@/repository";
import {
  CreatePivotClassRoomAndEmployeePayload,
  CreatePivotClassRoomAndFieldPayload,
  CreatePivotClassRoomWithResourcePayload,
} from "@/repository/class-room/type";
import {
  CreateClassRoomSessionPayload,
  CreatePivotClassSessionWithAssignmentPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
} from "@/repository/class-session";
import { CreateSessionAgendasPayload } from "@/repository/class-session-agenda";
import { CreateQRCodePayload } from "@/repository/qr-attendance";

export type CreateClassRoomDto = {
  formData: ClassRoomFormValues;
  students: ClassRoomStore["state"]["selectedStudents"];
  certificate: ClassRoomStore["state"]["selectedCertificate"];
};
export class CreateClassRoomService {
  private employeeId: string;

  private organizationId: string;

  constructor(employeeId: string, organizationId: string) {
    if (!employeeId) throw new Error("employeeId is required");
    if (!organizationId) throw new Error("organizationId is required");
    this.employeeId = employeeId;
    this.organizationId = organizationId;
  }

  async execute(payload: CreateClassRoomDto) {
    const { formData, students, certificate } = payload;
    const employeeId = this.employeeId;
    const organizationId = this.organizationId;

    const {
      categories,
      platform,
      classRoomSessions,
      description,
      thumbnailUrl,
      roomType,
      slug,
      status,
      title,
      forWhom,
      docs,
      classType,
    } = formData;

    const uniqueSlug = `${slug}-${new Date().getTime()}`;
    const { startDate, endDate } = this.getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
    /**
     * Step 1: Create ClassRoom
     */
    const { data: classRoomData, error } = await classRoomRepository.upsertClassRoom({
      action: "create",
      payload: {
        description: description,
        room_type: roomType,
        slug: uniqueSlug,
        status: status,
        thumbnail_url: thumbnailUrl,
        title: title,
        employee_id: employeeId,
        start_at: startDate || null,
        end_at: endDate || null,
        organization_id: organizationId,
        class_type: classType,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    /**
     * Step 2: Create ClassRoom Meta
     */
    if (forWhom.length) {
      const { data: forWhomData, error: forWhomError } = await classRoomMetaRepository.createClassRoomMeta({
        class_room_id: classRoomData.id,
        key: "forWhom",
        value: forWhom.map((item) => item.description),
      });
    }

    /**
     * Step 3: Sync Class room with Class Field
     */
    await classRoomRepository.createPivotClassRoomAndField(
      categories.map<CreatePivotClassRoomAndFieldPayload>((fieldId) => ({
        class_field_id: fieldId,
        class_room_id: classRoomData.id,
      })),
    );
    /**
     * Step 4: Sync Class room with Resources
     */
    if (docs && docs.length) {
      await classRoomRepository.createPivotClassRoomsWithResources(
        docs.map<CreatePivotClassRoomWithResourcePayload>((rc) => ({
          resource_id: rc.id,
          class_room_id: classRoomData.id,
        })),
      );
    }
    /**
     * Step 5: Create Class room Sessions
     */

    await this.createSessions(classRoomData.id, {
      classRoomSessions: classRoomSessions,
      title,
      description,
      roomType,
      classType,
    });

    /**
     * Step 6:  Sync notifications for teachers
     */

    const teachersMap = new Map<string, string>();
    classRoomSessions.forEach((session) => {
      session.coursesPeriod.forEach((coursePeriod) => {
        coursePeriod.teachers.forEach((tc) => {
          teachersMap.set(tc.teacherId, tc.teacherId);
        });
      });
    });

    /**
     * Step 7:  Sync ClassRoom with Students
     */

    if (classType !== "learning_path" && students.length) {
      await classRoomRepository.createPivotClassRoomAndEmployee(
        students.map<CreatePivotClassRoomAndEmployeePayload>((std) => ({
          class_room_id: classRoomData.id,
          employee_id: std.id,
        })),
      );

      /**
       * Step 8:  Notifications for students
       */
      // await this.notificationService.createStudentsNotification({
      //   classRoomId: classRoomData.id,
      //   classRoomSlug: uniqueSlug,
      //   classRoomTitle: title,
      //   receiverEmployeeIds: students.map((s) => s.id),
      //   createdBy: this.employeeId,
      //   platform: platform,
      //   classRoomType: roomType,
      //   startAt: startDate,
      //   thumbnailUrl,
      // });
    }

    /**
     * Step 9: Sync Certificate Template
     */
    if (classType !== "learning_path" && certificate) {
      await classRoomCertificateTemplatesRepository.createClassRoomCertificateTemplate({
        class_room_id: classRoomData.id,
        certificate_template_id: certificate.id,
        days_to_expire: certificate.daysToExpire,
      });
    }

    eventBus.emit("classroom.created", {
      organizationId,
      classRoomId: classRoomData.id,
      classRoomSlug: uniqueSlug,
      classRoomTitle: title,
      receiverStudentIds: students.map((s) => s.id),
      receiverTeacherIds: [...teachersMap.values()],
      createdBy: this.employeeId,
      platform: platform,
      classRoomType: roomType,
      startAt: startDate || "",
      thumbnailUrl,
    });

    return classRoomData;
  }

  private async createSessions(
    classRoomId: string,
    payload: {
      classRoomSessions: ClassRoomFormValues["classRoomSessions"];
      roomType: ClassRoomFormValues["roomType"];
      title: string;
      description: string;
      classType: ClassRoomFormValues["classType"];
    },
  ) {
    const { title, description, roomType, classRoomSessions, classType } = payload;
    const assignmentConfigMap = await this.createAssignmentConfigs(classRoomSessions);

    await Promise.all(
      classRoomSessions.map(async (classSession, _sessionIndex) => {
        try {
          const { data: sessionData, error: sessionError } = await classRoomSessionRepository.createClassSession(
            this.mapSessionWithClassRoom(classSession, roomType, title, description, classRoomId, _sessionIndex),
          );

          if (sessionError) {
            console.log("Create Session failed", sessionError, _sessionIndex);
            throw new Error(`Create classroom session ${_sessionIndex} failed`);
          }

          /**
           * Agendas
           */
          const agendaPromise = (async () => {
            const { error: agendaError } = await classSessionAgendaRepository.createAgendas(
              this.mapAgendaWithSessions(classSession.agendas, sessionData.id),
            );
          })();

          /**
           * QRCode
           * this QRcode only for classroom is offline
           */
          const qrCodePromise = (async () => {
            if (classSession.sessionType !== "offline") return;
            const { error: qrcodeError } = await qrAttendanceRepository.createClassQRCode(
              this.mapQrCodeWithSession({
                qrCode: classSession.qrCode,
                classRoomId: classRoomId,
                classSessionId: sessionData.id,
                useId: this.employeeId,
              }),
            );
            if (qrcodeError) throw new Error("Create Qrcode Failed");
          })();

          /**
           * Sync class Session to an assignment
           * Optional
           */

          const syncSessionWithAssignmentPromise = (async () => {
            if (!classSession.assignments.length) return;
            const bulkCreateSessionWithAssignmentPayload =
              classSession.assignments.map<CreatePivotClassSessionWithAssignmentPayload>((assignment) => ({
                assignment_config_id: this.getAssignmentConfigId(assignmentConfigMap, assignment.assignmentBankId),
                session_id: sessionData.id,
              }));

            const { data, error } = await classRoomSessionRepository.bulkCreatePivotClassSessionWithAssignment(
              bulkCreateSessionWithAssignmentPayload,
            );
            if (error) {
              throw new Error(error.message);
            }
          })();

          /**
           * Sync class Session to with course Period
           */
          const syncSessionWithCoursePeriodPromise = (async () => {
            const payloadCourses = classSession.coursesPeriod.reduce<CreatePivotClassSessionWithCoursePeriodPayload[]>(
              (acc, { teachers, course, startAt, endAt, weeklySchedule }) => {
                const coursesPayloadByTeachers = teachers
                  .map((teacher) => {
                    const teacherId = teacher?.teacherId;
                    if (teacherId) {
                      /**
                       * For class type learning path
                       */
                      const weeklyScheduleItem: CreatePivotClassSessionWithCoursePeriodPayload["weekly_schedule"] =
                        classType === "learning_path"
                          ? {
                            duration: weeklySchedule?.duration,
                            from:
                              weeklySchedule?.from?.day && weeklySchedule?.from?.time
                                ? {
                                  day: weeklySchedule?.from.day,
                                  time: weeklySchedule?.from.time,
                                }
                                : undefined,
                            to:
                              weeklySchedule?.to?.day && weeklySchedule?.to?.time
                                ? {
                                  day: weeklySchedule?.to.day,
                                  time: weeklySchedule?.to.time,
                                }
                                : undefined,
                            isDuration: weeklySchedule?.isDuration,
                          }
                          : null;
                      return {
                        class_session_id: sessionData.id,
                        course_id: course.id,
                        teacher_id: teacherId,
                        start_at: classType === "learning_path" ? null : dayjs(startAt).toISOString(),
                        end_at: classType === "learning_path" ? null : dayjs(endAt).toISOString(),
                        weekly_schedule: weeklyScheduleItem,
                      };
                    }
                  })
                  .filter((pl) => !!pl);
                return [...acc, ...coursesPayloadByTeachers];
              },
              [],
            );

            const { data, error } = await classRoomSessionRepository.bulkCreatePivotClassSessionWithCoursePeriod(
              payloadCourses,
            );
            if (error) {
              throw new Error(error.message);
            }
          })();

          /**
           * Run all promise in parallel
           */
          await Promise.all([
            agendaPromise,
            qrCodePromise,
            syncSessionWithAssignmentPromise,
            syncSessionWithCoursePeriodPromise,
          ]);
        } catch (err: any) {
          console.error(`Session ${_sessionIndex} failed:`, err);
          throw new Error(err?.message);
        }
      }),
    );
  }

  /** --------------------------------------------------------
   *  Helper
   * -------------------------------------------------------- */

  /** --------------------------------------------------------
   *  Get start/end date from sessions
   * -------------------------------------------------------- */
  private getStartDateAndEndDateFromClassSession(
    roomSessions: ClassRoomFormValues["classRoomSessions"],
    roomType: ClassRoomFormValues["roomType"],
  ) {
    let startDate, endDate;

    if (roomType === "single") {
      startDate = roomSessions[0]?.startDate;
      endDate = roomSessions[0]?.endDate;
    }

    if (roomType === "multiple") {
      const firstSession = [...roomSessions].shift();
      const lastSession = [...roomSessions].pop();

      startDate = firstSession?.startDate;
      endDate = lastSession?.endDate;
    }

    return { startDate, endDate };
  }

  /** --------------------------------------------------------
   *  Helper: Map qrCode payloads for offline class
   * -------------------------------------------------------- */
  private mapQrCodeWithSession(data: {
    qrCode: ClassRoomFormValues["classRoomSessions"][number]["qrCode"];
    classRoomId: string;
    classSessionId: string;
    useId: string;
  }): CreateQRCodePayload {
    const { classRoomId, classSessionId, useId, qrCode } = data;
    return {
      title: `QrCode`,
      description: "",
      checkin_start_time: qrCode.isLimitTimeScanQrCode ? qrCode.startDate : null,
      checkin_end_time: qrCode.isLimitTimeScanQrCode ? qrCode.endDate : null,
      created_by: useId,
      class_room_id: classRoomId,
      class_session_id: classSessionId,
    };
  }

  /** --------------------------------------------------------
   *  Helper: Map create session payloads
   * -------------------------------------------------------- */
  private mapSessionWithClassRoom(
    classSession: ClassRoomFormValues["classRoomSessions"][number],
    roomType: ClassRoomFormValues["roomType"],
    classRoomTitle: string,
    classRoomDescription: string,
    classRoomId: string,
    index: number,
  ): CreateClassRoomSessionPayload {
    const { weeklySchedule } = classSession;
    const weeklySchedulePayload: CreateClassRoomSessionPayload["weekly_schedule"] =
      weeklySchedule?.from && weeklySchedule?.to
        ? {
          from: weeklySchedule.from,
          to: weeklySchedule.to,
        }
        : null;

    return {
      title: roomType === "single" ? classRoomTitle : classSession.title,
      description: roomType === "single" ? classRoomDescription : classSession.description,
      location: classSession.location,
      channel_info: classSession.channelInfo,
      channel_provider: classSession.channelProvider,
      end_at: classSession.endDate || null,
      start_at: classSession.startDate || null,
      session_type: classSession.sessionType,
      class_room_id: classRoomId,
      priority: index + 1,
      weekly_schedule: weeklySchedulePayload,
    };
  }

  /** --------------------------------------------------------
   *  Helper: Map Agenda with session payloads
   * -------------------------------------------------------- */
  private mapAgendaWithSessions(
    agendas: ClassRoomFormValues["classRoomSessions"][number]["agendas"],
    sessionId: string,
  ): CreateSessionAgendasPayload[] {
    return agendas.map<CreateSessionAgendasPayload>((agenda) => ({
      class_session_id: sessionId,
      title: agenda.title,
      description: agenda.description,
      start_at: agenda.startDate,
      end_at: agenda.endDate,
      thumbnail_url: null,
    }));
  }

  private async createAssignmentConfigs(classRoomSessions: ClassRoomFormValues["classRoomSessions"]) {
    const assignmentBankIds = Array.from(
      new Set(
        classRoomSessions.flatMap((session) =>
          session.assignments.map((assignment) => assignment.assignmentBankId),
        ),
      ),
    );

    if (!assignmentBankIds.length) {
      return new Map<string, string>();
    }

    const assignmentConfigs = await Promise.all(
      assignmentBankIds.map(async (assignmentBankId) => {
        const assignmentBank = await assignmentBankRepository.getAssignmentBankById(
          assignmentBankId,
          this.organizationId,
        );

        if (!assignmentBank) {
          throw new Error("Không tìm thấy bài kiểm tra");
        }

        console.log("assignmentBank", assignmentBank);


        const assignmentConfig = await assignmentsRepository.createAssignmentFromBank({
          assignment_bank_id: assignmentBankId,
          assigned_by: this.employeeId,
          organization_id: this.organizationId,
          attempt_duration_minutes: assignmentBank.duration_minutes,
          attempt_limit: 1,
          available_from: null,
          available_to: null,
          status: "open",
          scope: "class_room",
        });

        return [assignmentBankId, assignmentConfig.id] as const;
      }),
    );

    return new Map(assignmentConfigs);
  }

  private getAssignmentConfigId(assignmentConfigMap: Map<string, string>, assignmentBankId: string) {
    const assignmentConfigId = assignmentConfigMap.get(assignmentBankId);

    if (!assignmentConfigId) {
      throw new Error("Không tìm thấy cấu hình bài kiểm tra");
    }

    return assignmentConfigId;
  }
}
