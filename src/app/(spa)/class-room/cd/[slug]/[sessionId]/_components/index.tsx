"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetClassRoomSessionDetailQuery } from "@/modules/class-room-management/operations/query";
import { Avatar, AvatarGroup, Box, Container, Tooltip, Typography } from "@mui/material";
import TimeCountDown from "./time-count-down";
import JoinButton from "./join-button";
import { extractTeachers, resolveJoinUrl } from "../helper";
import { useUserOrganization } from "@/modules/organization/store/UserOrganizationProvider";

interface ClassRoomCountDownSection {
    sessionId: string;
}

const ClassRoomCountDownSection = ({ sessionId }: ClassRoomCountDownSection) => {
    const router = useRouter();
    const { data, isPending, isError } = useGetClassRoomSessionDetailQuery({
        sessionId,
    });
    const classSession = data ?? null;
    const classRoom = classSession?.class_room ?? null;
    const { id: userEmployeeId, employeeType, organization } = useUserOrganization((state) => state.data);

    const assignees = classRoom?.assignees ?? [];
    const teacherAssignments = classSession?.teacherAssignments ?? [];

    const isSameOrganization = Boolean(
        classRoom?.organization_id && organization?.id && classRoom.organization_id === organization.id,
    );
    const isAdmin = employeeType === "admin";
    const isTeacher = employeeType === "teacher";

    const isAssignedToClassRoom = useMemo(() => {
        return assignees?.some((assignee) => {
            const assignedId = assignee?.employee_id ?? assignee?.employee?.id;
            return Boolean(assignedId) && assignedId === userEmployeeId;
        }) ?? false;
    }, [assignees, userEmployeeId]);

    const isAssignedToSession = useMemo(() => {
        if (!isTeacher) {
            return false;
        }

        return teacherAssignments.some((assignment) => {
            const assignedTeacherId = assignment?.teacher_id ?? assignment?.teacher?.id;
            return Boolean(assignedTeacherId) && assignedTeacherId === userEmployeeId;
        });
    }, [isTeacher, teacherAssignments, userEmployeeId]);

    const canAccess = isSameOrganization && (
        (isAdmin) ||
        (isTeacher && isAssignedToSession) ||
        (!isAdmin && !isTeacher && isAssignedToClassRoom)
    );

    const shouldRedirectToForbidden = Boolean(
        !isPending && !isError && classSession && classRoom && !canAccess,
    );

    useEffect(() => {
        if (shouldRedirectToForbidden) {
            router.replace("/403");
        }
    }, [shouldRedirectToForbidden, router]);

    const teachers = useMemo(
        () => extractTeachers(classSession),
        [classSession],
    );

    const coverImage = classRoom?.thumbnail_url;
    const targetDate = classSession?.start_at ?? classRoom?.start_at ?? null;
    const joinUrl = resolveJoinUrl(classSession);
    const isOwner = classRoom?.employee_id === userEmployeeId;
    const shouldMarkAttendance = !isOwner && !isAdmin;

    if (isPending) {
        return (
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 mt-4">
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                    <div className="flex-1 animate-pulse rounded-2xl bg-white p-6 shadow-sm">
                        <div className="h-6 w-3/4 rounded bg-slate-200" />
                        <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                        <div className="mt-6 h-64 rounded-2xl bg-slate-200 md:h-[420px]" />
                    </div>
                    <div className="md:w-[360px]">
                        <div className="h-full animate-pulse rounded-2xl bg-white p-6 shadow-sm">
                            <div className="h-4 w-1/2 rounded bg-slate-200" />
                            <div className="mt-4 h-16 rounded bg-slate-200" />
                            <div className="mt-6 h-12 rounded bg-slate-200" />
                            <div className="mt-4 h-10 rounded bg-slate-200" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !classSession || !classRoom) {
        return (
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm mt-4">
                <h1 className="text-xl font-semibold text-gray-900">
                    Không tìm thấy phiên học
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Vui lòng kiểm tra lại đường dẫn hoặc liên hệ quản trị viên để được hỗ trợ.
                </p>
                <Link
                    href="/class-room"
                    className="mt-6 inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    Danh sách lớp học
                </Link>
            </div>
        );
    }

    if (shouldRedirectToForbidden) {
        return null;
    }

    return (
        <Container>
            <div className="mt-40">
                <section className="flex flex-col w-full items-center ">
                    <Typography className="text-[#0B1218FF] md:text-[24px] text-[16px] md:font-bold font-semibold text-center w-full md:w-3/5 md:self-start">
                        {data?.class_room?.title} - {data?.title}
                    </Typography>

                    <div className="w-full flex flex-col md:flex-row md:mt-4 md:mb-0 mb-3">
                        <div className="w-full  md:w-3/5 mt-4 md:mt-0  ">
                            <div
                                className=" w-full rounded-lg  h-auto  "
                                style={{
                                    boxShadow: "0px 0px 100px 16px rgba(15, 15, 15, 0.2)",
                                }}
                            >
                                <Box
                                    className="aspect-video w-full h-auto rounded-lg "
                                    sx={{
                                        background: `url('${coverImage}')`,
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center center",
                                    }}
                                />
                            </div>
                        </div>

                        <section className="flex flex-col items-center md:pl-6 w-full mt-4 md:mt-0 md:w-2/5">
                            <section className="flex flex-col items-center md:max-w-[480px] max-w-[340px] w-full">
                                <section className="flex justify-center flex-col lg:flex-row items-center">
                                    <Typography className="text-[12px] md:mr-2 mr-0">
                                        Lớp học được tổ chức <span className="font-bold">bởi Giảng viên</span>
                                    </Typography>
                                </section>
                                <div className="flex justify-center items-center mt-2 md:mt-0">
                                    <AvatarGroup sx={{ justifyContent: "center" }} variant="circular" max={7}>
                                        {teachers.map((teacher) => {
                                            return (
                                                <Tooltip key={teacher.id} title={teacher.name}>
                                                    <Avatar
                                                        alt={teacher.name}
                                                        src="/static/images/avatar/3.jpg"
                                                        sx={{ width: 40, height: 40 }}
                                                    />
                                                </Tooltip>
                                            )
                                        })}
                                    </AvatarGroup>
                                </div>

                                <section className="mt-6 text-sm font-semibold flex flex-col items-center w-full">
                                    <div>Lớp học bắt đầu sau</div>
                                    <TimeCountDown
                                        startDate={targetDate!}
                                        roomUrl={joinUrl!}
                                        className="mt-4"
                                        classRoomId={classRoom.id}
                                        classSessionId={classSession.id}
                                        employeeId={userEmployeeId}
                                        shouldMarkAttendance={shouldMarkAttendance}
                                    />
                                </section>
                            </section>

                            <Box my={3}>
                                <Typography className="font-normal text-[12px] text-[#637381]">
                                    Hệ thống sẽ tự động chuyển vào lớp học khi tới giờ
                                </Typography>
                            </Box>

                            <JoinButton
                                startDate={targetDate!}
                                roomUrl={joinUrl!}
                                isOwner={isOwner}
                                classRoomId={classRoom.id}
                                classSessionId={classSession.id}
                                employeeId={userEmployeeId}
                                shouldMarkAttendance={shouldMarkAttendance}
                            />

                            <Link href={'/'} className="mt-6">
                                <Typography className="text-primary font-bold  cursor-pointer text-sm text-[#0050FF]">
                                    Trở về trang chi tiết lớp học
                                </Typography>
                            </Link>
                        </section>
                    </div>
                </section>
            </div>
        </Container>
    );
};

export default ClassRoomCountDownSection;
