/**
 * Reusable authentication helper for API routes
 * Supports both cookie-based (web) and token-based (mobile) authentication
 */

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { COOKIE_ORGANIZATION_ID, HEADER_ORGANIZATION_ID } from "@/constants/api-headers.constant";
import { employeesRepository } from "@/repository";
import { createSVClient, createSVClientWithToken } from "@/services/supabase/server";

export interface AuthenticatedEmployee {
  id: string;
  organization_id: string;
}

/**
 * Authenticate user and get employee information
 * Supports both cookie-based (web) and token-based (mobile) authentication
 * Returns employee or error response
 */
export async function authenticateAndGetEmployee(
  request: NextRequest,
): Promise<{ employee: AuthenticatedEmployee } | { error: NextResponse }> {
  try {
    // Check for Authorization header (mobile/API clients)
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");

    // Create Supabase client based on auth method
    const supabase = token ? await createSVClientWithToken(token) : await createSVClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        error: NextResponse.json({ error: "User not authenticated" }, { status: 401 }),
      };
    }

    // Get organization ID from header (mobile/API) or cookie (web)
    const headerOrgId = request.headers.get(HEADER_ORGANIZATION_ID);
    const cookieStore = await cookies();
    const cookieOrgId = cookieStore.get(COOKIE_ORGANIZATION_ID)?.value;
    const organizationId = headerOrgId || cookieOrgId;

    if (!organizationId) {
      console.warn("[Auth Helper] No organization ID found in header or cookie", {
        hasAuthToken: !!token,
        hasHeaderOrgId: !!headerOrgId,
        hasCookieOrgId: !!cookieOrgId,
      });
      return {
        error: NextResponse.json(
          {
            error: "Organization ID required",
            message: `Please provide organization ID via '${HEADER_ORGANIZATION_ID}' header${token ? "" : " or cookie"}`,
          },
          { status: 403 },
        ),
      };
    }

    // Get employee from user
    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    if (!employee) {
      return {
        error: NextResponse.json({ error: "Employee not found" }, { status: 404 }),
      };
    }

    return { employee };
  } catch (error) {
    console.error("[Auth Helper] Error authenticating user:", error);
    return {
      error: NextResponse.json(
        { error: error instanceof Error ? error.message : "Authentication failed" },
        { status: 500 },
      ),
    };
  }
}
