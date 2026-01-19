import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth/require-auth";
import { DeleteUserService } from "@/services/auth/delete-user.service";
import { http } from "@/utils/http-status";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const payload = (await request.json()) as { employeeId: string };
    const data = await new DeleteUserService().execute({
      employeeId: payload.employeeId,
      userId: user.userId,
    });

    return http.ok(user);
  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo account";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
