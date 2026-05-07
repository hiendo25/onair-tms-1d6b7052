import { Box, LinearProgress, Typography } from "@mui/material";

export interface ProgressBarProps {
  /**
   * The progress percentage (0-100)
   */
  value: number;
  /**
   * Height of the progress bar in pixels
   * @default 16
   */
  height?: number;
  /**
   * Border radius in pixels
   * @default 16
   */
  borderRadius?: number;
  /**
   * Background track color
   * @default "#ACDAFF"
   */
  trackColor?: string;
  /**
   * Progress bar color
   * @default "#2196F5"
   */
  barColor?: string;
  /**
   * Label text color
   * @default "#FFFFFF"
   */
  labelColor?: string;
  /**
   * Whether to show the percentage label
   * @default true
   */
  showLabel?: boolean;
}

export default function ProgressBar({
  value,
  height = 16,
  borderRadius = 16,
  trackColor = "#ACDAFF",
  barColor = "#2196F5",
  labelColor = "#FFFFFF",
  showLabel = true,
}: ProgressBarProps) {
  return (
    <Box sx={{ position: "relative" }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height,
          borderRadius,
          bgcolor: trackColor,
          "& .MuiLinearProgress-bar": {
            borderRadius,
            backgroundColor: barColor,
            boxShadow: "inset 0 -4px 4px 0 rgba(0, 0, 0, 0.16)",
          },
        }}
      />
      {showLabel && (
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: labelColor,
          }}
        >
          {value}%
        </Typography>
      )}
    </Box>
  );
}
