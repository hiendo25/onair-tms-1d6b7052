import "@/modules/class-room-management/listeners/create-classroom";

import { NextRequest } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { CreateClassRoomDto, CreateClassRoomService } from "@/services/class-room/create-classroom.service";
import { http } from "@/utils/http-status";
export async function POST(request: NextRequest) {
  try {
    const { employeeId, organizationId } = await requireAuth();

    const payload = (await request.json()) as CreateClassRoomDto;

    const classRoomData = await new CreateClassRoomService(employeeId, organizationId).execute({
      formData: payload.formData,
      students: payload.students,
      certificate: payload.certificate,
    });

    return http.created(classRoomData);
  } catch (err) {
    return http.serverError("Can't create classroom");
  }
}
