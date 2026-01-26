import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { http } from "@/lib/api/http-status";
import { getCookieStore, setCookieStore } from "@/lib/cookies";
import { SignInService } from "@/services/auth/signin.service";
import { SignInDto } from "@/types/dto/auth/sign-in.dto";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SignInDto;

    const user = await new SignInService().execute(payload);

    const organizationId = await getCookieStore("organization_id");
    const cookieStore = await cookies();
    if (!organizationId && user.app_metadata.active_organization_id) {
      setCookieStore("organization_id", user.app_metadata.active_organization_id, {
        path: "/",
        httpOnly: true,
        secure: true,
      });
      // cookieStore.set({
      //   name: "organization_id",
      //   value: user.app_metadata.active_organization_id,
      //   path: "/",
      //   httpOnly: true,
      //   secure: true,
      // });
    }

    console.log({ user });
    return http.ok(user);
  } catch (error) {
    console.error(error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi ddawn";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
