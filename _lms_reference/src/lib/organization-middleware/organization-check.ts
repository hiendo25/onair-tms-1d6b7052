import { NextRequest, NextResponse } from "next/server";

import { COOKIE_STORE_KEY } from "@/constants/cookie.constant";
import { PATHS } from "@/constants/path.constant";
import { organizationsRepository, userPreferenceRepository } from "@/repository";

import { OrganizationMiddlewareHelpers } from "./helpers";

function redirectWithCookies(request: NextRequest, response: NextResponse, pathname: string) {
  const redirect = NextResponse.redirect(new URL(pathname, request.url));

  response.cookies.getAll().forEach((cookie) => {
    redirect.cookies.set(cookie.name, cookie.value, cookie);
  });

  return redirect;
}

async function ensureGetUserPreference(userId: string, defaultOrganizationId: string) {
  const userPreference = await userPreferenceRepository.getUserPreferencesByUserId(userId);

  if (userPreference) return userPreference;

  try {
    const createUserPreference = await userPreferenceRepository.createUserPreference({
      user_id: userId,
      default_organization_id: defaultOrganizationId,
    });
    return createUserPreference;
  } catch (error: any) {
    const retryUserPreference = await userPreferenceRepository.getUserPreferencesByUserId(userId);
    if (retryUserPreference) {
      return retryUserPreference;
    }
    throw error;
  }
}

export async function ensureOrganizationCookie(request: NextRequest, response: NextResponse, userId: string) {
  const { pathname } = request.nextUrl;
  const organizations = await organizationsRepository.getOrganizationsActiveByUserId(userId);

  const firstOrganization = organizations[0];
  if (pathname === "/no-organization" || pathname.startsWith("/no-organization/")) {
    if (organizations.length) {
      return redirectWithCookies(request, response, PATHS.DASHBOARD);
    }
    return response;
  }

  if (!organizations.length || !firstOrganization) {
    return redirectWithCookies(request, response, "/no-organization");
  }

  const existingOrgCookie = request.cookies.get(COOKIE_STORE_KEY.organization_id);

  if (existingOrgCookie) {
    const isInvalidCookie = organizations.every((org) => org.organization_id !== existingOrgCookie.value);

    if (isInvalidCookie) {
      console.warn("[Middleware] Invalid/unauthorized org cookie:", {
        userId,
        cookieOrgId: existingOrgCookie.value,
        userOrgs: organizations.map((o) => o.organization_id),
      });
      return OrganizationMiddlewareHelpers.resetAllCookiesAndRedirectSignin(request);
    }
    return response;
  }

  const userPreference = await ensureGetUserPreference(userId, firstOrganization.organization_id);
  console.log({ userPreference });
  response.cookies.set(COOKIE_STORE_KEY.organization_id, userPreference.default_organization_id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
