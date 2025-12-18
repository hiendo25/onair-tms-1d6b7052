import React, { useEffect, useRef, useState } from "react";
import { Box, Button } from "@mui/material";

interface NextLessonOverlayProps {
  nextLessonTitle: string;
  onStartNext: () => void;
  onPause: () => void;
  autoAdvanceTime?: number;
}

const NextLessonOverlay = ({ nextLessonTitle, onStartNext, onPause, autoAdvanceTime = 10 }: NextLessonOverlayProps) => {
  const [countdown, setCountdown] = useState(autoAdvanceTime);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPaused) return;
    if (countdown === 0) {
      onStartNext();
      return;
    }
    timerRef.current = setTimeout(() => {
      setCountdown((c) => c - 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown, isPaused, onStartNext]);

  const handlePause = () => {
    setIsPaused(true);
    setIsVisible(false);
    onPause();
  };

  const handleStart = () => {
    setCountdown(0);
    onStartNext();
  };

  const handleDismiss = () => {
    setIsPaused(true);
    setIsVisible(false);
    onPause();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "rgba(0,0,0,0.72)",
        flexDirection: "column",
      }}
      tabIndex={-1}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          width: { xs: "90%", md: 600 },
          maxWidth: "100%",
          background: "none",
          position: "relative",
        }}
        tabIndex={0}
      >
        {/* Close button */}
        <Button
          onClick={handleDismiss}
          sx={{
            position: "absolute",
            top: -40,
            right: 0,
            minWidth: "auto",
            width: 32,
            height: 32,
            p: 0,
            color: "rgba(255,255,255,0.72)",
            fontSize: 24,
            lineHeight: 1,
            "&:hover": {
              color: "#FFF",
              background: "rgba(255,255,255,0.12)",
            },
          }}
          title="Đóng và tiếp tục xem video hiện tại"
        >
          ×
        </Button>
        <Box
          sx={{
            color: "rgba(255,255,255,0.64)",
            fontFamily: "Inter",
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "26px",
            mb: 0.5,
            letterSpacing: 0,
            userSelect: "none",
          }}
        >
          Video tiếp theo
        </Box>
        <Box
          sx={{
            color: "#FFF",
            fontFamily: "Inter",
            fontSize: 24,
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "34px",
            mb: 2,
            textAlign: "left",
            wordBreak: "break-word",
            userSelect: "none",
          }}
        >
          {nextLessonTitle}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            fontFamily: "Inter",
            fontSize: 14,
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "26px",
            color: "#FFF",
            userSelect: "none",
          }}
        >
          Bắt đầu sau{" "}
          <Box
            component="span"
            sx={{
              color: "#FFAB00",
              fontFamily: "Inter",
              fontSize: 14,
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "26px",
              ml: 0.5,
              userSelect: "none",
            }}
          >
            {countdown} giây
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleStart}
            sx={{
              display: "flex",
              height: "44px",
              minWidth: "120px",
              px: "20px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
              background: "#FFF",
              color: "#212B36",
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              textTransform: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "#F4F6F8",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              },
            }}
          >
            Bắt đầu
          </Button>
          <Button
            onClick={handlePause}
            sx={{
              display: "flex",
              height: "44px",
              minWidth: "120px",
              px: "20px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              borderRadius: "8px",
              border: "2px solid #FFF",
              color: "#FFF",
              fontFamily: "Inter",
              fontSize: 16,
              fontWeight: 600,
              background: "transparent",
              boxShadow: "none",
              textTransform: "none",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                background: "rgba(255,255,255,0.15)",
                borderColor: "#FFF",
                boxShadow: "0 2px 8px rgba(255,255,255,0.2)",
                transform: "translateY(-1px)",
              },
              "&:active": {
                transform: "translateY(0)",
                background: "rgba(255,255,255,0.08)",
              },
            }}
          >
            Tạm dừng
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NextLessonOverlay;
