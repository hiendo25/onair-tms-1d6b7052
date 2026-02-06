import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DeleteUserService } from "@/services/auth/delete-user.service";

export async function GET(request: NextRequest) {
  try {
    // const payload = (await request.json()) as { employeeId: string };
    console.log({ request });
    const user = await requireAuth(request);
    console.log({ user });

    return http.ok(user);
  } catch (error) {
    console.error({ error });

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa account";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
