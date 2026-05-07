import { Box, Typography } from "@mui/material";

import ProgressBar from "@/shared/ui/ProgressBar";
import type { NextLevelInfo } from "@/types/gamification.types";

interface XpProgressSectionProps {
  currentXp: number;
  nextLevel: NextLevelInfo | null;
}

export default function XpProgressSection({ currentXp, nextLevel }: XpProgressSectionProps) {
  // Calculate progress percentage
  const progressPercentage = nextLevel
    ? Math.min(100, Math.round((currentXp / nextLevel.scoreRequired) * 100))
    : 100;

  return (
    <Box className="border border-gray-200 rounded-lg shadow bg-white p-6">
      {/* Header with XP and Target */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {/* Current XP */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.8993 18.1005L28 13.9998L23.8993 9.89954V4.10026H18.1005L13.9998 0L9.89954 4.10026H4.10066V9.89954L0 13.9998L4.10066 18.1005V23.8993H9.89954L13.9998 28L18.1005 23.8993H23.8993V18.1005Z" fill="url(#paint0_linear_1_94)"/>
            <path d="M22.7953 17.6431L26.4384 14L22.7953 10.3569V5.20511H17.6431L14 1.56201L10.3573 5.20511H5.20513V10.3569L1.56201 14L5.20513 17.6431V22.7953H10.3573L14 26.438L17.6431 22.7953H22.7953V17.6431Z" fill="url(#paint1_linear_1_94)"/>
            <path d="M18.8281 6.92676C19.3597 8.04186 19.6583 9.28977 19.6583 10.6077C19.6583 15.3377 15.824 19.172 11.094 19.172C9.30278 19.172 7.64078 18.6215 6.26611 17.681C7.64279 20.5684 10.5881 22.5644 14.0002 22.5644C18.7303 22.5644 22.5645 18.7301 22.5645 14.0001C22.5641 11.0616 21.0836 8.46923 18.8281 6.92676Z" fill="#20B2FF"/>
            <path d="M19.6579 10.6075C19.6579 9.28953 19.3597 8.04163 18.8277 6.92652C17.453 5.98647 15.791 5.43555 13.9999 5.43555C9.26981 5.43555 5.43555 9.26981 5.43555 13.9999C5.43555 15.3178 5.73374 16.5657 6.26574 17.6808C7.64041 18.6209 9.30241 19.1718 11.0936 19.1718C15.8232 19.1718 19.6579 15.3375 19.6579 10.6075Z" fill="#2CB7FF"/>
            <path d="M10.1244 16.6582L11.6955 14.3145L10.1695 12.0223H11.1192L12.1752 13.6545L13.2215 12.0223H14.1776L12.6516 14.3145L14.2163 16.6582H13.2665L12.1752 14.9745L11.0806 16.6582H10.1244ZM14.7299 16.6582V12.0223H16.6454C16.6905 12.0223 16.7484 12.0245 16.8193 12.0288C16.8901 12.0309 16.9555 12.0373 17.0156 12.0481C17.2839 12.0889 17.505 12.1779 17.6788 12.3153C17.8548 12.4526 17.9847 12.6265 18.0684 12.8368C18.1542 13.045 18.1971 13.2768 18.1971 13.5322C18.1971 13.7855 18.1542 14.0173 18.0684 14.2276C17.9825 14.4358 17.8516 14.6085 17.6756 14.7459C17.5018 14.8833 17.2818 14.9723 17.0156 15.0131C16.9555 15.0217 16.889 15.0281 16.816 15.0324C16.7452 15.0367 16.6883 15.0389 16.6454 15.0389H15.5058V16.6582H14.7299ZM15.5058 14.3145H16.6132C16.6561 14.3145 16.7044 14.3124 16.7581 14.3081C16.8117 14.3038 16.8611 14.2952 16.9062 14.2823C17.035 14.2501 17.1358 14.1932 17.2088 14.1117C17.2839 14.0301 17.3365 13.9378 17.3666 13.8348C17.3987 13.7318 17.4148 13.6309 17.4148 13.5322C17.4148 13.4335 17.3987 13.3326 17.3666 13.2296C17.3365 13.1244 17.2839 13.0311 17.2088 12.9495C17.1358 12.8679 17.035 12.8111 16.9062 12.7789C16.8611 12.766 16.8117 12.7585 16.7581 12.7563C16.7044 12.752 16.6561 12.7499 16.6132 12.7499H15.5058V14.3145Z" fill="white"/>
            <defs>
              <linearGradient id="paint0_linear_1_94" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6ACCFF"/>
                <stop offset="1" stopColor="#80C4E8"/>
              </linearGradient>
              <linearGradient id="paint1_linear_1_94" x1="14.0002" y1="1.56201" x2="14.0002" y2="26.438" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6ACCFF"/>
                <stop offset="1" stopColor="#7DC5EB"/>
              </linearGradient>
            </defs>
          </svg>


          <Typography variant="h5" fontWeight={700}>
            {currentXp.toLocaleString()} điểm
          </Typography>
        </Box>

        {/* Target XP */}
        {nextLevel && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ fontSize: 20 }}>⚡</Box>
            <Typography variant="body1" color="#F59E0B" fontWeight={600}>
              {nextLevel.scoreRequired.toLocaleString()} điểm
            </Typography>
          </Box>
        )}
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <ProgressBar value={progressPercentage} />
      </Box>

      {/* Next Level Info */}
      {nextLevel && nextLevel.xpNeeded > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ fontSize: 16 }}>✨</Box>
          <Typography variant="body2" color="text.secondary">
            Còn {nextLevel.xpNeeded.toLocaleString()} điểm nữa để đạt danh hiệu{" "}
            <strong>&quot;{nextLevel.title}&quot;</strong>
          </Typography>
        </Box>
      )}

      {/* Max Level Reached */}
      {!nextLevel && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ fontSize: 16 }}>🎉</Box>
          <Typography variant="body2" color="primary" fontWeight={600}>
            Bạn đã đạt danh hiệu cao nhất!
          </Typography>
        </Box>
      )}

      {/* Already Qualified for Next Level */}
      {nextLevel && nextLevel.xpNeeded <= 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ fontSize: 16 }}>🎊</Box>
          <Typography variant="body2" color="success.main" fontWeight={600}>
            Bạn đã đủ điểm để đạt danh hiệu {nextLevel.title}!
          </Typography>
        </Box>
      )}
    </Box>
  );
}
