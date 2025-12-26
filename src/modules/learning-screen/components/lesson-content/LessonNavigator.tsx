import { JSX, useEffect, useState } from "react";
import ArticleIcon from "@mui/icons-material/Article";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import clsx from "clsx";

import {
  LESSON_PROGRESS_STATUS,
  SECTION_PROGRESS_MAX_PERCENT,
  SECTION_PROGRESS_MIN_PERCENT,
} from "@/modules/learning-screen/constants";
import type { LearningSectionOutline } from "@/modules/learning-screen/types";
import {
  inferLessonContentKind,
  LessonContentKind,
} from "@/modules/learning-screen/utils/resource";
import { Image } from "@/shared/ui/Image";
import { formatFileSize } from "@/utils";

interface LessonNavigatorProps {
  sections: LearningSectionOutline[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  showSectionProgress?: boolean;
  sectionProgressById?: Record<string, number>;
}

const LESSON_TYPE_META: Record<
  LessonContentKind,
  { label: string; icon: JSX.Element; chipColor: "default" | "primary" | "secondary" | "info" | "success" | "warning" | "error" }
> = {
  video: {
    label: "Video",
    icon: <PlayCircleOutlineIcon className="text-[#2150F5]" />,
    chipColor: "primary",
  },
  pdf: {
    label: "PDF",
    icon: <PictureAsPdfIcon className="text-[#E43F5A]" />,
    chipColor: "secondary",
  },
  document: {
    label: "Tài liệu",
    icon: <DescriptionIcon className="text-[#1E6F5C]" />,
    chipColor: "info",
  },
  text: {
    label: "Văn bản",
    icon: <ArticleIcon className="text-[#1E6F5C]" />,
    chipColor: "info",
  },
  scorm: {
    label: "SCORM",
    icon: <IntegrationInstructionsIcon className="text-[#A66CFF]" />,
    chipColor: "warning",
  },
  assessment: {
    label: "Bài kiểm tra",
    icon: <QuizIcon className="text-[#FF8A00]" />,
    chipColor: "error",
  },
  unknown: {
    label: "Khác",
    icon: <DescriptionIcon className="text-[#6B7280]" />,
    chipColor: "default",
  },
};

const LessonNavigator = ({
  sections,
  selectedLessonId,
  onSelectLesson,
  showSectionProgress = false,
  sectionProgressById = {},
}: LessonNavigatorProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (sections[0]) {
      initial.add(sections[0].id);
    }
    return initial;
  });

  useEffect(() => {
    if (sections.length === 0) {
      setExpandedSections(new Set());
      return;
    }
    setExpandedSections((prev) => {
      if (prev.size === 0) {
        const next = new Set<string>();
        next.add(sections?.[0]?.id as string);
        return next;
      }
      return prev;
    });
  }, [sections]);

  useEffect(() => {
    if (!selectedLessonId) {
      return;
    }
    const targetSection = sections.find((section) =>
      section.lessons.some((lesson) => lesson.id === selectedLessonId),
    );
    if (!targetSection) {
      return;
    }
    setExpandedSections((prev) => {
      if (prev.has(targetSection.id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(targetSection.id);
      return next;
    });
  }, [selectedLessonId, sections]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  if (!sections.length) {
    return (
      <Alert severity="info">
        Chưa có bài giảng nào trong khoá học này.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {sections.map((section, index) => {
        const isExpanded = expandedSections.has(section.id);
        const lessonCountText = `${section.lessons.length} bài`;
        const sectionSummaryText = section.lessons.length
          ? "Chọn bài để học"
          : "Chưa có bài giảng";
        const sectionProgressValue =
          sectionProgressById[section.id] ?? SECTION_PROGRESS_MIN_PERCENT;
        const clampedProgressValue = Math.min(
          SECTION_PROGRESS_MAX_PERCENT,
          Math.max(SECTION_PROGRESS_MIN_PERCENT, sectionProgressValue),
        );
        const sectionProgressPercent = Math.round(clampedProgressValue);

        return (
          <Box
            key={section.id}
            className={clsx(
              "rounded-[28px] border bg-white shadow-sm transition",
              expandedSections.has(section.id)
                ? "border-[#B3C7FF] shadow-lg"
                : "border-transparent hover:border-[#E1E4EF]",
            )}
          >
            <Box
              className="flex cursor-pointer select-none flex-col gap-2 px-5 py-4"
              onClick={() => toggleSection(section.id)}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                className="text-sm text-[#64748B]"
              >
                <Chip
                  label={`Học phần ${index + 1}`}
                  size="small"
                  color="primary"
                  className="bg-[#000000]"
                />
                <Typography variant="caption" color="text.secondary">
                  {lessonCountText}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {section.title || `Học phần ${index + 1}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sectionSummaryText}
                  </Typography>
                </Box>
                <IconButton size="small">
                  <ExpandMoreIcon
                    className={clsx(
                      "transition-transform",
                      isExpanded ? "rotate-180" : "rotate-0",
                    )}
                  />
                </IconButton>
              </Stack>
              {showSectionProgress ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LinearProgress
                    variant="determinate"
                    value={clampedProgressValue}
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {sectionProgressPercent}%
                  </Typography>
                </Stack>
              ) : null}
            </Box>

            <Collapse in={isExpanded}>
              <Stack spacing={1.5} className="px-4 pb-4">
                {section.lessons.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có bài giảng trong học phần này.
                  </Typography>
                ) : (
                  section.lessons.map((lesson, lessonIndex) => {
                    const isActive = lesson.id === selectedLessonId;
                    const isCompleted =
                      lesson.progressStatus === LESSON_PROGRESS_STATUS.COMPLETED;
                    const contentKind = inferLessonContentKind(lesson);
                    const typeMeta = LESSON_TYPE_META[contentKind] ?? LESSON_TYPE_META.unknown;
                    const thumbnail = lesson.mainResource?.thumbnail_url ?? null;
                    const fileSizeLabel = formatFileSize(lesson.mainResource?.size ?? null);

                    return (
                      <Box
                        key={lesson.id}
                        component="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-3xl border px-3 py-3 text-left transition focus:outline-none",
                          isActive
                            ? "border-[#2150F5] bg-[#EEF3FF] shadow-sm"
                            : "border-transparent hover:border-[#E0E4EC] hover:bg-[#F9FAFB]",
                        )}
                      >
                        <Box className="relative h-16 w-24 overflow-hidden rounded-2xl bg-[#EFF2F6]">
                          {thumbnail ? (
                            <Image
                              src={thumbnail}
                              alt={lesson.title ?? "thumbnail"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <Box className="flex h-full w-full items-center justify-center">
                              {typeMeta.icon}
                            </Box>
                          )}
                          {isActive ? (
                            <Box className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#2150F5] shadow-sm">
                              Đang học
                            </Box>
                          ) : null}
                        </Box>
                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            className={clsx(
                              "text-[#0F172A]",
                              isActive ? "text-[#2150F5]" : "text-[#0F172A]",
                            )}
                          >
                            {`Bài ${lessonIndex + 1}: ${lesson.title ?? "Chưa đặt tên"}`}
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              {typeMeta.label}
                            </Typography>
                            {fileSizeLabel && (
                              <>
                                <Typography variant="caption" color="text.disabled">
                                  •
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {fileSizeLabel}
                                </Typography>
                              </>
                            )}
                          </Stack>
                        </Box>
                        {isCompleted ? (
                          <Box className="text-[#22C55E]">
                            <CheckCircleIcon fontSize="small" />
                          </Box>
                        ) : null}
                      </Box>
                    );
                  })
                )}
              </Stack>
            </Collapse>
          </Box>
        );
      })}
    </Stack>
  );
};

export default LessonNavigator;
