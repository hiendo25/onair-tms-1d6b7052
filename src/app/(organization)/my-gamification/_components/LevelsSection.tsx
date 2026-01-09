import { Box, Typography } from "@mui/material";
import Image from "next/image";

interface LevelInfo {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  scoreRequired: number;
}

interface LevelsSectionProps {
  currentLevel: LevelInfo | null;
  nextLevel: LevelInfo | null;
}

// Color configurations for different level positions
const LEVEL_COLORS = [
  { bg: "#E3F2FD", icon: "#2196F3" }, // Blue for first level
  { bg: "#FFEBEE", icon: "#F44336" }, // Red for second level
  { bg: "#F3E5F5", icon: "#9C27B0" }, // Purple for third level
];

export default function LevelsSection({ currentLevel, nextLevel }: LevelsSectionProps) {
  // Combine current and next level for display
  const levels: (LevelInfo & { isCurrent: boolean; isNext: boolean })[] = [];

  if (currentLevel) {
    levels.push({ ...currentLevel, isCurrent: true, isNext: false });
  }

  if (nextLevel) {
    levels.push({ ...nextLevel, isCurrent: false, isNext: true });
  }

  if (levels.length === 0) {
    return null;
  }

  return (
    <Box className="border border-gray-200 rounded-lg shadow bg-white p-6">
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Danh hiệu
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "flex-start",
        }}
      >
        {levels.map((level, index) => {
          const isAchieved = level.isCurrent;
          const isNext = level.isNext;
          const colors = LEVEL_COLORS[index] || LEVEL_COLORS[0];

          return (
            <Box
              key={level.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                opacity: isNext ? 0.4 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {/* Icon Container */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  bgcolor: colors.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {level.icon ? (
                  <Image
                    src={level.icon}
                    alt={level.title}
                    width={60}
                    height={60}
                    style={{
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      fontSize: 48,
                      color: colors.icon,
                    }}
                  >
                    {isAchieved ? "⭐" : isNext ? "💎" : "🏅"}
                  </Box>
                )}
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  textAlign: "center",
                  fontSize: "1rem",
                  color: isNext ? "#9E9E9E" : "#000000",
                }}
              >
                {level.title}
              </Typography>

              {/* Score Required */}
              <Typography
                variant="body2"
                sx={{
                  textAlign: "center",
                  color: isNext ? "#BDBDBD" : "#757575",
                  fontWeight: 400,
                }}
              >
                {level.scoreRequired.toLocaleString()} XP
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
