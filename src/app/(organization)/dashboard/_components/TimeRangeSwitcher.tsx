import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import { TimeRange, timeRangeOptions } from "./mock/dashboardData";

type Props = {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
};

const TimeRangeSwitcher = ({ value, onChange }: Props) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    size="small"
    onChange={(_, newValue) => {
      if (newValue) {
        onChange(newValue);
      }
    }}
    sx={{
      bgcolor: "white !important",
      borderRadius: 1,
      border: 1,
      borderColor: "#919EAB14",
      p: "4px",
      "& .MuiToggleButtonGroup-grouped": {
        border: 0,
        textTransform: "none",
        fontWeight: 600,
        fontSize: 13,
        color: "#637381 !important",
        bgcolor: "white !important",
        borderTopLeftRadius: "8px !important",
        borderBottomLeftRadius: "8px !important",
        borderTopRightRadius: "8px !important",
        borderBottomRightRadius: "8px !important",
        "&.Mui-selected": {
          bgcolor: "#E0EAFF !important",
          color: "#212B36 !important",
        },
      },
      "& .MuiToggleButtonGroup-grouped.MuiToggleButtonGroup-middleButton": {
        mx: 1,
      }
    }}
  >
    {
      timeRangeOptions.map((option) => (
        <ToggleButton key={option.value} value={option.value} disableRipple>
          {option.label}
        </ToggleButton>
      ))
    }
  </ToggleButtonGroup >
);

export default TimeRangeSwitcher;
