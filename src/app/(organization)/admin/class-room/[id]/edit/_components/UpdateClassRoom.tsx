"use client";
import ManageClassRoomForm, {
  ManageClassRoomFormProps,
  ManageClassRoomFormRef,
} from "@/modules/class-room-management/components/ManageClassRoomForm";
import { useCRUDClassRoom } from "@/modules/class-room-management/hooks/useCRUDClassRoom";
import { useMemo, useRef } from "react";

import { getClassRoomMetaValue } from "@/modules/class-room-management/utils";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { GetClassRoomByIdData } from "../page";
import { PATHS } from "@/constants/path.contstants";
type UpdateClassRoomFormValue = Exclude<ManageClassRoomFormProps["initFormValue"], undefined>;
type ClassRoomSession = UpdateClassRoomFormValue["classRoomSessions"][number];
type SessionAgenda = UpdateClassRoomFormValue["classRoomSessions"][number]["agendas"][number];
type TeacherType = Exclude<ManageClassRoomFormProps["teachers"], undefined>;
type StudentType = Exclude<ManageClassRoomFormProps["students"], undefined>;

interface UpdateClassRoomProps {
  data: Exclude<GetClassRoomByIdData, null>;
}
const UpdateClassRoom: React.FC<UpdateClassRoomProps> = ({ data }) => {
  const router = useRouter();
  const { sessions, employees } = data;
  const [isTransition, startTransition] = useTransition();
  const { enqueueSnackbar } = useSnackbar();
  const formClassRoomRef = useRef<ManageClassRoomFormRef>(null);
  const { isLoading, onUpdate } = useCRUDClassRoom();
  const handleCancelUpdate = () => {
    startTransition(() => {
      router.push(PATHS.CLASSROOMS.ROOT);
    });
  };

  const platform = sessions.every((s) => s.session_type === "live")
    ? "live"
    : sessions.every((s) => s.session_type === "offline")
    ? "offline"
    : sessions.every((s) => s.session_type === "online")
    ? "online"
    : "hybrid";

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

      const coursePeriods = session.courses_period.map<ClassRoomSession["coursesPeriod"][number]>((cp) => ({
        startAt: cp.start_at || "",
        endAt: cp.end_at || "",
        course: {
          id: cp.course.id,
          title: cp.course.title || "",
        },
        teacher: {
          id: cp.teacher?.id || "",
          name: cp.teacher?.profile?.full_name || "",
          departmentName: "",
        },
      }));
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
          coursesPeriod: coursePeriods,
          assessmentId: session.session_assignment?.assignments.id || "",
          qrCode: {
            id: session.class_qr_codes[0]?.id,
            isLimitTimeScanQrCode:
              Boolean(session.class_qr_codes[0]?.checkin_start_time) &&
              Boolean(session.class_qr_codes[0]?.checkin_end_time),
            startDate: session.class_qr_codes[0]?.checkin_start_time || "",
            endDate: session.class_qr_codes[0]?.checkin_end_time || "",
          },
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
    };
  }, [data]);

  /**
   * remove teader to class sessions
   */
  // const teacherList = useMemo(() => {
  //   return sessions.reduce<TeacherType>((acc, session, _index) => {
  //     return {
  //       ...acc,
  //       [_index]: session.teachers.reduce<TeacherType[number]>((teacherSumary, tc) => {
  //         return tc.employee && tc.employee.employee_type === "teacher"
  //           ? [
  //               ...teacherSumary,
  //               {
  //                 id: tc.employee?.id,
  //                 avatar: tc.employee?.profile?.avatar || "",
  //                 email: tc.employee?.profile?.email || "",
  //                 fullName: tc.employee?.profile?.full_name || "",
  //                 employeeCode: tc.employee.employee_code || "",
  //                 empoyeeType: tc.employee.employee_type,
  //               },
  //             ]
  //           : teacherSumary;
  //       }, []),
  //     };
  //   }, {});
  // }, [sessions]);

  const studentList = useMemo(() => {
    return employees.reduce<StudentType>((acc, emp) => {
      return emp.employee && emp.employee.employee_type === "student"
        ? [
            ...acc,
            {
              id: emp.employee.id,
              avatar: emp.employee.profile?.avatar || "",
              email: emp.employee.profile?.email || "",
              employeeCode: emp.employee.employee_code,
              empoyeeType: emp.employee.employee_type,
              fullName: emp.employee.profile?.full_name || "",
            },
          ]
        : acc;
    }, []);
  }, [employees]);

  const handleUpdateClassRoom: ManageClassRoomFormProps["onSubmit"] = (formData, students, teachers) => {
    onUpdate(
      { classRoomId: data.id, formData, students, teachers },
      {
        onSuccess(data, variables, onMutateResult, context) {
          enqueueSnackbar("Cập nhật lớp học thành công..", { variant: "success" });
          router.refresh();
        },
      },
    );
  };

  return (
    <ManageClassRoomForm
      initFormValue={initFormValue}
      action="edit"
      students={studentList}
      // teachers={teacherList}
      isLoading={isLoading || isTransition}
      platform={platform}
      onSubmit={handleUpdateClassRoom}
      onCancel={handleCancelUpdate}
      ref={formClassRoomRef}
    />
  );
};
export default UpdateClassRoom;
