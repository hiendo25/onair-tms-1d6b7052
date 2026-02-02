import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { createSVClient } from "@/services";
import { DeleteUserService } from "@/services/auth/delete-user.service";
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const payload = (await request.json()) as { employeeId: string };

    console.log({ user });

    console.log({ user, employeeId: payload.employeeId });

    const data = await new DeleteUserService().execute({
      employeeId: payload.employeeId,
      userId: user.userId,
    });

    return http.ok(data);
  } catch (error) {
    console.error({ error });

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa account";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
