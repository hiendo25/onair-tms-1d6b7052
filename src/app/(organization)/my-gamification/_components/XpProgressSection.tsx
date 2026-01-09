import { Box, Typography } from "@mui/material";

import ProgressBar from "@/shared/ui/ProgressBar";

interface XpProgressSectionProps {
  currentXp: number;
  nextLevel: {
    title: string;
    scoreRequired: number;
    xpNeeded: number;
  } | null;
}

export default function XpProgressSection({ currentXp, nextLevel }: XpProgressSectionProps) {
  // Calculate progress percentage
  const progressPercentage = nextLevel
    ? Math.min(100, Math.round((currentXp / nextLevel.scoreRequired) * 100))
    : 100;

  return (
    <Box
      sx={{
        p: 3,
        bgcolor: "#F9FAFB",
        borderRadius: 2,
      }}
    >
      {/* Total XP */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {currentXp.toLocaleString()} điểm
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tổng điểm của bạn
      </Typography>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <ProgressBar value={progressPercentage} />
      </Box>

      {/* Next Level Info */}
      {nextLevel && nextLevel.xpNeeded > 0 && (
        <Typography variant="body2" color="text.secondary">
          Còn {nextLevel.xpNeeded.toLocaleString()} điểm nữa để đạt danh hiệu{" "}
          <strong>{nextLevel.title}</strong>
        </Typography>
      )}

      {/* Max Level Reached */}
      {!nextLevel && (
        <Typography variant="body2" color="primary" fontWeight={600}>
          Bạn đã đạt danh hiệu cao nhất!
        </Typography>
      )}

      {/* Already Qualified for Next Level */}
      {nextLevel && nextLevel.xpNeeded <= 0 && (
        <Typography variant="body2" color="success.main" fontWeight={600}>
          Bạn đã đủ điểm để đạt danh hiệu {nextLevel.title}!
        </Typography>
      )}
    </Box>
  );
}
