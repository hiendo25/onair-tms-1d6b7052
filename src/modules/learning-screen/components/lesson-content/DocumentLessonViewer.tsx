'use client';

import { useEffect, useMemo, useState } from "react";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
  Alert,
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";
import type {
  LearningLesson,
  LearningLessonSummary,
  ResourceRow,
} from "@/modules/learning-screen/types";
import MarkLessonCompleteButton from "../MarkLessonCompleteButton";


const splitTextIntoPages = (content: string | null): string[] => {
  if (!content) {
    return [];
  }

  const delimiter = /<!--\s*pagebreak\s*-->/gi;
  if (delimiter.test(content)) {
    return content.split(delimiter).map((segment) => segment.trim()).filter(Boolean);
  }

  const paragraphs = content.split(/<\/p>/i).map((item) => item.trim()).filter(Boolean);
  if (paragraphs.length <= 3) {
    return [content];
  }

  const chunkSize = Math.ceil(paragraphs.length / 3);
  const pages: string[] = [];
  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const chunk = paragraphs.slice(i, i + chunkSize);
    pages.push(chunk.join("</p>") + "</p>");
  }
  return pages;
};

interface DocumentLessonViewerProps {
  lesson: LearningLesson;
  resource: ResourceRow | null;
  contentKind: "pdf" | "document" | "text";
  learningPathId?: string | null;
  courseId?: string | null;
  studentId?: string | null;
  selectedLessonSummary?: LearningLessonSummary | null;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;
const BASE_PDF_HEIGHT = 640;

const DocumentLessonViewer = ({
  lesson,
  resource,
  contentKind,
  learningPathId,
  courseId,
  studentId,
  selectedLessonSummary,
}: DocumentLessonViewerProps) => {
  const { url, error } = useResourceUrl(resource);
  const isPdf = contentKind === "pdf";

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1);

  const zoomPercent = useMemo(() => Math.round(zoom * 100), [zoom]);

  const pdfViewerUrl = useMemo(() => {
    if (!url) {
      return null;
    }
    const hashIndex = url.indexOf("#");
    if (hashIndex >= 0) {
      const base = url.substring(0, hashIndex);
      const hash = url.substring(hashIndex + 1);
      const hashPrefix = hash ? `${hash}&` : "";
      return `${base}#${hashPrefix}toolbar=0&navpanes=0&zoom=${zoomPercent}`;
    }
    return `${url}#toolbar=0&navpanes=0&zoom=${zoomPercent}`;
  }, [url, zoomPercent]);

  const textPages = useMemo(() => {
    if (isPdf) {
      return [];
    }
    return splitTextIntoPages(lesson.content);
  }, [lesson.content, isPdf]);

  useEffect(() => {
    if (isPdf) {
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }
    const maxPages = Math.max(textPages.length, 1);
    setTotalPages(maxPages);
    setCurrentPage(1);
  }, [isPdf, textPages]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const showPageControls = !isPdf;

  return (
    <Stack spacing={2}>
      {isPdf ? (
        <>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : !url ? (
            <Alert severity="info">Chưa có tệp PDF cho bài giảng này.</Alert>
          ) : (
            <Box className="rounded-2xl border border-[#EFF0F3] bg-white shadow-sm overflow-hidden">
              {/* <Box
                sx={{
                  borderBottom: "1px solid #EFF0F3",
                  px: 3,
                  py: 2,
                  bgcolor: "#F8FAFF",
                }}
              >
                <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                  {lesson.title || "Tài liệu PDF"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bạn có thể phóng to hoặc thu nhỏ tài liệu bằng các nút điều khiển bên dưới.
                </Typography>
              </Box> */}

              <Box
                sx={{
                  bgcolor: "#F4F6FB",
                  p: { xs: 2, md: 3 },
                  overflow: "auto",
                  borderTop: "1px solid #EFF0F3",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    mx: "auto",
                  }}
                >
                  <iframe
                    key={zoomPercent}
                    src={pdfViewerUrl ?? url}
                    title={lesson.title ?? "PDF Viewer"}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: BASE_PDF_HEIGHT,
                      border: "none",
                      borderRadius: 16,
                      boxShadow: "0 12px 48px rgba(15, 23, 42, 0.12)",
                      backgroundColor: "#fff",
                    }}
                    allow="fullscreen"
                  />
                </Box>
              </Box>
              {/* <Typography variant="caption" color="text.secondary" px={3} py={2} display="block">
                Trình xem PDF sử dụng iframe và hoạt động tốt nhất trên trình duyệt Chrome hoặc Edge.
              </Typography> */}
            </Box>
          )}
        </>
      ) : (
        <Box
          className="rounded-2xl border border-[#EFF0F3] bg-white p-4"
          sx={{ fontSize: `${zoom}rem` }}
          dangerouslySetInnerHTML={{
            __html: textPages[currentPage - 1] ?? lesson.content ?? "",
          }}
        />
      )}

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        className="rounded-2xl border border-[#EFF0F3] bg-white px-4 py-3"
      >
        {showPageControls ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePrevPage} disabled={currentPage <= 1}>
              <NavigateBeforeIcon />
            </IconButton>
            <Typography variant="body2" fontWeight={600}>
              Trang {totalPages ? `${currentPage}/${totalPages}` : currentPage}
            </Typography>
            <IconButton onClick={handleNextPage} disabled={currentPage >= totalPages}>
              <NavigateNextIcon />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Tuỳ chỉnh vùng xem PDF bằng các nút phóng to / thu nhỏ.
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" fontWeight={600}>
            {Math.round(zoom * 100)}%
          </Typography>
          <IconButton onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>
            <ZoomInIcon />
          </IconButton>
        </Stack>

      </Stack>

      <MarkLessonCompleteButton
        lessonId={lesson.id}
        learningPathId={learningPathId}
        courseId={courseId}
        studentId={studentId}
        selectedLessonSummary={selectedLessonSummary}
      />
    </Stack>
  );
};

export default DocumentLessonViewer;
