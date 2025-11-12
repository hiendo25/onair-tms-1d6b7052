import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import QuizIcon from "@mui/icons-material/Quiz";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArticleIcon from "@mui/icons-material/Article";
import clsx from "clsx";
import Image from "next/image";
import type { LearningSection } from "@/modules/learning-screen/types";
import type { StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import {
  LessonContentKind,
  inferLessonContentKind,
} from "@/modules/learning-screen/utils/resource";

interface LessonNavigatorProps {
  sections: LearningSection[];
  selectedLessonId: string | null;
  progressMap: Record<string, StoredLessonProgress>;
  onSelectLesson: (lessonId: string) => void;
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
  progressMap,
  onSelectLesson,
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
        next.add(sections[0].id);
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

  const sectionSummaries = useMemo(() => {
    return sections.map((section) => {
      const total = section.lessons.length;
      const completed = section.lessons.filter(
        (lesson) => progressMap[lesson.id]?.completed,
      ).length;
      return {
        sectionId: section.id,
        total,
        completed,
      };
    });
  }, [sections, progressMap]);

  const getSectionSummary = (sectionId: string) =>
    sectionSummaries.find((item) => item.sectionId === sectionId);

  const getLessonStatus = (
    lessonId: string,
  ): { label: string; color: "success" | "primary" | "warning" } | null => {
    const state = progressMap[lessonId];
    if (state?.completed) {
      return { label: "Đã hoàn thành", color: "success" };
    }
    if (lessonId === selectedLessonId) {
      return { label: "Đang học", color: "primary" };
    }
    if (state?.video || state?.document) {
      return { label: "Đang dở", color: "warning" };
    }
    return null;
  };

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
        const summary = getSectionSummary(section.id);
        const completedText =
          summary && summary.total > 0
            ? `${summary.completed}/${summary.total} bài đã hoàn thành`
            : "Chưa có bài giảng";

        return (
          <Box
            key={section.id}
            className="rounded-2xl border border-[#EFF0F3] bg-white shadow-sm"
          >
            <Box
              className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
              onClick={() => toggleSection(section.id)}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {section.title || `Học phần ${index + 1}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completedText}
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
                    const contentKind = inferLessonContentKind(lesson);
                    const typeMeta = LESSON_TYPE_META[contentKind] ?? LESSON_TYPE_META.unknown;
                    const status = getLessonStatus(lesson.id);
                    const thumbnail = lesson.mainResource?.thumbnail_url ?? null;

                    return (
                      <Box
                        key={lesson.id}
                        component="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        className={clsx(
                          "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                          isActive
                            ? "border-[#2150F5] bg-[#F2F6FF]"
                            : "border-transparent hover:border-[#E0E4EC] hover:bg-[#F9FAFB]",
                        )}
                      >
                        <Box
                          className={clsx(
                            "flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl",
                            thumbnail ? "bg-transparent" : "bg-[#EFF2F6]",
                          )}
                        >
                          {thumbnail ? (
                            <Box className="relative h-14 w-14">
                              <Image
                                src={thumbnail}
                                alt={lesson.title ?? "thumbnail"}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </Box>
                          ) : (
                            typeMeta.icon
                          )}
                        </Box>
                        <Box flex={1}>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            flexWrap="wrap"
                          >
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              className="text-[#111827]"
                            >
                              {`Bài ${lessonIndex + 1}: ${
                                lesson.title ?? "Chưa đặt tên"
                              }`}
                            </Typography>
                            <Chip
                              size="small"
                              variant="outlined"
                              color={typeMeta.chipColor}
                              label={typeMeta.label}
                            />
                          </Stack>
                          {lesson.content ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              className="line-clamp-1"
                            >
                              {lesson.content.replace(/<[^>]*>?/gm, "").slice(0, 90) ||
                                "Nội dung đang cập nhật"}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Nội dung đang cập nhật
                            </Typography>
                          )}

                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mt={0.5}
                          >
                            {status ? (
                              <Chip
                                size="small"
                                color={status.color}
                                variant={status.color === "warning" ? "outlined" : "filled"}
                                label={status.label}
                              />
                            ) : null}
                            {progressMap[lesson.id]?.completed ? (
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <CheckCircleIcon className="h-4 w-4 text-[#16A34A]" />
                                <Typography variant="caption" color="text.secondary">
                                  Đã hoàn thành
                                </Typography>
                              </Stack>
                            ) : null}
                          </Stack>
                        </Box>
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
