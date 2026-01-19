"use client";
import React, { useMemo, useRef } from "react";
import { useTransition } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import ManageClassRoomForm, {
  ManageClassRoomFormProps,
  ManageClassRoomFormRef,
} from "@/modules/class-room-management/components/ManageClassRoomForm";
import { useCRUDClassRoom } from "@/modules/class-room-management/hooks/useCRUDClassRoom";
import { getClassRoomMetaValue } from "@/modules/class-room-management/utils";
import type { GetClassRoomByIdData } from "../page";
type UpdateClassRoomFormValue = Exclude<ManageClassRoomFormProps["initFormValue"], undefined>;
type ClassRoomSession = UpdateClassRoomFormValue["classRoomSessions"][number];
type SessionAgenda = UpdateClassRoomFormValue["classRoomSessions"][number]["agendas"][number];
type StudentItem = Exclude<ManageClassRoomFormProps["students"], undefined>[number];
import { useUpdateClassRoomMutation } from "@/modules/class-room-management/operations/mutation";
interface UpdateClassRoomFormProps {
  data: Exclude<GetClassRoomByIdData, null>;
}
const UpdateClassRoomForm: React.FC<UpdateClassRoomFormProps> = ({ data }) => {
  const router = useRouter();
  const { sessions, employees, class_type } = data;
  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const formClassRoomRef = useRef<ManageClassRoomFormRef>(null);
  // const { isLoading, onUpdate } = useCRUDClassRoom();

  const { mutate: onUpdate, isPending: isLoading } = useUpdateClassRoomMutation();

  const platform = useMemo(() => {
    return sessions.every((s) => s.session_type === "live")
      ? "live"
      : sessions.every((s) => s.session_type === "offline")
      ? "offline"
      : sessions.every((s) => s.session_type === "online")
      ? "online"
      : "hybrid";
  }, [sessions]);

  console.log({ data });

  const initFormValue = useMemo((): UpdateClassRoomFormValue => {
    const { sessions, class_room_metadata, resources } = data;

    const categories = data?.class_room_field.reduce<string[]>((acc, item) => {
      const fieldId = item.categories?.id;
      return fieldId ? [...acc, fieldId] : acc;
    }, []);

    const classRoomSessions = sessions.reduce<ClassRoomSession[]>((acc, session) => {
      const channelInfo = {
        providerId: session.channel_info?.providerId || "",
        url: session.channel_info?.url || "",
        password: session.channel_info?.password || "",
      };

      const agendas = session.agendas.map<SessionAgenda>((agenda) => ({
        id: agenda.id,
        endDate: agenda.end_at ? dayjs(session.end_at).toISOString() : "",
        startDate: agenda.start_at ? dayjs(session.start_at).toISOString() : "",
        title: agenda.title || "",
        description: agenda.description || "",
      }));

      const coursePeriodGroupByCourseId = Map.groupBy(session.courses_period, (item) => item.course.id);

      console.log({ coursePeriodGroupByCourseId });

      /**
       * Grouping teachers by course Item
       */
      const periodsMap = new Map<string, ClassRoomSession["coursesPeriod"][number]>();

      for (const { start_at, end_at, course, teacher, id: coursePeriodId, weekly_schedule } of session.courses_period) {
        let item = periodsMap.get(course.id);

        if (!item) {
          item = {
            id: coursePeriodId,
            startAt: start_at || "",
            endAt: end_at || "",
            course: {
              id: course.id,
              title: course.title || "",
            },
            teachers: [],
            weeklySchedule: {
              from: weekly_schedule?.from,
              to: weekly_schedule?.to,
              isDuration: weekly_schedule?.isDuration || false,
              duration: weekly_schedule?.duration,
            },
          };
          periodsMap.set(course.id, item);
        }

        if (teacher && !item.teachers.some((t) => t.teacherId === teacher.id)) {
          item.teachers.push({
            recordId: coursePeriodId,
            teacherId: teacher.id,
            teacherName: teacher.profile?.full_name || "",
            teacherDepartment: "",
          });
        }
      }
      const coursesPeriod = Array.from(periodsMap.values());

      return [
        ...acc,
        {
          id: session.id,
          title: session.title || "",
          description: session.description || "",
          thumbnailUrl: "",
          location: session.location,
          endDate: session.end_at ? dayjs(session.end_at).toISOString() : "",
          startDate: session.start_at ? dayjs(session.start_at).toISOString() : "",
          sessionType: session.session_type,
          channelProvider: session.channel_provider || "zoom",
          channelInfo: channelInfo,
          agendas: agendas,
          coursesPeriod: coursesPeriod,
          assignments: session.session_assignments.map((item) => ({
            recordId: item.id,
            assignmentId: item.assignments.id,
            name: item.assignments.name,
          })),
          qrCode: {
            id: session.class_qr_codes[0]?.id,
            isLimitTimeScanQrCode:
              Boolean(session.class_qr_codes[0]?.checkin_start_time) &&
              Boolean(session.class_qr_codes[0]?.checkin_end_time),
            startDate: session.class_qr_codes[0]?.checkin_start_time || "",
            endDate: session.class_qr_codes[0]?.checkin_end_time || "",
          },
          weeklySchedule: session.weekly_schedule ?? undefined,
        } as UpdateClassRoomFormValue["classRoomSessions"][number],
      ];
    }, []);

    // const faqs = getClassRoomMetaValue(class_room_metadata, "faqs");
    // const galleries = getClassRoomMetaValue(class_room_metadata, "galleries");
    // const whies = getClassRoomMetaValue(class_room_metadata, "why");
    const forWhom = getClassRoomMetaValue(class_room_metadata, "forWhom");

    return {
      title: data.title || "",
      slug: data.slug || "",
      description: data.description || "",
      classRoomSessions: classRoomSessions,
      thumbnailUrl: data.thumbnail_url || "",
      categories: categories,
      docs: resources.map(({ resource }) => ({
        id: resource.id,
        mimeType: resource.mime_type || "",
        name: resource.name,
        url: resource.path || "",
      })),
      forWhom: forWhom ? forWhom.map((item) => ({ description: item })) : [],
      status: data.status,
      roomType: data.room_type || "single",
      classRoomId: data.id,
      platform: platform,
      classType: class_type ?? "room",
    };
  }, [data, platform, class_type]);

  const certificateData = useMemo(() => {
    const cert = data.certificate?.[0];
    if (!cert?.certificate_template) {
      return null;
    }

    return {
      id: cert.certificate_template.id,
      name: cert.certificate_template.name || "",
      frameUrl: cert.certificate_template.frame?.image_url || null,
    };
  }, [data.certificate]);

  const studentList = useMemo(() => {
    return employees.reduce<StudentItem[]>((acc, emp) => {
      return emp.employee && emp.employee.employee_type === "student"
        ? [
            ...acc,
            {
              id: emp.employee.id,
              avatar: emp.employee.profile?.avatar || "",
              email: emp.employee.profile?.email || "",
              employeeCode: emp.employee.employee_code,
              employeeType: emp.employee.employee_type,
              fullName: emp.employee.profile?.full_name || "",
            },
          ]
        : acc;
    }, []);
  }, [employees]);

  const handleUpdateClassRoom: ManageClassRoomFormProps["onSubmit"] = (formData, students, certificate) => {
    onUpdate(
      { classRoomId: data.id, formData, students, certificate },
      {
        onSuccess(data, variables, onMutateResult, context) {
          enqueueSnackbar("Cập nhật lớp học thành công..", { variant: "success" });
          // router.refresh();
          router.push(PATHS.CLASSROOMS.LIST_CLASSROOM);
        },
      },
    );
  };
  const handleCancelUpdate = () => {
    startTransition(() => {
      router.push(PATHS.CLASSROOMS.ROOT);
    });
  };

  return (
    <ManageClassRoomForm
      initFormValue={initFormValue}
      action="edit"
      students={studentList}
      certificate={certificateData}
      isLoading={isLoading || isTransition}
      platform={platform}
      onSubmit={handleUpdateClassRoom}
      onCancel={handleCancelUpdate}
      isLearningPath={class_type === "learning_path"}
      ref={formClassRoomRef}
    />
  );
};
export default UpdateClassRoomForm;
