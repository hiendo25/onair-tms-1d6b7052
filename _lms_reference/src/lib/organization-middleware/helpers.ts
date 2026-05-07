import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { AUTH_PATHS, PATHS } from "@/constants/path.constant";

export class OrganizationMiddlewareHelpers {
  static hasRequiredEnvVars(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY);
  }

  static createSupabaseClient(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    return { supabase, response };
  }

  static isAuthRoutes(request: NextRequest): boolean {
    const { pathname } = request.nextUrl;
    return [AUTH_PATHS.SIGNIN, AUTH_PATHS.SIGNUP].some((path) => pathname === path || pathname.startsWith(path));
  }

  static redirectToSignin(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_PATHS.SIGNIN;
    return NextResponse.redirect(url);
  }

  static redirectToDashboard(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = PATHS.DASHBOARD;
    return NextResponse.redirect(url);
  }

  static resetAllCookiesAndRedirectSignin(request: NextRequest): NextResponse {
    const response = NextResponse.redirect(new URL(AUTH_PATHS.SIGNIN, request.url));

    // Clear all cookies
    request.cookies.getAll().forEach((cookie) => {
      response.cookies.delete(cookie.name);
    });

    return response;
  }
}
