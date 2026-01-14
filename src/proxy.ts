import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_PATHS, PATHS } from "./constants/path.constant";
import { organizationsRepository, userPreferenceRepository } from "./repository";
import { authRepository } from "./repository";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authPaths = [AUTH_PATHS.SIGNIN, AUTH_PATHS.SIGNUP] as string[];

  const isAuthPath = authPaths.includes(pathname);

  const { data, error } = await authRepository.getClaims();
  const userId = data?.claims?.sub;

  if (isAuthPath && !userId) {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url));
  }

  const organizations = await organizationsRepository.getOrganizationsByUserId(userId);
  console.log({ organizations });

  if (pathname === "/no-organization") {
    return !organizations.length ? NextResponse.next() : NextResponse.redirect(new URL(PATHS.DASHBOARD, request.url));
  }

  if (!organizations.length) return NextResponse.redirect(new URL("/no-organization", request.url));

  return await applyOrganizationMiddleware(request, userId);
}

async function applyOrganizationMiddleware(request: NextRequest, userId: string) {
  const { data: userReference, error } = await userPreferenceRepository.getUserPreferencesByUserId(userId);
  const organization = request.cookies.get("organization_id");

  const response = NextResponse.next();

  if (userReference && !organization) {
    response.cookies.set({
      name: "organization_id",
      value: userReference.default_organization_id,
      path: "/",
      httpOnly: true,
      secure: true,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
