import {
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";
import type { ResourceRow } from "@/modules/learning-screen/types";

interface ScormLessonViewerProps {
  resource: ResourceRow | null;
  onToggleCompletion: (completed: boolean) => void;
}

const ScormLessonViewer = ({ resource, onToggleCompletion }: ScormLessonViewerProps) => {
  const { url, isLoading, error } = useResourceUrl(resource);

  return (
    <Stack spacing={2}>
      {error ? (
        <Alert severity="error">{error}</Alert>
      ) : !url ? (
        <Alert severity="info">
          Chưa tìm thấy gói SCORM cho bài giảng này. Vui lòng kiểm tra lại tài nguyên.
        </Alert>
      ) : (
        <Box className="h-[420px] w-full overflow-hidden rounded-2xl border border-[#EFF0F3]">
          {isLoading ? (
            <Box className="flex h-full items-center justify-center">
              <Typography variant="body2" color="text.secondary">
                Đang tải nội dung SCORM...
              </Typography>
            </Box>
          ) : (
            <iframe
              src={url}
              className="h-full w-full border-0"
              title="SCORM content"
              allowFullScreen
            />
          )}
        </Box>
      )}

      {url ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => window.open(url, "_blank")}
          >
            Mở trong tab mới
          </Button>
          <Button variant="contained" onClick={() => onToggleCompletion(true)}>
            Đánh dấu hoàn thành
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ScormLessonViewer;
