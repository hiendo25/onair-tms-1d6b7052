import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { SignupService } from "@/services/auth/signup.service";
import { SignUpDto } from "@/types/dto/auth/signup.dto";
import { http } from "@/utils/http-status";
export async function POST(request: NextRequest) {
  try {
    const payload: SignUpDto = await request.json();

    const data = await new SignupService().execute(payload);

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_ORGANIZATION_ID, data.organizationId);

    return http.created(data);
  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo account";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
