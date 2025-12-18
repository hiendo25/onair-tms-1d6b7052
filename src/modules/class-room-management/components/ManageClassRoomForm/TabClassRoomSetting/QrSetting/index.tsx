import React from "react";
import { IconButton, styled,Typography, TypographyProps } from "@mui/material";
import dayjs from "dayjs";
import { Control, Controller, useFieldArray } from "react-hook-form";

import { ChevronDownIcon } from "@/shared/assets/icons";
import { Android12Switch } from "@/shared/ui/form/CustomSwithcher";
import RHFDateTimePicker from "@/shared/ui/form/RHFDateTimePicker";
import { ClassRoom } from "../../classroom-form.schema";
import { useClassRoomFormContext } from "../../ClassRoomFormContainer";
interface QrSettingProps {
  className?: string;
}
const QrSetting: React.FC<QrSettingProps> = () => {
  const { control, getValues } = useClassRoomFormContext();
  const roomType = getValues("roomType");
  const classRoomTitle = getValues("title");
  const { fields: fieldSessions, update } = useFieldArray({
    control: control,
    name: "classRoomSessions",
    keyName: "_sessionId",
  });

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Typography component="h3" sx={{ fontSize: "16px", fontWeight: "bold" }}>
            Thiết lập thời gian hiệu lực QR cho lớp học
          </Typography>
          <Typography variant="body2">Hệ thống mặc định mã QR có hiệu lực điểm danh vô thời hạn</Typography>
        </div>
        <IconButton>
          <ChevronDownIcon />
        </IconButton>
      </div>
      <div className="flex flex-col gap-3">
        {fieldSessions.map(({ _sessionId, title, isOnline, startDate, endDate, qrCode }, _index) => (
          <React.Fragment key={_sessionId}>
            {!isOnline ? (
              <SessionQrCodeConfigItem
                control={control}
                sessionIndex={_index}
                startDate={dayjs(startDate).isValid() ? dayjs(startDate).format("DD/MM/YYYY") : "--"}
                endDate={dayjs(endDate).isValid() ? dayjs(endDate).format("DD/MM/YYYY") : "--"}
                title={roomType === "single" ? classRoomTitle : title}
                rightSlots={
                  <Controller
                    name={`classRoomSessions.${_index}.qrCode.isLimitTimeScanQrCode`}
                    control={control}
                    render={({ field: { value: isLimitTime, onChange } }) => (
                      <div className="flex items-center gap-2">
                        <Android12Switch value={isLimitTime} checked={isLimitTime} onChange={onChange} />
                        <div className="flex gap-2">
                          <RHFDateTimePicker
                            name={`classRoomSessions.${_index}.qrCode.startDate`}
                            control={control}
                            disabled={!isLimitTime}
                          />
                          <RHFDateTimePicker
                            name={`classRoomSessions.${_index}.qrCode.endDate`}
                            control={control}
                            disabled={!isLimitTime}
                          />
                        </div>
                      </div>
                    )}
                  />
                }
              />
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
export default QrSetting;

interface SessionQrCodeConfigItemProps {
  control: Control<ClassRoom>;
  sessionIndex: number;
  title: string;
  startDate?: string;
  endDate?: string;
  rightSlots: React.ReactNode;
}
const SessionQrCodeConfigItem: React.FC<SessionQrCodeConfigItemProps> = ({
  control,
  sessionIndex,
  title,
  startDate,
  endDate,
  rightSlots,
}) => {
  return (
    <div className="inner flex gap-6 border p-4 border-gray-200 rounded-xl">
      <div className="flex-1 flex gap-2">
        <BoxNumberCount sx={{ marginTop: "2px" }}>{sessionIndex + 1}</BoxNumberCount>
        <div>
          <Typography sx={{ fontWeight: "bold", flex: 1 }} className="line-clamp-2">
            {title}
          </Typography>
          <div className="flex items-center gap-1">
            <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
              {startDate}
            </Typography>
            <span>-</span>
            <Typography sx={{ fontSize: "0.875rem" }} variant="body2">
              {endDate}
            </Typography>
          </div>
        </div>
      </div>
      {rightSlots}
    </div>
  );
};
const BoxNumberCount = styled((props: TypographyProps) => <Typography {...props} component="span" />)(() => ({
  width: "1.25rem",
  height: "1.25rem",
  background: "#7B61FF",
  display: "inline-flex",
  alignContent: "center",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "5px",
  fontWeight: "bold",
  color: "white",
  fontSize: "0.75rem",
}));
