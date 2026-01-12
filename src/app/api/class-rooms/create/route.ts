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
    });

    return http.created(classRoomData);
  } catch (err) {
    return http.internalServerError("Can't create classroom");
  }
}
