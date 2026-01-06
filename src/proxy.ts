import { User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_PATHS } from "./constants/path.constant";
import { organizationsRepository, userPreferenceRepository } from "./repository";
import { authRepository } from "./repository";
import { GetOrganizationsByUserIdResponse } from "./repository/organizations";
import { updateSession } from "./services";
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPaths = [AUTH_PATHS.SIGNIN, AUTH_PATHS.SIGNUP] as string[];

  const isAuthPath = authPaths.includes(pathname);
  if (isAuthPath) {
    return NextResponse.next();
  }

  const { data: userClaims, error } = await authRepository.getClaims();
  console.log({
    userClaims: JSON.stringify(userClaims),
    meta: userClaims?.claims?.app_metadata,
    usermeta: userClaims?.claims?.user_metadata,
  });
  if (!userClaims) {
    return NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url));
  }

  const userId = userClaims.claims.sub;

  const organizations = await organizationsRepository.getOrganizationsByUserId(userId);
  const defaultOrganization = organizations[0];

  if (pathname === "/no-organization") {
    if (!defaultOrganization) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/organizations", request.url));
  }

  if (!defaultOrganization) {
    return NextResponse.redirect(new URL("/no-organization", request.url));
  }

  return await applyOrganizationMiddleware(request, userId, defaultOrganization);
}

async function applyOrganizationMiddleware(
  request: NextRequest,
  userId: string,
  defaultOrganization: GetOrganizationsByUserIdResponse[number],
) {
  const { data: userReference, error } = await userPreferenceRepository.getUserPreferencesByUserId(userId);

  const response = NextResponse.next();

  console.log({ defaultOrganization });
  const {
    organization: { id: organizationId },
  } = defaultOrganization;

  if (!userReference || error) {
    await userPreferenceRepository.upsertUserPreference({
      default_organization_id: organizationId,
      user_id: userId,
    });

    response.cookies.set({
      name: "organization_id",
      value: organizationId,
      path: "/",
      httpOnly: true,
    });
  } else {
    const organization = request.cookies.get("organization_id");
    if (!organization) {
      response.cookies.set({
        name: "organization_id",
        value: userReference.default_organization_id,
        path: "/",
        httpOnly: true,
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
