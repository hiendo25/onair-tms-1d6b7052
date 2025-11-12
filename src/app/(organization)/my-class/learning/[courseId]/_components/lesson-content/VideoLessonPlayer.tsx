import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import Replay10Icon from "@mui/icons-material/Replay10";
import Forward10Icon from "@mui/icons-material/Forward10";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import type {
  LearningLesson,
  ResourceRow,
} from "@/modules/learning-screen/types";
import type { StoredLessonProgress } from "@/modules/learning-screen/utils/progressStorage";
import { useResourceUrl } from "@/modules/learning-screen/hooks/useResourceUrl";

interface VideoLessonPlayerProps {
  resource: ResourceRow | null;
  lesson: LearningLesson;
  lessonProgress: StoredLessonProgress | null;
  onProgressChange: (payload: { position: number; duration?: number }) => void;
  onToggleCompletion: (completed: boolean) => void;
  onRequestNextLesson?: () => void;
  nextLessonTitle?: string | null;
}

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) {
    return "00:00";
  }
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  const pad = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  return `${pad(minutes)}:${pad(seconds)}`;
};

const VideoLessonPlayer = ({
  resource,
  lesson,
  lessonProgress,
  onProgressChange,
  onToggleCompletion,
  onRequestNextLesson,
  nextLessonTitle,
}: VideoLessonPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const lastPersistedTimeRef = useRef(0);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { url, isLoading, error } = useResourceUrl(resource);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const hasPromptedResumeRef = useRef(false);

  const [isAutoAdvanceVisible, setIsAutoAdvanceVisible] = useState(false);
  const [autoAdvanceSeconds, setAutoAdvanceSeconds] = useState(10);

  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    hasPromptedResumeRef.current = false;
    setShowResumePrompt(false);
    setIsAutoAdvanceVisible(false);
    lastPersistedTimeRef.current = 0;
  }, [lesson.id]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isAutoAdvanceVisible) {
      autoAdvanceTimerRef.current = setInterval(() => {
        setAutoAdvanceSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(autoAdvanceTimerRef.current as NodeJS.Timeout);
            autoAdvanceTimerRef.current = null;
            setIsAutoAdvanceVisible(false);
            onRequestNextLesson?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current);
          autoAdvanceTimerRef.current = null;
        }
      };
    }
    return undefined;
  }, [isAutoAdvanceVisible, onRequestNextLesson]);

  useEffect(() => {
    const savedPosition = lessonProgress?.video?.position ?? 0;
    if (
      savedPosition > 5 &&
      !lessonProgress?.completed &&
      !hasPromptedResumeRef.current
    ) {
      setShowResumePrompt(true);
      hasPromptedResumeRef.current = true;
    }
  }, [lesson.id, lessonProgress?.video?.position, lessonProgress?.completed]);

  const applyPendingSeek = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (pendingSeekRef.current !== null && Number.isFinite(video.duration)) {
      const target = Math.min(
        pendingSeekRef.current,
        Math.max(video.duration - 1, 0),
      );
      video.currentTime = target;
      setCurrentTime(target);
      pendingSeekRef.current = null;
    }
  }, []);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const metaDuration = video.duration;
    setDuration(metaDuration);
    applyPendingSeek();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setCurrentTime(video.currentTime);
    if (video.duration && video.duration !== duration) {
      setDuration(video.duration);
    }

    if (
      Math.abs(video.currentTime - lastPersistedTimeRef.current) >= 2 &&
      video.currentTime > 0
    ) {
      lastPersistedTimeRef.current = video.currentTime;
      onProgressChange({
        position: video.currentTime,
        duration: video.duration || duration || undefined,
      });
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      void video.play();
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleSeek = (_event: Event, value: number | number[]) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const nextValue = Array.isArray(value) ? value[0] : value;
    const targetTime = (nextValue / 100) * duration;
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    onProgressChange({
      position: targetTime,
      duration,
    });
  };

  const handleVolumeChange = (_event: Event, value: number | number[]) => {
    const volumeValue = Array.isArray(value) ? value[0] : value;
    const normalized = volumeValue / 100;
    const video = videoRef.current;
    if (video) {
      video.volume = normalized;
      video.muted = normalized === 0;
    }
    setVolume(normalized);
    setIsMuted(normalized === 0);
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted || volume === 0) {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(1);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (event: SelectChangeEvent<number>) => {
    const nextSpeed = Number(event.target.value);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = nextSpeed;
    }
    setSpeed(nextSpeed);
  };

  const handleSkip = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.min(
      Math.max(video.currentTime + offset, 0),
      duration || video.duration || 0,
    );
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const triggerAutoAdvance = () => {
    if (!onRequestNextLesson) {
      return;
    }
    setAutoAdvanceSeconds(10);
    setIsAutoAdvanceVisible(true);
  };

  const handleEnded = () => {
    if (!lessonProgress?.completed) {
      onToggleCompletion(true);
    }
    if (onRequestNextLesson) {
      triggerAutoAdvance();
    }
  };

  const handleResume = () => {
    const savedPosition = lessonProgress?.video?.position ?? 0;
    if (savedPosition > 0) {
      pendingSeekRef.current = savedPosition;
      applyPendingSeek();
    }
    setShowResumePrompt(false);
    setTimeout(() => {
      void videoRef.current?.play();
    }, 200);
  };

  const handleRestart = () => {
    pendingSeekRef.current = 0;
    applyPendingSeek();
    onProgressChange({ position: 0, duration });
    setShowResumePrompt(false);
  };

  const sliderValue = duration ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  }, [speed, url]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, url]);

  return (
    <Box className="w-full">
      <Box className="relative overflow-hidden rounded-2xl bg-black">
        {isLoading ? (
          <Box className="flex h-[320px] items-center justify-center text-white">
            <Typography variant="body2">Đang tải video...</Typography>
          </Box>
        ) : error ? (
          <Box className="flex h-[320px] items-center justify-center p-4 text-center text-white">
            <Typography variant="body2">
              Không thể tải video. Vui lòng kiểm tra lại tài nguyên.
            </Typography>
          </Box>
        ) : url ? (
          <video
            ref={videoRef}
            src={url}
            className="h-[320px] w-full bg-black"
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            controls={false}
            preload="metadata"
            playsInline
          />
        ) : (
          <Box className="flex h-[320px] items-center justify-center text-white">
            <Typography variant="body2">
              Chưa có video cho bài giảng này.
            </Typography>
          </Box>
        )}

        {isAutoAdvanceVisible && onRequestNextLesson ? (
          <Box className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/70 p-6 text-center text-white">
            <Typography variant="h6" fontWeight={600}>
              Đã hoàn thành bài giảng
            </Typography>
            {nextLessonTitle ? (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Tự động mở &ldquo;{nextLessonTitle}&rdquo; sau {autoAdvanceSeconds}s
              </Typography>
            ) : null}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsAutoAdvanceVisible(false);
                  onRequestNextLesson?.();
                }}
                startIcon={<SkipNextIcon />}
              >
                Bắt đầu ngay
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsAutoAdvanceVisible(false);
                  setAutoAdvanceSeconds(10);
                }}
              >
                Tạm dừng
              </Button>
            </Stack>
          </Box>
        ) : null}
      </Box>

      <Stack spacing={1.5} mt={2}>
        <Slider
          value={sliderValue}
          onChange={handleSeek}
          aria-label="Tiến trình video"
          size="small"
        />
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <IconButton onClick={handlePlayPause} color="primary">
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handleToggleMute}>
              {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
            <Slider
              value={(isMuted ? 0 : volume) * 100}
              onChange={handleVolumeChange}
              aria-label="Âm lượng"
              size="small"
              sx={{ width: 100 }}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Replay10Icon
              className="cursor-pointer text-[#374151]"
              onClick={() => handleSkip(-10)}
            />
            <Forward10Icon
              className="cursor-pointer text-[#374151]"
              onClick={() => handleSkip(10)}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Tốc độ
            </Typography>
            <Select
              size="small"
              value={speed}
              onChange={handleSpeedChange}
            >
              {[0.75, 1, 1.25, 1.5, 1.75, 2].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}x
                </MenuItem>
              ))}
            </Select>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" ml="auto">
            <Typography variant="body2" fontWeight={600}>
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              / {formatTime(duration)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Dialog open={showResumePrompt} onClose={handleRestart}>
        <DialogTitle>Tiếp tục bài học?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Lần trước bạn đã xem tới{" "}
            {formatTime(lessonProgress?.video?.position ?? 0)}. Bạn có muốn tiếp tục
            từ vị trí đó?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestart}>Xem từ đầu</Button>
          <Button onClick={handleResume} variant="contained">
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoLessonPlayer;
