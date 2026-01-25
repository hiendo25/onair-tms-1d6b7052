import dayjs from "dayjs";
import { isUndefined } from "lodash";

import { ClassRoomFormValues } from "@/modules/class-room-management/components/ManageClassRoomForm/classroom-form.schema";
import { ClassRoomStore } from "@/modules/class-room-management/store/class-room-store";
import {
  classRoomCertificateTemplatesRepository,
  classRoomMetaRepository,
  classRoomRepository,
  classRoomSessionRepository,
  classSessionAgendaRepository,
  qrAttendanceRepository,
} from "@/repository";
import { GetClassRoomByIdResponse } from "@/repository/class-room";
import {
  UpSertClassRoomSessionPayload,
  UpsertPivotClassSessionWithCoursePeriodPayload,
} from "@/repository/class-session";
import { UpSertSessionAgendaPayload } from "@/repository/class-session-agenda";
import { UpSertQrCodePayload } from "@/repository/qr-attendance";

export type UpdateClassRoomDto = {
  classRoomId: string;
  formData: ClassRoomFormValues;
  students: ClassRoomStore["state"]["selectedStudents"];
  certificate: ClassRoomStore["state"]["selectedCertificate"];
};
export class UpdateClassRoomService {
  private employeeId: string;

  constructor(employeeId: string) {
    if (!employeeId) throw new Error("employeeId is required");
    this.employeeId = employeeId;
  }

  async execute(variables: UpdateClassRoomDto) {
    const { formData, students, classRoomId, certificate } = variables;

    const { data: classRoomDetail, error: classRoomDetailError } = await classRoomRepository.getClassRoomById(
      classRoomId,
    );
    if (!classRoomDetail || classRoomDetailError) {
      console.error(classRoomDetailError);
      throw new Error(classRoomDetailError?.message || "Classroom not found.");
    }

    const {
      categories,
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

    const { startDate, endDate } = this.getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
    /**
     * Step 1: update ClassRoom
     */
    const { data: classRoomData, error: updateError } = await classRoomRepository.updateClassRoom({
      id: classRoomId,
      description: description,
      room_type: roomType,
      slug: slug,
      status: status,
      thumbnail_url: thumbnailUrl,
      title: title,
      start_at: startDate || null,
      end_at: endDate || null,
      employee_id: this.employeeId,
    });

    if (updateError) {
      console.error(updateError);
      throw new Error(updateError.message);
    }

    /**
     * Step 2: Update Metadata
     */

    if (forWhom.length) {
      await this.updateClassRoomMetadata(classRoomData.id, classRoomDetail, forWhom);
    }

    /**
     * Step 3: Sync Classroom with Employee
     */
    if (students.length) {
      await this.updateStudents(classRoomData.id, classRoomDetail, students);
    }

    /**
     * Step 4: Sync  ClassRoom with Resouces
     */
    await this.updateClassroomWithResource({
      classRoomId: classRoomData.id,
      oldResources: classRoomDetail.resources,
      newResources: docs,
    });

    /**
     * Step 5: Sync Classroom old Class Field to new Class Fields
     */
    await this.updateCategories(classRoomData.id, classRoomDetail, categories);

    /**
     * Step 6: Sync Old Sessions with new Sessions
     */

    await this.updateSessions(classRoomData.id, {
      title,
      description,
      roomType,
      oldSessions: classRoomDetail.sessions,
      newSessions: classRoomSessions,
      classType: classType,
    });

    /**
     * Step 7: Sync Certificate Template
     */
    if (classType !== "learning_path") {
      await this.updateCertificate(classRoomData.id, classRoomDetail, certificate);
    }

    console.log("Update Susscess", classRoomData);
    return classRoomData;
  }

  private async updateClassRoomMetadata(
    classRoomId: string,
    classRoomDetail: NonNullable<GetClassRoomByIdResponse["data"]>,
    forWhom: ClassRoomFormValues["forWhom"],
  ) {
    const forWhomMetadata = classRoomDetail.class_room_metadata.find((item) => item.key === "forWhom");

    const { error: forWhomError } = await classRoomMetaRepository.upsertClassRoomMeta({
      id: forWhomMetadata?.id,
      class_room_id: classRoomId,
      key: "forWhom",
      value: forWhom.map((item) => item.description),
    });

    if (forWhomError) {
      console.log(forWhomError);
    }
  }

  private async updateStudents(
    classRoomId: string,
    classRoomDetail: NonNullable<GetClassRoomByIdResponse["data"]>,
    students: ClassRoomStore["state"]["selectedStudents"],
  ) {
    const oldEmployees = classRoomDetail.employees;

    const delList = oldEmployees.filter((row) => students.every((std) => std.id !== row.employee?.id));
    const addList = students.filter((std) => oldEmployees.every((row) => row.employee?.id !== std.id));

    if (delList.length) {
      await classRoomRepository.deletePivotClassRoomAndEmployee(delList.map((row) => row.id));
    }
    if (addList.length) {
      await classRoomRepository.createPivotClassRoomAndEmployee(
        addList.map((tc) => ({
          class_room_id: classRoomId,
          employee_id: tc.id,
        })),
      );
    }
  }

  private async updateCategories(
    classRoomId: string,
    classRoomDetail: NonNullable<GetClassRoomByIdResponse["data"]>,
    categories: ClassRoomFormValues["categories"],
  ) {
    const currentClassRoomFields = [...classRoomDetail.class_room_field];
    const currentCategoriesIds = currentClassRoomFields
      .map((item) => item.categories?.id)
      .filter((item) => !isUndefined(item));

    const addList = categories.filter((id) => !currentCategoriesIds.includes(id));
    const delList = currentClassRoomFields.filter((it) => categories.every((id) => id !== it.categories?.id));

    if (delList.length) {
      await classRoomRepository.deletePivotClassRoomAndField(delList.map((it) => it.id));
    }

    if (addList.length) {
      await classRoomRepository.createPivotClassRoomAndField(
        addList.map((fieldId) => ({
          class_field_id: fieldId,
          class_room_id: classRoomId,
        })),
      );
    }
  }

  private async updateCertificate(
    classRoomId: string,
    classRoomDetail: NonNullable<GetClassRoomByIdResponse["data"]>,
    certificate: ClassRoomStore["state"]["selectedCertificate"],
  ) {
    const currentCertificate = classRoomDetail.certificate?.[0];

    // Case 1: No new certificate selected
    if (!certificate) {
      // Delete existing certificate if any
      if (currentCertificate) {
        await classRoomCertificateTemplatesRepository.deleteClassRoomCertificateTemplate({
          class_room_id: classRoomId,
        });
      }
      return;
    }

    // Case 2: New certificate selected
    // If there's an existing certificate with different ID or days_to_expire, update it
    if (
      currentCertificate &&
      (currentCertificate.certificate_template_id !== certificate.id ||
        currentCertificate.days_to_expire !== certificate.daysToExpire)
    ) {
      await classRoomCertificateTemplatesRepository.updateClassRoomCertificateTemplate({
        id: currentCertificate.id,
        certificate_template_id: certificate.id,
        days_to_expire: certificate.daysToExpire,
      });
      return;
    }

    // Case 3: No existing certificate, create new one
    if (!currentCertificate) {
      await classRoomCertificateTemplatesRepository.createClassRoomCertificateTemplate({
        class_room_id: classRoomId,
        certificate_template_id: certificate.id,
        days_to_expire: certificate.daysToExpire,
      });
    }

    // Case 4: Existing certificate with same ID and days_to_expire - no action needed
  }

  private async updateSessions(
    classRoomId: string,
    data: {
      title: string;
      description: string;
      oldSessions: NonNullable<GetClassRoomByIdResponse["data"]>["sessions"];
      newSessions: ClassRoomFormValues["classRoomSessions"];
      roomType: ClassRoomFormValues["roomType"];
      classType: ClassRoomFormValues["classType"];
    },
  ) {
    const _this = this;
    const { title, description, oldSessions, newSessions, roomType, classType } = data;
    /**
     * todo: compare new sessions List: classRoomSessions vs old Session List: classRoomDetail/sessions
     * - delete: these session has Id in classRoomSessions is not in classRoomDetail/sessions.
     * - create: if some sessions in classRoomSessions has no Id
     */

    /**
     *  Delete Session
     */
    const sessionListDeletion = oldSessions.filter((s) => newSessions.every((newS) => s.id !== newS.id));

    if (sessionListDeletion.length) {
      const agendaIdsDeletion = sessionListDeletion.reduce<string[]>((acc, session) => {
        const agendaIds = session.agendas.map((ag) => ag.id);
        return [...acc, ...agendaIds];
      }, []);

      await classSessionAgendaRepository.deleteAgendas(agendaIdsDeletion);

      await classRoomSessionRepository.deleteClassSession(sessionListDeletion.map((s) => s.id));
    }

    /**
     * UpSert Session
     */
    await Promise.all(
      newSessions.map(async (newSession, _sessionIndex) => {
        const classSessionPayload = this.mapUpSertSessionWithClassRoom({
          classRoomTitle: title,
          classRoomDescription: description,
          classRoomId: classRoomId,
          classSession: newSession,
          roomType: roomType,
          index: _sessionIndex,
        });
        const { data: sessionData, error: sessionDataError } = await classRoomSessionRepository.upsertClassSession(
          classSessionPayload,
        );

        if (sessionDataError) {
          throw new Error("Upsert session failed");
        }

        const sessionId = sessionData.id;
        /**
         * UpdateAgenda
         */

        const upsertAgendaPromise = (async () => {
          if (!newSession.agendas.length) return;
          const upsertAgendasPayload = _this.mapUpsertAgendaWithSessions(newSession.agendas, sessionId);
          await classSessionAgendaRepository.bulkUpsertAgendas(upsertAgendasPayload);
        })();

        /**
         * Sync Update Session With assignment
         * Optional
         */
        const oldSessionItem = oldSessions.find((item) => item.id === sessionId);
        const syncSessionWithAssignmentPromise = (async () => {
          const oldAssignments = oldSessionItem?.session_assignments;

          const newAssignments = newSession.assignments;

          const assignmentAddNewItems = newAssignments.filter((newItem) =>
            oldAssignments?.every((oldItem) => oldItem.assignments.id !== newItem.assignmentId),
          );
          const assignmentDeleteItems = oldAssignments?.filter((oldItem) =>
            newAssignments?.every((newItem) => newItem.assignmentId !== oldItem.assignments.id),
          );

          if (assignmentDeleteItems?.length) {
            await classRoomSessionRepository.bulkDeletePivotClassSessionWithAssignment(
              assignmentDeleteItems.map((item) => item.id),
            );
          }

          if (assignmentAddNewItems.length) {
            const { data, error } = await classRoomSessionRepository.bulkCreatePivotClassSessionWithAssignment(
              assignmentAddNewItems.map((item) => ({
                assignment_id: item.assignmentId,
                session_id: sessionData.id,
                start_at: null,
                end_at: null,
              })),
            );

            if (error) {
              throw new Error(error.message);
            }
          }
        })();

        /**
         * Sync class Session with course Period
         */

        type WeeklyScheduleItem =
          ClassRoomFormValues["classRoomSessions"][number]["coursesPeriod"][number]["weeklySchedule"];
        const syncSessionWithCoursePeriodPromise = (async () => {
          const oldCoursePeriods = oldSessionItem?.courses_period || [];

          const newCoursesPeriod = newSession.coursesPeriod.reduce<
            {
              id: number | undefined;
              courseId: string;
              startAt: string;
              endAt: string;
              teacherId: string;
              weeklySchedule: WeeklyScheduleItem;
            }[]
          >((acc, coursePeriod) => {
            const flattenTeachers = coursePeriod.teachers.map((teacher) => ({
              id: teacher.recordId,
              courseId: coursePeriod.course.id,
              startAt: coursePeriod.startAt,
              endAt: coursePeriod.endAt,
              weeklySchedule: coursePeriod.weeklySchedule,
              teacherId: teacher.teacherId,
            }));

            return [...acc, ...flattenTeachers];
          }, []);

          const delList = oldCoursePeriods.filter((cp) => newCoursesPeriod.every((ncp) => ncp.id !== cp.id));
          if (delList.length) {
            await classRoomSessionRepository.bulkDeletePivotClassSessionWithCoursePeriod(delList.map((cp) => cp.id));
          }

          const coursesPeriodPayload = newCoursesPeriod.map<UpsertPivotClassSessionWithCoursePeriodPayload>(
            ({ teacherId, courseId, startAt, endAt, id: sessionCoursePeriodId, weeklySchedule }) => {
              const coursePeriodWeeklySchedulePayload: UpsertPivotClassSessionWithCoursePeriodPayload["payload"]["weekly_schedule"] =
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

              console.log({ coursePeriodWeeklySchedulePayload });
              return sessionCoursePeriodId
                ? {
                    action: "update",
                    payload: {
                      id: sessionCoursePeriodId,
                      teacher_id: teacherId,
                      start_at: startAt ? dayjs(startAt).toISOString() : null,
                      end_at: endAt ? dayjs(endAt).toISOString() : null,
                      weekly_schedule: coursePeriodWeeklySchedulePayload,
                    },
                  }
                : {
                    action: "create",
                    payload: {
                      class_session_id: sessionData.id,
                      course_id: courseId,
                      teacher_id: teacherId,
                      start_at: startAt ? dayjs(startAt).toISOString() : null,
                      end_at: endAt ? dayjs(endAt).toISOString() : null,
                      weekly_schedule: coursePeriodWeeklySchedulePayload,
                    },
                  };
            },
          );

          Promise.all(
            coursesPeriodPayload.map(async (payloadCoursePeriod, index) => {
              const { data, error } = await classRoomSessionRepository.upsertPivotClassSessionWithCoursePeriod(
                payloadCoursePeriod,
              );
              if (error) {
                throw new Error(`[FAIL] CoursePeriod index ${index}: ${error.message}`);
              }
            }),
          );
        })();

        /**
         * Update QRCode
         */
        const upsertQrCodePromise = (async () => {
          if (newSession.sessionType !== "offline") return;
          const createQrCodePayload = _this.mapUpSertQrCodeWithSession({
            classRoomId: classRoomId,
            classSessionId: sessionId,
            qrCode: newSession.qrCode,
            useId: _this.employeeId,
          });
          const { data: qrCodeData, error: qrCodeError } = await qrAttendanceRepository.upsertQRCode(
            createQrCodePayload,
          );
          if (qrCodeError) throw new Error(`Upsert QrCode Session index: ${_sessionIndex} failed`);
        })();

        /**
         * Parallel update
         */
        await Promise.all([
          upsertAgendaPromise,
          upsertQrCodePromise,
          syncSessionWithAssignmentPromise,
          syncSessionWithCoursePeriodPromise,
        ]);
      }),
    );
  }

  private async updateClassroomWithResource(payload: {
    oldResources: NonNullable<GetClassRoomByIdResponse["data"]>["resources"];
    newResources: ClassRoomFormValues["docs"];
    classRoomId: string;
  }) {
    const { classRoomId, oldResources, newResources = [] } = payload;
    /**
     * delete resources if not includes in detail list
     * add new resources to classroom
     */
    const delList = oldResources.filter((rc) => newResources?.every((nrc) => nrc.id !== rc.resource.id));
    const addList = newResources.filter((rc) => oldResources?.every((orc) => orc.resource.id !== rc.id));

    if (delList.length) {
      await classRoomRepository.deletePivotClassRoomsWithResources(delList.map((rc) => rc.id));
    }

    if (addList.length) {
      await classRoomRepository.createPivotClassRoomsWithResources(
        addList.map((rc) => ({
          class_room_id: classRoomId,
          resource_id: rc.id,
        })),
      );
    }
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
   *  Helper: Map Update Qrcode payloads
   * -------------------------------------------------------- */

  private mapUpSertQrCodeWithSession(data: {
    qrCode: ClassRoomFormValues["classRoomSessions"][number]["qrCode"];
    classRoomId: string;
    classSessionId: string;
    useId: string;
  }): UpSertQrCodePayload {
    const { classRoomId, classSessionId, useId, qrCode } = data;
    const qrCodeId = qrCode.id;

    const basePayload = {
      title: `QrCode`,
      description: "",
      checkin_start_time: qrCode.isLimitTimeScanQrCode ? qrCode.startDate : null,
      checkin_end_time: qrCode.isLimitTimeScanQrCode ? qrCode.endDate : null,
    };

    return qrCodeId
      ? {
          action: "update",
          payload: {
            id: qrCodeId,
            ...basePayload,
          },
        }
      : {
          action: "create",
          payload: {
            ...basePayload,
            created_by: useId,
            class_room_id: classRoomId,
            class_session_id: classSessionId,
          },
        };
  }

  /** --------------------------------------------------------
   *  Helper: Map Upsert session payloads
   * -------------------------------------------------------- */
  private mapUpSertSessionWithClassRoom(data: {
    classSession: ClassRoomFormValues["classRoomSessions"][number];
    roomType: ClassRoomFormValues["roomType"];
    classRoomTitle: string;
    classRoomDescription: string;
    classRoomId: string;
    index: number;
  }): UpSertClassRoomSessionPayload {
    const { classSession, roomType, classRoomTitle, classRoomDescription, classRoomId, index } = data;
    const { id: sessionId, weeklySchedule } = classSession;

    const courseWeeklySchedule: UpSertClassRoomSessionPayload["payload"]["weekly_schedule"] = weeklySchedule
      ? {
          from: weeklySchedule.from,
          to: weeklySchedule.to,
        }
      : null;
    const payload = {
      title: roomType === "single" ? classRoomTitle : classSession.title,
      description: roomType === "single" ? classRoomDescription : classSession.description,
      location: classSession.location,
      channel_info: classSession.channelInfo,
      channel_provider: classSession.channelProvider,
      end_at: classSession.endDate || null,
      start_at: classSession.startDate || null,
      session_type: classSession.sessionType,
      priority: index + 1,
      weekly_schedule: courseWeeklySchedule,
    };

    return sessionId
      ? {
          action: "update",
          payload: {
            ...payload,
            id: sessionId,
          },
        }
      : {
          action: "create",
          payload: {
            ...payload,
            class_room_id: classRoomId,
          },
        };
  }

  /** --------------------------------------------------------
   *  Helper: Map Upsert Agenda with session payloads
   * -------------------------------------------------------- */

  private mapUpsertAgendaWithSessions(
    agendas: ClassRoomFormValues["classRoomSessions"][number]["agendas"],
    sessionId: string,
  ) {
    return agendas.map<UpSertSessionAgendaPayload>((agenda) => {
      const agendaId = agenda.id;
      const payload = {
        title: agenda.title,
        description: agenda.description,
        start_at: agenda.startDate,
        end_at: agenda.endDate,
        thumbnail_url: null,
      };

      return agendaId
        ? {
            action: "update",
            payload: {
              ...payload,
              id: agendaId,
            },
          }
        : {
            action: "create",
            payload: {
              ...payload,
              class_session_id: sessionId,
            },
          };
    });
  }
}
