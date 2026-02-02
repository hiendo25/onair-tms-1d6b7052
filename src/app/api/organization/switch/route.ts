import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { http } from "@/lib/api/http-status";
import { organizationsRepository } from "@/repository";
import { getCurrentUser } from "@/repository/auth";
import { createServiceRoleClient } from "@/services";
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { organizationId } = payload;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return http.unauthorized();
    }

    if (!organizationId) {
      return http.badRequest("Invalid organizationId");
    }

    const organization = await organizationsRepository.getOrganizationByUserIdAndOrganizationId(
      currentUser.id,
      organizationId,
    );

    if (!organization) {
      return http.badRequest("You are not belong to organization or organization invalid");
    }

    const supabaseAdmin = await createServiceRoleClient();

    await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
      app_metadata: {
        active_organization_id: organizationId,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set({
      httpOnly: true,
      name: "organization_id",
      value: organization.organization_id,
      path: "/",
      secure: true,
    });

    return http.ok(organization);
  } catch (err) {
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return http.serverError(errorMessage);
  }
}
