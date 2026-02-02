import { type NextRequest, NextResponse } from "next/server";

import { OrganizationMiddlewareHelpers } from "./helpers";
import { ensureOrganizationCookie } from "./organization-check";

export async function organizationMiddleware(request: NextRequest) {
  if (!OrganizationMiddlewareHelpers.hasRequiredEnvVars()) {
    console.warn("Missing Supabase environment variables");
    return NextResponse.next({ request });
  }
  const isAuthRoute = OrganizationMiddlewareHelpers.isAuthRoutes(request);

  const { supabase, response } = OrganizationMiddlewareHelpers.createSupabaseClient(request);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAuthRoute) {
      if (user) {
        return OrganizationMiddlewareHelpers.redirectToDashboard(request);
      }
      return response;
    }

    if (!user && !OrganizationMiddlewareHelpers.isAuthRoutes(request)) {
      return OrganizationMiddlewareHelpers.redirectToSignin(request);
    }

    if (!user) {
      return response;
    }

    return await ensureOrganizationCookie(request, response, user.id);
  } catch (err) {
    console.error("Middleware fatal error:", err);
    return OrganizationMiddlewareHelpers.resetAllCookiesAndRedirectSignin(request);
  }
}
