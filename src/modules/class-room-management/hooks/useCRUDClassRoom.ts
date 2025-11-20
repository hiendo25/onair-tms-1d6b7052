"use client";
import {
  classRoomRepository,
  classRoomSessionRepository,
  classRoomMetaRepository,
  classSessionAgendaRepository,
} from "@/repository";
import type {
  CreatePivotClassRoomAndEmployeePayload,
  CreatePivotClassRoomAndFieldPayload,
  CreatePivotClassRoomWithResourcePayload,
} from "@/repository/class-room";
import type {
  CreateClassRoomSessionPayload,
  CreatePivotClassSessionWithCoursePeriodPayload,
  UpSertClassRoomSessionPayload,
} from "@/repository/class-session";
import { CreateSessionAgendasPayload, UpSertSessionAgendaPayload } from "@/repository/class-session-agenda";
import { enqueueSnackbar } from "notistack";

import { ClassRoom } from "../components/ManageClassRoomForm/classroom-form.schema";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";
import { useTMutation } from "@/lib";
import { ClassRoomStore } from "../store/class-room-store";
import { isUndefined } from "lodash";
import { qrAttendanceRepository } from "@/repository";
import { CreateQRCodePayload, UpSertQrCodePayload } from "@/repository/qr-attendance";
import dayjs from "dayjs";

const useCRUDClassRoom = () => {
  const userInfo = useUserOrganization((state) => state.data);

  const { mutate: doCreateClassRoom, isPending } = useTMutation({
    mutationKey: ["CREATE_CLASS_ROOM"],
    mutationFn: async (payload: {
      formData: ClassRoom;
      teachers: ClassRoomStore["state"]["selectedTeachers"];
      students: ClassRoomStore["state"]["selectedStudents"];
    }) => {
      const { formData, teachers, students } = payload;
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

      const { startDate, endDate } = getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
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
          created_by: userInfo.id,
          start_at: startDate,
          end_at: endDate,
          organization_id: userInfo.organization.id,
        },
      });

      if (error) {
        console.log("Create Classroom Failed", error);
        throw new Error("Create Class Room failed.");
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

      await Promise.all(
        classRoomSessions.map(async (classSession, _sessionIndex) => {
          try {
            const { data: sessionData, error: sessionError } = await classRoomSessionRepository.createClassSession(
              mapSessionWithClassRoom(classSession, roomType, title, description, classRoomData.id, _sessionIndex),
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
                mapAgendaWithSessions(classSession.agendas, sessionData.id),
              );
            })();

            /**
             * Teachers
             *  teacher removed from Update 20/11/2025
             */
            // const teacherPromise = (async () => {
            //   const teachersList = teachers[_sessionIndex] || [];
            //   const { error: teacherError } = await classRoomSessionRepository.createPivotClassSessionAndTeacher(
            //     teachersList.map((tc) => ({
            //       class_session_id: sessionData.id,
            //       teacher_id: tc.id,
            //     })),
            //   );
            //   if (teacherError) throw new Error("Create Teacher failed");
            // })();

            /**
             * QRCode
             * this QRcode only for classroom is offline
             */
            const qrCodePromise = (async () => {
              if (platform !== "offline") return;
              const { error: qrcodeError } = await qrAttendanceRepository.createClassQRCode(
                mapQrcodeWithSession({
                  qrCode: classSession.qrCode,
                  classRoomId: classRoomData.id,
                  classSessionId: sessionData.id,
                  useId: userInfo.id,
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
             * Sync class Session to an assignment
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
          } catch (err) {
            console.error(`Session ${_sessionIndex} failed:`, error);
            throw error;
          }
        }),
      );
      console.log("Create Classroom", classRoomData);
      return classRoomData;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  const { mutate: doUpdateClassRoom, isPending: isPendingUpdate } = useTMutation({
    mutationKey: ["UPDATE_CLASS_ROOM"],
    mutationFn: async (payload: {
      classRoomId: string;
      formData: ClassRoom;
      teachers: ClassRoomStore["state"]["selectedTeachers"];
      students: ClassRoomStore["state"]["selectedStudents"];
    }) => {
      const { formData, teachers, students, classRoomId } = payload;
      const { data: classRoomDetail, error: classRoomDetailError } = await classRoomRepository.getClassRoomById(
        classRoomId,
      );
      if (!classRoomDetail || classRoomDetailError) {
        console.error(classRoomDetailError);
        throw new Error("ClassRoom not found.");
      }

      const {
        categories,
        // hashTags,
        classRoomSessions,
        // communityInfo,
        // galleries,
        description,
        thumbnailUrl,
        roomType,
        slug,
        status,
        title,
        // faqs,
        forWhom,
        docs,
        platform,
        // whies,
      } = formData;

      const { startDate, endDate } = getStartDateAndEndDateFromClassSession(classRoomSessions, roomType);
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
          created_by: userInfo.id,
          start_at: startDate,
          end_at: endDate,
          organization_id: userInfo.organization.id,
        },
      });

      if (updateError) {
        console.error(updateError);
        throw new Error("Cập nhật lớp học thất bại.");
      }

      /**
       * Step 2: Update Metadata
       */

      // const faqMetadata = classRoomDetail.class_room_metadata.find((item) => item.key === "faqs");
      // const { error: faqsDataError } = await classRoomMetaRepository.upsertClassRoomMeta({
      //   id: faqMetadata?.id,
      //   class_room_id: classRoomData.id,
      //   key: "faqs",
      //   value: faqs.map((faq) => ({ answer: faq.answer, question: faq.question })),
      // });
      // if (faqsDataError) {
      //   console.error(faqsDataError);
      // }
      // const whyMetadata = classRoomDetail.class_room_metadata.find((item) => item.key === "why");
      // const { error: whyError } = await classRoomMetaRepository.upsertClassRoomMeta({
      //   id: whyMetadata?.id,
      //   class_room_id: classRoomData.id,
      //   key: "why",
      //   value: whies.map((item) => item.description),
      // });

      // if (whyError) {
      //   console.error(whyError);
      // }

      const forWhomMetadata = classRoomDetail.class_room_metadata.find((item) => item.key === "forWhom");
      const { error: forWhomError } = await classRoomMetaRepository.upsertClassRoomMeta({
        id: forWhomMetadata?.id,
        class_room_id: classRoomData.id,
        key: "forWhom",
        value: forWhom.map((item) => item.description),
      });

      if (forWhomError) {
        console.log(forWhomError);
      }
      // const galleriesMeta = classRoomDetail.class_room_metadata.find((item) => item.key === "galleries");
      // const { error: galleriesDataError } = await classRoomMetaRepository.upsertClassRoomMeta({
      //   id: galleriesMeta?.id,
      //   class_room_id: classRoomData.id,
      //   key: "galleries",
      //   value: galleries,
      // });

      // if (galleriesDataError) {
      //   console.log(galleriesDataError);
      // }

      /**
       * Step 3: Sync Classroom with Employee
       */

      const studentListDeletion = classRoomDetail.employees.filter((row) =>
        students.every((std) => std.id !== row.employee?.id),
      );
      const studentListAddition = students.filter((std) =>
        classRoomDetail.employees.every((row) => row.employee?.id !== std.id),
      );

      console.log({ studentListDeletion, studentListAddition, newList: students, oldList: classRoomDetail.employees });
      if (studentListDeletion.length) {
        await classRoomRepository.deletePivotClassRoomAndEmployee(studentListDeletion.map((row) => row.id));
      }
      if (studentListAddition.length) {
        await classRoomRepository.createPivotClassRoomAndEmployee(
          studentListAddition.map((tc) => ({
            class_room_id: classRoomData.id,
            employee_id: tc.id,
          })),
        );
      }

      /**
       * Step 4: Sync Classroom old Class Field to new Class Fields
       */
      const currentClassRoomFields = [...classRoomDetail.class_room_field];
      const currentCategoriesIds = currentClassRoomFields
        .map((item) => item.categories?.id)
        .filter((item) => !isUndefined(item));

      const classRoomFieldListAddition = categories.filter((id) => !currentCategoriesIds.includes(id));
      const classRoomFieldListDeletation = currentClassRoomFields.filter((it) =>
        categories.every((id) => id !== it.categories?.id),
      );

      if (classRoomFieldListAddition.length) {
        await classRoomRepository.createPivotClassRoomAndField(
          classRoomFieldListAddition.map((fieldId) => ({
            class_field_id: fieldId,
            class_room_id: classRoomData.id,
          })),
        );
      }
      if (classRoomFieldListDeletation.length) {
        await classRoomRepository.deletePivotClassRoomAndField(classRoomFieldListDeletation.map((it) => it.id));
      }

      /**
       * Step 5: Sync Classroom old hashtag to new hashtag
       * Remove Hash Tags to class room - update 6/11
       */
      // const currentClassRoomTags = [...classRoomDetail.class_hash_tag];
      // const currentClassClassRoomHashTagIds = currentClassRoomTags
      //   .map((item) => item.hash_tags?.id)
      //   .filter((item) => !isUndefined(item));

      // const classRoomHashTagsAddition = hashTags.filter((id) => !currentClassClassRoomHashTagIds.includes(id)); //Add List

      // const classRoomHashTagsDeletation = currentClassRoomTags.filter((it) =>
      //   hashTags.every((id) => id !== it.hash_tags?.id),
      // );

      // if (classRoomHashTagsAddition.length) {
      //   await classRoomRepository.createPivotClassRoomAndHashTag(
      //     classRoomHashTagsAddition.map((hashTagId) => ({
      //       hash_tag_id: hashTagId,
      //       class_room_id: classRoomData.id,
      //     })),
      //   );
      // }

      // if (classRoomHashTagsDeletation.length) {
      //   await classRoomRepository.deletePivotClassRoomAndHashTag(classRoomHashTagsDeletation.map((it) => it.id));
      // }

      /**
       * Step 6: Sync Old Sessions with new Sessions
       * todo: compare new sessions List: classRoomSessions vs old Session List: classRoomDetail/sessions
       * - delete: these session has Id in classRoomSessions is not in classRoomDetail/sessions.
       * - create: if some sessions in classRoomSessions has no Id
       */

      /**
       * Step 6 - 1: Delete Session
       */
      const sessionListDeletion = classRoomDetail.sessions.filter((s) =>
        classRoomSessions.every((newS) => s.id !== newS.id),
      );
      const sessionListAddNew = classRoomSessions.filter((newS) => !newS.id);

      console.log({ classRoomSessions, sessionListDeletion, sessionListAddNew });

      if (sessionListDeletion.length) {
        // const pivotSessionWithTeacherIdsDeletion = sessionListDeletion.reduce<string[]>((acc, session) => {
        //   const pivotIds = session.teachers.map((tc) => tc.id);
        //   return [...acc, ...pivotIds];
        // }, []);

        const agendaIdsDeletion = sessionListDeletion.reduce<string[]>((acc, session) => {
          const agendaIds = session.agendas.map((ag) => ag.id);
          return [...acc, ...agendaIds];
        }, []);

        // await classRoomSessionRepository.deletePivotClassSessionAndTeacher(pivotSessionWithTeacherIdsDeletion);

        await classSessionAgendaRepository.deleteAgendas(agendaIdsDeletion);

        await classRoomSessionRepository.deleteClassSession(sessionListDeletion.map((s) => s.id));
      }
      /**
       * Step 6 - 2: UpSert Session
       */

      await Promise.all(
        classRoomSessions.map(async (classSession, _sessionIndex) => {
          const classSessionPayload = mapUpSertSessionWithClassRoom({
            classRoomTitle: title,
            classRoomDescription: description,
            classRoomId: classRoomData.id,
            classSession: classSession,
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
            const upsertAgendasPayload = mapUpsertAgendaWithSessions(classSession.agendas, sessionId);
            await classSessionAgendaRepository.bulkUpsertAgendas(upsertAgendasPayload);
          })();

          /**
           * Update Teacher
           * no update teacher -> removed
           */
          // const upsertTeacherPromise = (async () => {
          //   const pivotTeacherIdsDeletion = sessionData.teachers.map((tc) => tc.id);
          //   await classRoomSessionRepository.deletePivotClassSessionAndTeacher(pivotTeacherIdsDeletion);
          //   const newTeacherListBySession = teachers[_sessionIndex] || [];

          //   const { data: sessionTeacher, error: sessionTeacherError } =
          //     await classRoomSessionRepository.createPivotClassSessionAndTeacher(
          //       newTeacherListBySession.map((tc) => ({
          //         class_session_id: sessionId,
          //         teacher_id: tc.id,
          //       })),
          //     );
          //   if (sessionTeacherError) throw new Error(`Upsert Teacher Session index: ${_sessionIndex} failed`);
          // })();

          /**
           * Update QRCode
           */
          const upsertQrcodePromise = (async () => {
            if (platform !== "offline") return;
            const createQrCodePayload = mapUpSertQrcodeWithSession({
              classRoomId: classRoomId,
              classSessionId: sessionId,
              qrCode: classSession.qrCode,
              useId: userInfo.id,
            });
            const { data: qrCodeData, error: qrCodeError } = await qrAttendanceRepository.upsertQRCode(
              createQrCodePayload,
            );
            if (qrCodeError) throw new Error(`Upsert QrCode Session index: ${_sessionIndex} failed`);
          })();

          /**
           * Parallel update
           */
          await Promise.all([upsertAgendaPromise, upsertQrcodePromise]);
        }),
      );

      console.log("Update Susscess", classRoomData);
      return classRoomData;
    },
    onError: (error) => {
      enqueueSnackbar({ message: error.message, variant: "error" });
    },
  });

  /** --------------------------------------------------------
   *  Helper: Get start/end date from sessions
   * -------------------------------------------------------- */
  const getStartDateAndEndDateFromClassSession = (
    roomSessions: ClassRoom["classRoomSessions"],
    roomType: ClassRoom["roomType"],
  ) => {
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
  };

  /** --------------------------------------------------------
   *  Helper: Map qrCode payloads for offline class
   * -------------------------------------------------------- */
  const mapQrcodeWithSession = (data: {
    qrCode: ClassRoom["classRoomSessions"][number]["qrCode"];
    classRoomId: string;
    classSessionId: string;
    useId: string;
  }): CreateQRCodePayload => {
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
  };

  /** --------------------------------------------------------
   *  Helper: Map Update Qrcode payloads
   * -------------------------------------------------------- */

  const mapUpSertQrcodeWithSession = (data: {
    qrCode: ClassRoom["classRoomSessions"][number]["qrCode"];
    classRoomId: string;
    classSessionId: string;
    useId: string;
  }): UpSertQrCodePayload => {
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
  };

  /** --------------------------------------------------------
   *  Helper: Map Upsert session payloads
   * -------------------------------------------------------- */
  const mapUpSertSessionWithClassRoom = (data: {
    classSession: ClassRoom["classRoomSessions"][number];
    roomType: ClassRoom["roomType"];
    classRoomTitle: string;
    classRoomDescription: string;
    classRoomId: string;
    index: number;
  }): UpSertClassRoomSessionPayload => {
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
      assignment_id: classSession.assessmentId || null,
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
  };

  /** --------------------------------------------------------
   *  Helper: Map create session payloads
   * -------------------------------------------------------- */
  const mapSessionWithClassRoom = (
    classSession: ClassRoom["classRoomSessions"][number],
    roomType: ClassRoom["roomType"],
    classRoomTitle: string,
    classRoomDescription: string,
    classRoomId: string,
    index: number,
  ): CreateClassRoomSessionPayload => {
    return {
      title: roomType === "single" ? classRoomTitle : classSession.title,
      description: roomType === "single" ? classRoomDescription : classSession.description,
      location: classSession.location,
      channel_info: classSession.channelInfo,
      channel_provider: classSession.channelProvider,
      end_at: classSession.endDate,
      start_at: classSession.startDate,
      session_type: classSession.sessionType,
      assignment_id: classSession.assessmentId || null,
      class_room_id: classRoomId,
      priority: index + 1,
    };
  };

  /** --------------------------------------------------------
   *  Helper: Map Upsert Agenda with session payloads
   * -------------------------------------------------------- */
  const mapUpsertAgendaWithSessions = (
    agendas: ClassRoom["classRoomSessions"][number]["agendas"],
    sessionId: string,
  ): UpSertSessionAgendaPayload[] => {
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
  };

  /** --------------------------------------------------------
   *  Helper: Map Agenda with session payloads
   * -------------------------------------------------------- */
  const mapAgendaWithSessions = (
    agendas: ClassRoom["classRoomSessions"][number]["agendas"],
    sessionId: string,
  ): CreateSessionAgendasPayload[] => {
    return agendas.map<CreateSessionAgendasPayload>((agenda) => ({
      class_session_id: sessionId,
      title: agenda.title,
      description: agenda.description,
      start_at: agenda.startDate,
      end_at: agenda.endDate,
      thumbnail_url: null,
    }));
  };

  return {
    onCreate: doCreateClassRoom,
    onUpdate: doUpdateClassRoom,
    isLoading: isPending || isPendingUpdate,
  };
};
export { useCRUDClassRoom };
