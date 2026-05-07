import { Response } from "../pagination.dto";

export type StudentClassRoomCheckInDto = {
  qrCode: string;
  classRoomId: string;
  classSessionId: string;
  employeeId: string;
};

export type StudentClassRoomCheckedInReturnDto = {
  classRoomId: string;
  classSessionId: string;
  qrCodeId: string;
  fullName: string;
  employeeCode: string;
  checkedInAt: string;
};

export type StudentClassRoomCheckedInResponse = Response<StudentClassRoomCheckedInReturnDto>;
