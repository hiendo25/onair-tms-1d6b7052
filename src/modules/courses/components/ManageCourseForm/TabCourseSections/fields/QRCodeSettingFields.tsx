import { Control, Controller, useFieldArray, useWatch } from "react-hook-form";
import { ClassRoom } from "../../upsert-course.schema";
import { useClassRoomFormContext } from "../../UpsertCourseFormContainer";

import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { Android12Switch } from "@/shared/ui/form/CustomSwithcher";
import { FormLabel, Typography } from "@mui/material";
import React from "react";
import dayjs from "dayjs";
interface QRCodeSettingFieldsProps {
  className?: string;
  sessionIndex: number;
  control: Control<ClassRoom>;
}
const QRCodeSettingFields: React.FC<QRCodeSettingFieldsProps> = ({ sessionIndex, className }) => {
  const { control, getValues } = useClassRoomFormContext();
  const startDate = getValues(`classRoomSessions.${sessionIndex}.qrCode.startDate`);
  useWatch({
    control,
    name: [`classRoomSessions.${sessionIndex}.qrCode.startDate`, `classRoomSessions.${sessionIndex}.qrCode.endDate`],
  });
  return (
    <Controller
      name={`classRoomSessions.${sessionIndex}.qrCode.isLimitTimeScanQrCode`}
      control={control}
      render={({ field: { value: isLimitTime, onChange } }) => (
        <div className="field">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <FormLabel component="div">Thiết lập thời gian hiệu lực QR cho lớp học</FormLabel>
              <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                Mã QR chỉ hoạt động trong khoảng thời gian được thiết lập. Sau khi hết hạn, người học sẽ không thể điểm
                danh bằng mã này.
              </Typography>
            </div>
            <Android12Switch value={isLimitTime} checked={isLimitTime} onChange={onChange} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <RHFDateTimePicker
                name={`classRoomSessions.${sessionIndex}.qrCode.startDate`}
                control={control}
                disabled={!isLimitTime}
                minDate={dayjs()}
              />
              <RHFDateTimePicker
                name={`classRoomSessions.${sessionIndex}.qrCode.endDate`}
                control={control}
                disabled={!isLimitTime}
                minDate={dayjs(startDate)}
              />
            </div>
          </div>
        </div>
      )}
    />
  );
};
export default QRCodeSettingFields;
