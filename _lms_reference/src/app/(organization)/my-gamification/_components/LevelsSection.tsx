import { Box, Typography } from "@mui/material";
import Image from "next/image";

import type { LevelInfo } from "@/types/gamification.types";

interface LevelsSectionProps {
  currentLevel: LevelInfo | null;
  nextLevel: LevelInfo | null;
  allLevels?: LevelInfo[];
  currentXp: number;
}

export default function LevelsSection({ currentLevel, allLevels, currentXp }: LevelsSectionProps) {
  // If allLevels is provided, use it; otherwise show current only
  const levelsToDisplay = allLevels || (currentLevel ? [currentLevel] : []);

  if (levelsToDisplay.length === 0) {
    return null;
  }

  return (
    <Box className="border border-gray-200 rounded-lg shadow bg-white p-6">
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Danh hiệu
        </Typography>
      </Box>

      {/* Horizontal scrollable badges */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          pb: 1,
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "#F3F4F6",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#D1D5DB",
            borderRadius: "3px",
          },
        }}
      >
        {levelsToDisplay.map((level) => {
          // A level is achieved if current XP >= level's score requirement
          const isAchieved = currentXp >= level.scoreRequired;
          // Current level is the one user is on
          const isCurrent = currentLevel?.id === level.id;
          // Locked if not achieved yet
          const isLocked = !isAchieved;

          return (
            <Box
              key={level.id}
              className={isCurrent ? "border-2 border-blue-500" : "border border-gray-200"}
              sx={{
                minWidth: 160,
                p: 2,
                borderRadius: 2,
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  boxShadow: 2,
                },
              }}
            >
              {/* Icon Container */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: isLocked ? "#F3F4F6" : "#E3F2FD",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {isLocked ? (
                  <Box
                    sx={{
                      fontSize: 32,
                      color: "#9CA3AF",
                    }}
                  >
                    <svg
                      width={60}
                      height={60}
                      viewBox="0 0 60 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_2169_2819)">
                        <path
                          d="M30 0C24.0666 0 18.2664 1.75947 13.3329 5.05591C8.39943 8.35235 4.55425 13.0377 2.28362 18.5195C0.0129949 24.0013 -0.5811 30.0333 0.576456 35.8527C1.73401 41.6721 4.59124 47.0176 8.78681 51.2132C12.9824 55.4088 18.3279 58.266 24.1473 59.4236C29.9667 60.5811 35.9987 59.987 41.4805 57.7164C46.9623 55.4457 51.6477 51.6006 54.9441 46.6671C58.2405 41.7336 60 35.9334 60 30C59.9888 22.0469 56.8245 14.4229 51.2008 8.79919C45.5772 3.17553 37.9531 0.0112173 30 0ZM30 55.3357C24.9891 55.3357 20.0907 53.8498 15.9243 51.0659C11.7578 48.2819 8.51049 44.325 6.59289 39.6956C4.6753 35.0661 4.17357 29.9719 5.15115 25.0572C6.12873 20.1426 8.54172 15.6282 12.085 12.085C15.6282 8.5417 20.1426 6.1287 25.0573 5.15112C29.9719 4.17354 35.0661 4.67527 39.6956 6.59286C44.3251 8.51046 48.2819 11.7578 51.0659 15.9242C53.8498 20.0907 55.3357 24.9891 55.3357 30C55.3357 36.7194 52.6664 43.1637 47.9151 47.915C43.1637 52.6664 36.7195 55.3357 30 55.3357Z"
                          fill="#F2F2F7"
                        />
                        <path
                          d="M54.7483 38.1251C59.2438 24.6425 51.9584 10.0684 38.4758 5.57289C24.9932 1.07737 10.4191 8.36285 5.92354 21.8454C1.42803 35.328 8.71349 49.9021 22.1961 54.3977C35.6787 58.8932 50.2528 51.6077 54.7483 38.1251Z"
                          fill="#E5E5E8"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M34.883 27.5018H25.1447V24.3515C25.1447 23.0255 25.6909 21.8192 26.5743 20.9469C27.4578 20.0721 28.6735 19.5287 30.0126 19.5287C31.3517 19.5287 32.5699 20.0721 33.4508 20.9469C34.3343 21.8192 34.883 23.0256 34.883 24.3515V27.5018ZM39.0336 28.1648C38.7768 27.9131 38.4622 27.7186 38.1099 27.609V24.3515C38.1099 22.1457 37.1987 20.1393 35.7313 18.6863C34.2638 17.2333 32.2401 16.3335 30.0126 16.3335C27.785 16.3335 25.7613 17.2333 24.2939 18.6863C22.8265 20.1393 21.9153 22.1457 21.9153 24.3515V27.599C21.5529 27.7087 21.2282 27.9055 20.9664 28.1648C20.5536 28.576 20.2969 29.1393 20.2969 29.7624V39.9063C20.2969 40.5294 20.5536 41.0926 20.9664 41.5039C21.3817 41.9126 21.9506 42.1668 22.5798 42.1668H37.4202C38.0495 42.1668 38.6183 41.9126 39.0336 41.5039C39.4464 41.0926 39.7031 40.5294 39.7031 39.9063V29.7624C39.7032 29.1393 39.4464 28.576 39.0336 28.1648ZM28.4193 32.3794C28.8245 31.9806 29.3833 31.7314 30 31.7314C30.6167 31.7314 31.1754 31.9806 31.5807 32.3794C31.986 32.7807 32.2351 33.334 32.2351 33.9446C32.2351 34.4206 32.0841 34.8593 31.8274 35.2207C31.6134 35.5198 31.3265 35.764 30.9917 35.9285V36.9554C30.9917 37.2246 30.881 37.4713 30.6997 37.6483C30.521 37.8252 30.2743 37.9374 29.9999 37.9374C29.7281 37.9374 29.4789 37.8252 29.3002 37.6483C29.1215 37.4713 29.0082 37.2246 29.0082 36.9554V35.9285C28.6759 35.764 28.389 35.5198 28.175 35.2207C27.9158 34.8593 27.7648 34.4207 27.7648 33.9446C27.7649 33.3339 28.0166 32.7806 28.4193 32.3794Z"
                          fill="#ACACAD"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2169_2819">
                          <rect width={60} height={60} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Box>
                ) : level.icon ? (
                  <Image
                    src={level.icon}
                    alt={level.title}
                    width={50}
                    height={50}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      fontSize: 40,
                      color: "#2196F3",
                    }}
                  >
                    ⭐
                  </Box>
                )}
              </Box>

              {/* Title */}
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  textAlign: "center",
                  color: isLocked ? "#9CA3AF" : "#000000",
                  fontSize: "0.875rem",
                }}
              >
                {level.title}
              </Typography>

              {/* Score Required */}
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  color: isLocked ? "#D1D5DB" : "#6B7280",
                  fontSize: "0.75rem",
                }}
              >
                {level.scoreRequired.toLocaleString()} điểm
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
