import { Box, LinearProgress, Typography } from "@mui/material";

import { LearningPathProgressSummary as LearningPathProgressSummaryType } from "../../types";


interface ILearningPathProgressSummary {
  progressSummary: LearningPathProgressSummaryType
}

const LearningPathProgressBarSummary = ({ progressSummary }: ILearningPathProgressSummary) => {
  return (
    <Box className="p-4 bg-[#F9FAFB] border border-[#F4F6F8] rounded-2xl">
      <Typography className="text-sm font-normal text-[#212B36]"><span className="text-[#637381]">Còn</span> {progressSummary.completedPhases}/{progressSummary.totalPhases} giai đoạn</Typography>
      <Box sx={{ position: "relative", mt: 2 }}>
        <LinearProgress
          variant="determinate"
          value={progressSummary.overallProgress}
          sx={{
            height: 16,
            borderRadius: 16,
            bgcolor: "#ACDAFF",
            "& .MuiLinearProgress-bar": {
              borderRadius: 16,
              backgroundColor: "#2196F5",
              boxShadow: "inset 0 -4px 4px 0 rgba(0, 0, 0, 0.16)",
            },
          }}
        />
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          {progressSummary.overallProgress}%
        </Typography>
      </Box>
    </Box>
  );
}

export default LearningPathProgressBarSummary;