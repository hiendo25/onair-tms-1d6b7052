"use client";

import { useCallback } from "react";
import { Box, Typography } from "@mui/material";

import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";
import type {
  LearningLesson,
  ResourceRow,
} from "@/modules/learning-screen/types";
import VideoPlayer from "@/shared/ui/video-player";

interface VideoLessonPlayerProps {
  resource: ResourceRow | null;
  lesson: LearningLesson;
  onRequestNextLesson?: () => void;
  nextLessonTitle?: string | null;
}

const VideoLessonPlayer = ({
  resource,
  lesson,
  onRequestNextLesson,
  nextLessonTitle,
}: VideoLessonPlayerProps) => {
  const { url, isLoading, error } = useResourceUrl(resource);

  const handleStartNextLesson = useCallback(() => {
    onRequestNextLesson?.();
  }, [onRequestNextLesson]);

  return (
    <Box className="w-full">
      <Box className="relative overflow-hidden rounded-2xl bg-black">
        {isLoading ? (
          <Box className="flex items-center justify-center text-white">
            <Typography variant="body2">Đang tải video...</Typography>
          </Box>
        ) : error ? (
          <Box className="flex items-center justify-center p-4 text-center text-white">
            <Typography variant="body2">
              Không thể tải video. Vui lòng kiểm tra lại tài nguyên.
            </Typography>
          </Box>
        ) : url ? (
          <VideoPlayer
            videoUrl={url}
            title={lesson.title ?? "Video bài giảng"}
            nextLessonTitle={nextLessonTitle ?? undefined}
            onStartNextLesson={handleStartNextLesson}
            autoAdvanceTime={10}
            instanceKey={lesson.id}
          />
        ) : (
          <Box className="flex items-center justify-center text-white">
            <Typography variant="body2">
              Chưa có video cho bài giảng này.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoLessonPlayer;
