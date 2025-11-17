import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { Android12Switch, IOSSwitch } from "@/shared/ui/form/CustomSwithcher";
import { Box, FormControlLabel, IconButton, styled, Typography, TypographyProps } from "@mui/material";
import React from "react";
import dayjs from "dayjs";
import { useUpsertCourseFormContext } from "../../UpsertCourseFormContainer";
interface QrSettingProps {
  className?: string;
}
const QrSetting: React.FC<QrSettingProps> = () => {
  const { control, getValues } = useUpsertCourseFormContext();

  return (
    <div className="flex gap-6">
      <div className="border rounded-lg p-4 border-gray-300">
        <div>
          <div className="flex items-center justify-between">
            <Typography sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Giới hạn thời gian</Typography>
            <FormControlLabel label="" control={<Android12Switch size="small" />} className="-mr-2" />
          </div>
          <Typography variant="body2">
            Học viên chỉ có thể truy cập nội dung trong khoảng thời gian.Sau khi hết hạn, họ sẽ không còn xem được khóa
            học nữa.
          </Typography>
          <div className="h-6"></div>
          <div className="flex gap-3">
            <RHFDateTimePicker name={"startAt"} control={control} />
            <RHFDateTimePicker name="endAt" control={control} />
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4 border-gray-300">
        <div>
          <div className="flex items-center justify-between">
            <Typography sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Khoảng thời gian</Typography>
            <FormControlLabel label="" control={<Android12Switch size="small" />} className="-mr-2" />
          </div>
          <Typography variant="body2">
            Hệ thống sẽ tự tính thời gian dựa trên ngày học viên được gán khóa học.Khi hết thời hạn, trạng thái của học
            viên sẽ chuyển sang “Hết hạn truy cập” và họ sẽ không thể xem nội dung nữa.
          </Typography>
          <div className="h-6"></div>
          <div className="flex gap-3">
            <RHFDateTimePicker name={"startAt"} control={control} />
            <RHFDateTimePicker name="endAt" control={control} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default QrSetting;
