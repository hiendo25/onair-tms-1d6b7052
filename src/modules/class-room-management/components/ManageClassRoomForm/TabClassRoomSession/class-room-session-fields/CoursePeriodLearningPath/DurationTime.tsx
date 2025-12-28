import React, { memo } from "react";
import { FormControlLabel, FormControlLabelProps, OutlinedInput, OutlinedInputProps, Switch } from "@mui/material";
import { Control, Controller, useController } from "react-hook-form";

import { IOSSwitch } from "@/shared/ui/form/CustomSwithcher";
import { ClassRoom } from "../../../classroom-form.schema";
interface DurationTimeProps {
  control: Control<ClassRoom>;
  sessionIndex: number;
  coursePeriodIndex: number;
}
const DurationTime: React.FC<DurationTimeProps> = ({ control, sessionIndex, coursePeriodIndex }) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: `classRoomSessions.${sessionIndex}.coursesPeriod.${coursePeriodIndex}.weeklySchedule`,
  });

  const handleChangeDurationTime =
    (type: "hours" | "minutes"): OutlinedInputProps["onChange"] =>
    (evt) => {
      const timeValue = evt.target.value;

      const timeValueNumber = Number(timeValue);
      if (isNaN(timeValueNumber)) return;

      if (type === "hours" && (timeValueNumber > 24 || timeValueNumber < 0)) return;

      const updateValue = {
        ...value,
        duration: {
          ...value?.duration,
          [type]: Number(timeValue),
        },
      };

      onChange(updateValue);
    };

  const toggleDuration: FormControlLabelProps["onChange"] = (evt, checked) => {
    const updateValue = {
      ...value,
      isDuration: checked,
    };

    onChange(updateValue);
  };
  return (
    <div className="flex items-center  h-12">
      <FormControlLabel
        control={<IOSSwitch size="small" />}
        label="Thời lượng hoc"
        className="pl-3"
        sx={{
          ".MuiTypography-root": {
            marginLeft: "8px",
            fontSize: "0.875rem",
          },
        }}
        onChange={toggleDuration}
      />

      {value?.isDuration ? (
        <div className="flex items-center gap-2">
          <OutlinedInput
            value={value?.duration?.hours ?? 0}
            onChange={handleChangeDurationTime("hours")}
            type="number"
            size="small"
            sx={{
              width: 60,
            }}
          />
          <span>Giờ</span>
          <OutlinedInput
            size="small"
            onChange={handleChangeDurationTime("minutes")}
            type="number"
            value={value?.duration?.minutes ?? 0}
            sx={{
              width: 60,
            }}
          />
          <span>Phút</span>
        </div>
      ) : null}
    </div>
  );
};
export default memo(DurationTime);
