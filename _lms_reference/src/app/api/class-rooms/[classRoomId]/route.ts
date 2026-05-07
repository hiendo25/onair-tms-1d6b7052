import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { UpdateClassRoomDto, UpdateClassRoomService } from "@/services/class-room/update-classroom.service";

export async function POST(request: NextRequest, { params }: { params: Promise<{ classRoomId: string }> }) {
  try {
    const { employeeId } = await requireAuth();
    const { classRoomId } = await params;
    const payload = (await request.json()) as UpdateClassRoomDto;

    if (!classRoomId) {
      return http.badRequest("Invalid classRoomId");
    }

    const classRoomData = await new UpdateClassRoomService(employeeId).execute({
      classRoomId: classRoomId,
      formData: payload.formData,
      students: payload.students,
      certificate: payload.certificate,
    });

    return http.created(classRoomData);
  } catch (err: any) {
    return http.serverError(`Can't update classroom ${err?.message}`);
  }
}
