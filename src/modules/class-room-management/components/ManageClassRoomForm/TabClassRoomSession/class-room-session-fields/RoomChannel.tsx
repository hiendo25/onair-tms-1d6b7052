import React from "react";
import { alpha, FormControl, FormLabel, InputAdornment, MenuItem, MenuList, Select, styled } from "@mui/material";
import { Control, useController } from "react-hook-form";

import { LinkIcon } from "@/shared/assets/icons";
import GoogleMeetIcon from "@/shared/assets/icons/GoogleMeetIcon";
import MicrosoftTeamIcon from "@/shared/assets/icons/MicrosoftTeamIcon";
import ZoomIcon from "@/shared/assets/icons/ZoomIcon";
import RHFRadioGroupField, { RHFRadioGroupFieldProps } from "@/shared/ui/form/RHFRadioGroupField";
import RHFTextField, { RHFTextFieldProps } from "@/shared/ui/form/RHFTextField";
import { ClassRoomFormValues } from "../../classroom-form.schema";

interface RoomChannelProps {
  control: Control<ClassRoomFormValues>;
  index: number;
}

const CHANNEL_OPTIONS: RHFRadioGroupFieldProps<ClassRoomFormValues>["options"] = [
  {
    id: "1",
    value: "zoom",
    label: (
      <div className="flex gap-2 items-center">
        <ZoomIcon /> Zoom
      </div>
    ),
  },
  {
    id: "2",
    value: "google_meet",
    label: (
      <div className="flex gap-2 items-center">
        <GoogleMeetIcon />
        Google Meet
      </div>
    ),
  },
  {
    id: "3",
    value: "microsoft_teams",
    label: (
      <div className="flex gap-2 items-center">
        <MicrosoftTeamIcon />
        Microsoft Teams
      </div>
    ),
  },
] as const;

const CustomRHFRadioGroupField = styled((props: RHFRadioGroupFieldProps<ClassRoomFormValues>) => (
  <RHFRadioGroupField {...props} />
))(({ theme }) => ({
  "& .MuiFormGroup-root": {
    marginLeft: "0.75rem",
  },
  "& .MuiFormControlLabel-label": {
    padding: "0.25rem 0.5rem",
    borderRadius: "8px",
    border: "1px solid",
    backgroundColor: alpha(theme.palette.grey[400], 0.1),
    borderColor: theme.palette.grey[300],
  },
  "& .MuiButtonBase-root": {
    display: "none",

    "&.Mui-checked ~ .MuiFormControlLabel-label": {
      backgroundColor: alpha(theme.palette.primary["main"], 0.1),
      borderColor: theme.palette.primary["main"],
    },
  },
}));
const RoomChannel: React.FC<RoomChannelProps> = ({ control, index }) => {
  const {
    field: { value },
  } = useController({
    control: control,
    name: `classRoomSessions.${index}.channelProvider`,
  });
  return (
    <div className="flex flex-col gap-4">
      <CustomRHFRadioGroupField
        label="Nền tảng tổ chức lớp học"
        required
        name={`classRoomSessions.${index}.channelProvider`}
        control={control}
        direction="horizontal"
        options={CHANNEL_OPTIONS}
      />
      <RHFTextField
        name={`classRoomSessions.${index}.channelInfo.url`}
        control={control}
        required
        label="Link tham dự"
        startAdornment={
          <InputAdornment position="start">
            <LinkIcon className="w-5 h-5 text-blue-600" />
          </InputAdornment>
        }
        placeholder="https://..."
      />
      {value !== "google_meet" ? (
        <div className="flex items-center gap-4">
          <RHFTextField
            name={`classRoomSessions.${index}.channelInfo.providerId`}
            control={control}
            label="Meeting ID"
            placeholder="123 456 888"
          />
          <RHFTextField
            name={`classRoomSessions.${index}.channelInfo.password`}
            control={control}
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
          />
        </div>
      ) : null}
    </div>
  );
};
export default RoomChannel;

interface RoomChannelSelectProps {
  control: Control<ClassRoomFormValues>;
  index: number;
}

const RoomChannelSelect: React.FC<RoomChannelSelectProps> = ({ control, index }) => {
  return (
    <div>
      <FormControl fullWidth>
        <FormLabel id="demo-simple-select-label">
          Nền tảng tổ chức lớp học <span className="ml-1 text-red-600">*</span>
        </FormLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          sx={() => ({
            "& .MuiList-root": {
              display: "flex",
              flexDirection: "column",
              gap: 2,
            },
          })}
        >
          <MenuItem value="" disabled>
            Chọn nền tảng
          </MenuItem>
          {CHANNEL_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <RHFTextField
        name={`classRoomSessions.${index}.channelInfo.url`}
        control={control}
        required
        label="Link tham dự"
        placeholder="https://..."
      />
      <div className="flex items-center gap-4">
        <RHFTextField
          name={`classRoomSessions.${index}.channelInfo.providerId`}
          control={control}
          label="Meeting ID"
          placeholder="123 456 888"
        />
        <RHFTextField
          name={`classRoomSessions.${index}.channelInfo.password`}
          control={control}
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
        />
      </div>
    </div>
  );
};
