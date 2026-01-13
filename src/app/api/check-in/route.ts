import { NextRequest, NextResponse, userAgent } from "next/server";

import { authRepository } from "@/repository";
import { ClassRoomCheckInService } from "@/services/checkin/class-room-checkin.service";
import { StudentClassRoomCheckInDto } from "@/types/dto/classRooms/student-check-in-classroom.dto";
import { http } from "@/utils/http-status";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await authRepository.getCurrentUser();

    const agent = userAgent(request);

    if (!currentUser) {
      return http.unauthorized();
    }

    const viewport = agent.device.type || "desktop";

    const payload = (await request.json()) as StudentClassRoomCheckInDto;

    if (!payload.classRoomId || !payload.classSessionId || !payload.employeeId || !payload.qrCode) {
      return http.badRequest(`Missing some key ${Object.keys(payload).join(",")}`);
    }

    const data = await new ClassRoomCheckInService(agent).execute(payload);
    return http.created(data);
  } catch (error) {
    console.error("Error check-in student", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi khi check-in";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
