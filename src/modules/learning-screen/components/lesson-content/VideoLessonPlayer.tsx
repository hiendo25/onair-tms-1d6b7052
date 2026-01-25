"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useMarkLessonComplete } from "@/modules/learning-screen/hooks/useMarkLessonComplete";
import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";
import type {
  LearningLesson,
  ResourceRow,
} from "@/modules/learning-screen/types";
import {
  clearVideoPosition,
  getVideoPosition,
  saveVideoPosition,
} from "@/modules/learning-screen/utils/video-position-storage";
import VideoPlayer from "@/shared/ui/video-player";

interface VideoLessonPlayerProps {
  resource: ResourceRow | null;
  lesson: LearningLesson;
  onRequestNextLesson?: () => void;
  nextLessonTitle?: string | null;
  learningPathId?: string | null;
  classRoomId?: string | null;
  courseId?: string | null;
  studentId?: string | null;
}

const VideoLessonPlayer = ({
  resource,
  lesson,
  onRequestNextLesson,
  nextLessonTitle,
  learningPathId,
  classRoomId,
  courseId,
  studentId,
}: VideoLessonPlayerProps) => {
  const { url, isLoading, error } = useResourceUrl(resource);
  const { markComplete } = useMarkLessonComplete({
    courseId: courseId ?? null,
    learningPathId,
    classRoomId,
    employeeId: studentId ?? null,
  });

  console.log("[VideoLessonPlayer] Setup with:", {
    courseId,
    learningPathId,
    studentId,
    lessonId: lesson.id,
  });

  // State to manage initial video position
  const [initialTime, setInitialTime] = useState<number>(0);
  const lastSavedTimeRef = useRef<number>(0);

  // Load saved video position when lesson changes
  useEffect(() => {
    if (lesson.id) {
      const savedPosition = getVideoPosition(lesson.id);
      if (savedPosition && savedPosition.currentTime > 0) {
        // Only resume if saved position is meaningful (at least 5 seconds in)
        // and not too close to the end (at least 10 seconds before end)
        const isValidPosition =
          savedPosition.currentTime >= 5 &&
          savedPosition.duration - savedPosition.currentTime >= 10;

        if (isValidPosition) {
          setInitialTime(savedPosition.currentTime);
          lastSavedTimeRef.current = savedPosition.currentTime;
        } else {
          // Clear invalid position
          clearVideoPosition(lesson.id);
          setInitialTime(0);
          lastSavedTimeRef.current = 0;
        }
      } else {
        setInitialTime(0);
        lastSavedTimeRef.current = 0;
      }
    } else {
      setInitialTime(0);
      lastSavedTimeRef.current = 0;
    }
  }, [lesson.id]);

  // Handle video time updates - save position periodically
  const handleTimeUpdate = useCallback(
    (currentTime: number, isPlaying: boolean, duration: number) => {
      if (!lesson.id) return;

      // Save position every 5 seconds to avoid too many localStorage writes
      const timeSinceLastSave = Math.abs(currentTime - lastSavedTimeRef.current);
      if (timeSinceLastSave >= 5) {
        saveVideoPosition(lesson.id, currentTime, duration);
        lastSavedTimeRef.current = currentTime;
      }
    },
    [lesson.id],
  );

  const handleVideoEnded = useCallback(() => {
    console.log("[VideoLessonPlayer] Video ended for lesson:", lesson.id);
    if (lesson.id) {
      // Clear saved position when video completes
      clearVideoPosition(lesson.id);
      console.log("[VideoLessonPlayer] Calling markComplete for lesson:", lesson.id);
      markComplete(lesson.id);
    }
  }, [lesson.id, markComplete]);

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
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            initialTime={initialTime}
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
