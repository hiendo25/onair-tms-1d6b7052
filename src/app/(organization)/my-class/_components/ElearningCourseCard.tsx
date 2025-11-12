"use client";
import { Image } from "@/shared/ui/Image";
import { Box, Button, Divider, Stack, Tooltip, Typography } from "@mui/material";
import { ElearningAssignedCourseDto } from "@/types/dto/elearning/elearning.dto";
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

interface IElearningCourseCard {
    assignment: ElearningAssignedCourseDto
}

const ElearningCourseCard = ({ assignment }: IElearningCourseCard) => {
    const teacherNames =
        assignment.course?.teacherAssignments
            ?.map((teacherAssignment) =>
                teacherAssignment.teacher?.profile?.full_name?.trim() ?? null
            )
            .filter((name): name is string => Boolean(name)) ?? [];

    const primaryTeacherName = teacherNames[0] ?? "Đang cập nhật";
    const additionalTeacherNames = teacherNames.slice(1);
    const extraTeacherCount = additionalTeacherNames.length;
    const shouldShowTeacherTooltip = extraTeacherCount > 0;

    return (
        <>
            <Box className="rounded-lg border border-[#919EAB33] p-2 shadow">
                <Image
                    src={assignment.course?.thumbnail_url}
                    alt={assignment.course?.title}
                    ratio="16/9"
                    loading="lazy"
                    disabledEffect
                    className="rounded-lg"
                />
                <Box px={1}>
                    <div className="flex justify-end">
                        <div className="font-normal text-xs text-[#F63D68] bg-[#F63D6829] rounded-2xl px-1.5">
                            Môn học eLearning
                        </div>
                    </div>

                    <Box mt={2}>
                        <Typography className="font-semibold text-[14px] text-[#212B36] line-clamp-2 h-[42px]">
                            {assignment.course?.title ?? "Không có tiêu đề"}
                        </Typography>
                    </Box>

                    <Divider className="my-4" />

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ImportContactsIcon />
                        <p className="font-normal text-xs">
                            12 học phần - 80 bài giảng
                        </p>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                        <PeopleAltOutlinedIcon />
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <p className="font-normal text-xs">
                                <span className="font-semibold text-xs">GV</span> {primaryTeacherName}
                            </p>
                            {shouldShowTeacherTooltip && (
                                <Tooltip
                                    arrow
                                    placement="top"
                                    title={
                                        <Stack spacing={0.25}>
                                            {additionalTeacherNames.map((name, index) => (
                                                <Typography
                                                    key={`${name}-${index}`}
                                                    variant="caption"
                                                    component="p"
                                                >
                                                    {name}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    }
                                >
                                    <Box className="cursor-default rounded-full border border-[#B5D4FF] bg-[#E7F1FF] px-2 py-0.5 text-[12px] font-semibold leading-none text-[#1056B4]">
                                        +{extraTeacherCount}
                                    </Box>
                                </Tooltip>
                            )}
                        </Stack>
                    </Stack>

                    <Box mt={2} mb={1}>
                        <Button
                            size="large"
                            variant="contained"
                            color="primary"
                            className="w-full"
                            // disabled={"actionDisabled"}
                            onClick={() => { }}
                        >
                            Vào lớp học
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default ElearningCourseCard;
