import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type {
  LearningLesson,
  ResourceRow,
} from "@/modules/learning-screen/types";
import type { StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";

declare global {
  var pdfjsLib: any;
}

const PDF_JS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.js";
const PDF_JS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

let pdfjsLoader: Promise<any> | null = null;

const loadPdfJs = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("PDF.js chỉ chạy được trên trình duyệt"));
  }

  if (window.pdfjsLib) {
    return Promise.resolve(window.pdfjsLib);
  }

  if (!pdfjsLoader) {
    pdfjsLoader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PDF_JS_CDN;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;
          resolve(window.pdfjsLib);
        } else {
          reject(new Error("Không thể khởi tạo PDF.js"));
        }
      };
      script.onerror = () => reject(new Error("Không thể tải thư viện PDF.js"));
      document.body.appendChild(script);
    });
  }

  return pdfjsLoader;
};

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
  lessonProgress: StoredLessonProgress | null;
  onProgressChange: (payload: { page: number; totalPages?: number; zoom?: number }) => void;
  onToggleCompletion: (completed: boolean) => void;
}

const DocumentLessonViewer = ({
  lesson,
  resource,
  contentKind,
  lessonProgress,
  onProgressChange,
  onToggleCompletion,
}: DocumentLessonViewerProps) => {
  const { url, error } = useResourceUrl(resource);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  const [currentPage, setCurrentPage] = useState(lessonProgress?.document?.page ?? 1);
  const [totalPages, setTotalPages] = useState(lessonProgress?.document?.totalPages ?? 1);
  const [zoom, setZoom] = useState(lessonProgress?.document?.zoom ?? 1);
  const [isRendering, setIsRendering] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const textPages = useMemo(() => {
    if (contentKind === "pdf") {
      return [];
    }
    return splitTextIntoPages(lesson.content);
  }, [lesson.content, contentKind]);

  useEffect(() => {
    if (contentKind !== "pdf") {
      setTotalPages(Math.max(textPages.length, 1));
      setCurrentPage(
        Math.min(lessonProgress?.document?.page ?? 1, Math.max(textPages.length, 1)),
      );
    }
  }, [textPages, contentKind, lessonProgress?.document?.page]);

  useEffect(() => {
    if (contentKind !== "pdf" || !url) {
      return;
    }
    let isCancelled = false;
    setPdfError(null);
    setIsRendering(true);

    loadPdfJs()
      .then((pdfjs) => {
        if (isCancelled) return null;
        return pdfjs.getDocument(url).promise;
      })
      .then((doc) => {
        if (!doc || isCancelled) {
          return;
        }
        pdfDocRef.current = doc;
        setTotalPages(doc.numPages);
        const savedPage = lessonProgress?.document?.page ?? 1;
        setCurrentPage(Math.min(savedPage, doc.numPages));
      })
      .catch((err) => {
        if (isCancelled) return;
        setPdfError(err instanceof Error ? err.message : "Không thể tải tài liệu PDF");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsRendering(false);
        }
      });

    return () => {
      isCancelled = true;
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.();
        pdfDocRef.current = null;
      }
    };
  }, [url, contentKind, lessonProgress?.document?.page]);

  useEffect(() => {
    if (contentKind !== "pdf" || !pdfDocRef.current) {
      return;
    }
    let isCancelled = false;
    const render = async () => {
      setIsRendering(true);
      const page = await pdfDocRef.current.getPage(currentPage);
      if (isCancelled) return;

      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas) {
        setIsRendering(false);
        return;
      }
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context!,
        viewport,
      }).promise;
      if (!isCancelled) {
        setIsRendering(false);
      }
    };

    render().catch(() => setIsRendering(false));

    return () => {
      isCancelled = true;
    };
  }, [currentPage, zoom, contentKind]);

  useEffect(() => {
    onProgressChange({
      page: currentPage,
      totalPages,
      zoom,
    });
  }, [currentPage, totalPages, zoom, onProgressChange]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const isOnLastPage = totalPages > 1 ? currentPage === totalPages : true;

  return (
    <Stack spacing={2}>
      {contentKind === "pdf" ? (
        <>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : pdfError ? (
            <Alert severity="error">{pdfError}</Alert>
          ) : !url ? (
            <Alert severity="info">Chưa có tệp PDF cho bài giảng này.</Alert>
          ) : (
            <Box className="rounded-2xl border border-[#EFF0F3] bg-[#0F172A]/5 p-4">
              <canvas ref={canvasRef} className="mx-auto block max-h-[520px] w-full" />
              {isRendering ? (
                <Stack alignItems="center" spacing={1} mt={2}>
                  <CircularProgress size={24} />
                  <Typography variant="caption" color="text.secondary">
                    Đang render trang...
                  </Typography>
                </Stack>
              ) : null}
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

        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2">{Math.round(zoom * 100)}%</Typography>
          <IconButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Stack>

        <Button
          variant={isOnLastPage ? "contained" : "outlined"}
          color={isOnLastPage ? "primary" : "inherit"}
          disabled={!isOnLastPage}
          onClick={() => onToggleCompletion(true)}
        >
          {isOnLastPage ? "Hoàn thành bài học" : "Đọc hết để hoàn thành"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default DocumentLessonViewer;
