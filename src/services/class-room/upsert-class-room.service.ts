import {
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
  GetClassRoomByIdResponse,
} from "@/repository/class-room";
import { ClassRoomStore } from "@/modules/class-room-management/store/class-room-store";
import { ClassRoom } from "@/modules/class-room-management/components/ManageClassRoomForm/classroom-form.schema";
import { CreateQRCodePayload, UpSertQrCodePayload } from "@/repository/qr-attendance";
import {
  CreateClassRoomSessionPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
  UpSertClassRoomSessionPayload,
  UpsertPivotClassSessionWithCoursePeriodPayload,
} from "@/repository/class-session";
import { isUndefined } from "lodash";
import { CreateSessionAgendasPayload, UpSertSessionAgendaPayload } from "@/repository/class-session-agenda";
import dayjs from "dayjs";
import { getErrorMessage } from "../supabase-error-message";

export class UpsertClassRoomService {
  private userId: string;

  private organizationId: string;

  constructor(userId: string, organizationId: string) {
    if (!userId) throw new Error("userId is required");
    if (!organizationId) throw new Error("organizationId is required");
    this.userId = userId;
    this.organizationId = organizationId;
  }

  async create(payload: { formData: ClassRoom; students: ClassRoomStore["state"]["selectedStudents"] }) {
    const { formData, students } = payload;
    const userId = this.userId;
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
    } = formData;

    const { startDate, endDate } = this.getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
    /**
     * Step 1: Create ClassRoom
     */
    const { data: classRoomData, error } = await classRoomRepository.upsertClassRoom({
      action: "create",
      payload: {
        description: description,
        room_type: roomType,
        slug: slug,
        status: status,
        thumbnail_url: thumbnailUrl,
        title: title,
        employee_id: userId,
        start_at: startDate,
        end_at: endDate,
        organization_id: organizationId,
      },
    });

    if (error) {
      console.log(error);
      throw new Error(getErrorMessage(error));
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
     * Step 5: Sync ClassRoom with Students
     */
    const { data: employeeWithClassRoom } = await classRoomRepository.createPivotClassRoomAndEmployee(
      students.map<CreatePivotClassRoomAndEmployeePayload>((std) => ({
        class_room_id: classRoomData.id,
        employee_id: std.id,
      })),
    );

    /**
     * Step 6: Create Class room Sessions
     */

    await this.createSessions(classRoomData.id, {
      classRoomSessions: classRoomSessions,
      title,
      description,
      roomType,
    });

    console.log("Create Classroom", classRoomData);
    return classRoomData;
  }

  /**
   * UPDATE
   * @param classRoomId
   * @param payload
   * @returns
   */

  async update(
    classRoomId: string,
    payload: {
      formData: ClassRoom;
      students: ClassRoomStore["state"]["selectedStudents"];
    },
  ) {
    const { formData, students } = payload;
    const userId = this.userId;
    const organizationId = this.organizationId;

    const { data: classRoomDetail, error: classRoomDetailError } = await classRoomRepository.getClassRoomById(
      classRoomId,
    );
    if (!classRoomDetail || classRoomDetailError) {
      console.error(classRoomDetailError);
      throw new Error("ClassRoom not found.");
    }

    const { categories, classRoomSessions, description, thumbnailUrl, roomType, slug, status, title, forWhom, docs } =
      formData;

    const { startDate, endDate } = this.getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
    /**
     * Step 1: Create ClassRoom
     */
    const { data: classRoomData, error: updateError } = await classRoomRepository.upsertClassRoom({
      action: "update",
      payload: {
        id: classRoomId,
        description: description,
        room_type: roomType,
        slug: slug,
        status: status,
        thumbnail_url: thumbnailUrl,
        title: title,
        start_at: startDate,
        end_at: endDate,
        employee_id: userId,
        organization_id: organizationId,
      },
    });

    if (updateError) {
      console.error(updateError);
      throw new Error("Cập nhật lớp học thất bại.");
    }

    /**
     * Step 2: Update Metadata
     */

    await this.updateClassRoomMetadata(classRoomData.id, classRoomDetail, forWhom);

    /**
     * Step 3: Sync Classroom with Employee
     */
    await this.updateStudents(classRoomData.id, classRoomDetail, students);

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
    });

    console.log("Update Susscess", classRoomData);
    return classRoomData;
  }

  private async updateClassRoomMetadata(
    classRoomId: string,
    classRoomDetail: NonNullable<GetClassRoomByIdResponse["data"]>,
    forWhom: ClassRoom["forWhom"],
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
    categories: ClassRoom["categories"],
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

  private async updateSessions(
    classRoomId: string,
    data: {
      title: string;
      description: string;
      oldSessions: NonNullable<GetClassRoomByIdResponse["data"]>["sessions"];
      newSessions: ClassRoom["classRoomSessions"];
      roomType: ClassRoom["roomType"];
    },
  ) {
    const _this = this;
    const { title, description, oldSessions, newSessions, roomType } = data;
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
          const upsertAgendasPayload = _this.mapUpsertAgendaWithSessions(newSession.agendas, sessionId);
          await classSessionAgendaRepository.bulkUpsertAgendas(upsertAgendasPayload);
        })();

        /**
         * Sync Update Session With assignment
         * Optional
         */
        const oldSessionItem = oldSessions.find((item) => item.id === sessionId);
        const syncSessionWithAssignmentPromise = (async () => {
          const oldSessionAssignment = oldSessionItem?.session_assignment;

          if (!newSession.assessmentId) return;

          if (oldSessionAssignment && oldSessionAssignment.assignments.id === newSession.assessmentId) return;

          if (oldSessionAssignment && oldSessionAssignment.assignments.id !== newSession.assessmentId) {
            await classRoomSessionRepository.deletePivotClassSessionWithAssignment([oldSessionAssignment.id]);
          }

          const { data, error } = await classRoomSessionRepository.createPivotClassSessionWithAssignment({
            assignment_id: newSession.assessmentId,
            session_id: sessionData.id,
            start_at: null,
            end_at: null,
          });

          if (error) {
            throw new Error(error.message);
          }
        })();

        /**
         * Sync class Session with course Period
         */

        const syncSessionWithCoursePeriodPromise = (async () => {
          const oldCoursePeriods = oldSessionItem?.courses_period;
          const newCoursePeriods = newSession.coursesPeriod;

          if (oldCoursePeriods) {
            const delList = oldCoursePeriods.filter((cp) => newCoursePeriods.every((ncp) => ncp.id !== cp.id));
            await classRoomSessionRepository.bulkDeletePivotClassSessionWithCoursePeriod(delList.map((cp) => cp.id));
          }

          const payloadCouses = newCoursePeriods.map((cp): UpsertPivotClassSessionWithCoursePeriodPayload => {
            const sessionCoursePeriodId = cp.id;
            if (sessionCoursePeriodId) {
              return {
                action: "update",
                payload: {
                  id: sessionCoursePeriodId,
                  teacher_id: cp.teacher.id,
                  start_at: dayjs(cp.startAt).toISOString(),
                  end_at: dayjs(cp.endAt).toISOString(),
                },
              };
            } else {
              return {
                action: "create",
                payload: {
                  class_session_id: sessionData.id,
                  course_id: cp.course.id,
                  teacher_id: cp.teacher.id,
                  start_at: dayjs(cp.startAt).toISOString(),
                  end_at: dayjs(cp.endAt).toISOString(),
                },
              };
            }
          });

          Promise.all(
            payloadCouses.map(async (payloadCoursePeriod) => {
              const { data, error } = await classRoomSessionRepository.upsertPivotClassSessionWithCoursePeriod(
                payloadCoursePeriod,
              );
            }),
          );
        })();

        /**
         * Update QRCode
         */
        const upsertQrcodePromise = (async () => {
          if (newSession.sessionType !== "offline") return;
          const createQrCodePayload = _this.mapUpSertQrcodeWithSession({
            classRoomId: classRoomId,
            classSessionId: sessionId,
            qrCode: newSession.qrCode,
            useId: _this.userId,
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
          upsertQrcodePromise,
          syncSessionWithAssignmentPromise,
          syncSessionWithCoursePeriodPromise,
        ]);
      }),
    );
  }

  private async createSessions(
    classRoomId: string,
    payload: {
      classRoomSessions: ClassRoom["classRoomSessions"];
      roomType: ClassRoom["roomType"];
      title: string;
      description: string;
    },
  ) {
    const { title, description, roomType, classRoomSessions } = payload;
    const userId = this.userId;
    await Promise.all(
      classRoomSessions.map(async (classSession, _sessionIndex) => {
        try {
          const { data: sessionData, error: sessionError } = await classRoomSessionRepository.createClassSession(
            this.mapSessionWithClassRoom(classSession, roomType, title, description, classRoomId, _sessionIndex),
          );

          if (sessionError) {
            console.log("Create Session failed", sessionError, _sessionIndex);
            throw new Error("Create Classroom Session Failed");
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
              this.mapQrcodeWithSession({
                qrCode: classSession.qrCode,
                classRoomId: classRoomId,
                classSessionId: sessionData.id,
                useId: userId,
              }),
            );
            if (qrcodeError) throw new Error("Create Qrcode Failed");
          })();

          /**
           * Sync class Session to an assignment
           * Optional
           */

          const syncSessionWithAssignmentPromise = (async () => {
            if (!classSession.assessmentId) return;
            console.log("pass", classSession.assessmentId);
            const { data, error } = await classRoomSessionRepository.createPivotClassSessionWithAssignment({
              assignment_id: classSession.assessmentId,
              session_id: sessionData.id,
              start_at: null,
              end_at: null,
            });
            if (error) {
              throw new Error(error.message);
            }
          })();

          /**
           * Sync class Session to with course Period
           */
          const syncSessionWithCoursePeriodPromise = (async () => {
            const payloadCouses = classSession.coursesPeriod.map<CreatePivotClassSessionWithCoursePeriodPayload>(
              (cp) => ({
                class_session_id: sessionData.id,
                course_id: cp.course.id,
                teacher_id: cp.teacher.id,
                start_at: dayjs(cp.startAt).toISOString(),
                end_at: dayjs(cp.endAt).toISOString(),
              }),
            );
            const { data, error } = await classRoomSessionRepository.bulkCreatePivotClassSessionWithCoursePeriod(
              payloadCouses,
            );
            if (error) {
              throw new Error(error.message);
            }
          })();

          /**
           * Run all promise in parrallel
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

  private async updateClassroomWithResource(payload: {
    oldResources: NonNullable<GetClassRoomByIdResponse["data"]>["resources"];
    newResources: ClassRoom["docs"];
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
    roomSessions: ClassRoom["classRoomSessions"],
    roomType: ClassRoom["roomType"],
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

    if (!startDate || !endDate) {
      throw new Error("Room sessions is emplty date");
    }

    return { startDate, endDate };
  }

  /** --------------------------------------------------------
   *  Helper: Map qrCode payloads for offline class
   * -------------------------------------------------------- */
  private mapQrcodeWithSession(data: {
    qrCode: ClassRoom["classRoomSessions"][number]["qrCode"];
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
   *  Helper: Map Update Qrcode payloads
   * -------------------------------------------------------- */

  private mapUpSertQrcodeWithSession(data: {
    qrCode: ClassRoom["classRoomSessions"][number]["qrCode"];
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
    classSession: ClassRoom["classRoomSessions"][number];
    roomType: ClassRoom["roomType"];
    classRoomTitle: string;
    classRoomDescription: string;
    classRoomId: string;
    index: number;
  }): UpSertClassRoomSessionPayload {
    const { classSession, roomType, classRoomTitle, classRoomDescription, classRoomId, index } = data;
    const sessionId = classSession.id;
    const payload = {
      title: roomType === "single" ? classRoomTitle : classSession.title,
      description: roomType === "single" ? classRoomDescription : classSession.description,
      location: classSession.location,
      channel_info: classSession.channelInfo,
      channel_provider: classSession.channelProvider,
      end_at: classSession.endDate,
      start_at: classSession.startDate,
      session_type: classSession.sessionType,
      priority: index + 1,
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
   *  Helper: Map create session payloads
   * -------------------------------------------------------- */
  private mapSessionWithClassRoom(
    classSession: ClassRoom["classRoomSessions"][number],
    roomType: ClassRoom["roomType"],
    classRoomTitle: string,
    classRoomDescription: string,
    classRoomId: string,
    index: number,
  ): CreateClassRoomSessionPayload {
    return {
      title: roomType === "single" ? classRoomTitle : classSession.title,
      description: roomType === "single" ? classRoomDescription : classSession.description,
      location: classSession.location,
      channel_info: classSession.channelInfo,
      channel_provider: classSession.channelProvider,
      end_at: classSession.endDate,
      start_at: classSession.startDate,
      session_type: classSession.sessionType,
      class_room_id: classRoomId,
      priority: index + 1,
    };
  }

  /** --------------------------------------------------------
   *  Helper: Map Upsert Agenda with session payloads
   * -------------------------------------------------------- */

  private mapUpsertAgendaWithSessions(agendas: ClassRoom["classRoomSessions"][number]["agendas"], sessionId: string) {
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

  /** --------------------------------------------------------
   *  Helper: Map Agenda with session payloads
   * -------------------------------------------------------- */
  private mapAgendaWithSessions(
    agendas: ClassRoom["classRoomSessions"][number]["agendas"],
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
}
