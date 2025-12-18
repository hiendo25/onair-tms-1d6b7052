"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";
import type {
  LearningLesson,
  ResourceRow,
} from "@/modules/learning-screen/types";
import type { StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import VideoPlayer from "@/shared/ui/video-player";

interface VideoLessonPlayerProps {
  resource: ResourceRow | null;
  lesson: LearningLesson;
  lessonProgress: StoredLessonProgress | null;
  onProgressChange: (payload: { position: number; duration?: number }) => void;
  onToggleCompletion: (completed: boolean) => void;
  onRequestNextLesson?: () => void;
  nextLessonTitle?: string | null;
}

const VideoLessonPlayer = ({
  resource,
  lesson,
  lessonProgress,
  onProgressChange,
  onToggleCompletion,
  onRequestNextLesson,
  nextLessonTitle,
}: VideoLessonPlayerProps) => {
  const { url, isLoading, error } = useResourceUrl(resource);

  const lastPersistedTimeRef = useRef(0);
  const durationRef = useRef(0);
  const completionRef = useRef(false);
  const hasReportedEndRef = useRef(false);
  const initializedLessonRef = useRef<string | null>(null);
  const hasStartedPlaybackRef = useRef(false);

  const [duration, setDuration] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [shouldAutoplay, setShouldAutoplay] = useState(false);
  const [playerResetKey, setPlayerResetKey] = useState(0);

  useEffect(() => {
    const savedPosition = lessonProgress?.video?.position ?? 0;
    const shouldInitialize =
      initializedLessonRef.current !== lesson.id ||
      !hasStartedPlaybackRef.current;

    if (!shouldInitialize) {
      return;
    }

    initializedLessonRef.current = lesson.id;
    hasStartedPlaybackRef.current = false;

    setInitialTime(savedPosition);
    setShouldAutoplay(true);
    lastPersistedTimeRef.current = savedPosition;

    const initialDuration = lessonProgress?.video?.duration ?? 0;
    setDuration(initialDuration);
    durationRef.current = initialDuration;
    completionRef.current = Boolean(lessonProgress?.completed);
    hasReportedEndRef.current = false;
    setPlayerResetKey((prev) => prev + 1);
  }, [lesson.id, lessonProgress?.completed, lessonProgress?.video?.position, lessonProgress?.video?.duration]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, _isPlaying: boolean, mediaDuration: number) => {
      hasStartedPlaybackRef.current = true;
      const safeDuration = Number.isFinite(mediaDuration)
        ? mediaDuration
        : durationRef.current;
      durationRef.current = safeDuration;
      if (safeDuration && safeDuration !== duration) {
        setDuration(safeDuration);
      }
      if (
        currentTime > 0 &&
        Math.abs(currentTime - lastPersistedTimeRef.current) >= 2
      ) {
        lastPersistedTimeRef.current = currentTime;
        onProgressChange({
          position: currentTime,
          duration: safeDuration || duration || undefined,
        });
      }
    },
    [duration, onProgressChange],
  );

  const handleVideoComplete = useCallback(() => {
    if (!completionRef.current) {
      onToggleCompletion(true);
      completionRef.current = true;
    }
    if (hasReportedEndRef.current) {
      return;
    }
    hasReportedEndRef.current = true;
    const finalDuration = durationRef.current || duration;
    onProgressChange({
      position: finalDuration,
      duration: finalDuration || duration || undefined,
    });
  }, [duration, onProgressChange, onToggleCompletion]);

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
            initialTime={initialTime}
            initialPlaying={shouldAutoplay}
            onTimeUpdate={handleTimeUpdate}
            nextLessonTitle={nextLessonTitle ?? undefined}
            onStartNextLesson={handleStartNextLesson}
            autoAdvanceTime={10}
            onVideoEnd={handleVideoComplete}
            onEnded={handleVideoComplete}
            instanceKey={`${lesson.id}-${playerResetKey}`}
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
