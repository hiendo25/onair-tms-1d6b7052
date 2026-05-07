import { NextRequest, NextResponse, userAgent } from "next/server";

import { http } from "@/lib/api/http-status";
import { DomainError } from "@/lib/errors/DomainError";
import { authRepository } from "@/repository";
import { ClassRoomCheckInService } from "@/services/checkin/class-room-checkin.service";
import { StudentClassRoomCheckInDto } from "@/types/dto/classRooms/student-check-in-classroom.dto";

export async function POST(request: NextRequest) {
  try {
    const currentUser = await authRepository.getCurrentUser();

    const agent = userAgent(request);

    if (!currentUser) {
      return http.unauthorized();
    }

    const viewport = agent.device.type || "desktop";

    const payload = (await request.json()) as StudentClassRoomCheckInDto;

    const data = await new ClassRoomCheckInService(agent).execute(payload);
    return http.created(data);
  } catch (error) {
    console.log(error);
    if (error instanceof DomainError) {
      return http.error(error.status, error.message, error.code, error.data);
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Uknown error" }, { status: 500 });
  }
}
