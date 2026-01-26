import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { organizationsRepository } from "@/repository";
import { getCurrentUser } from "@/repository/auth";
import { createServiceRoleClient } from "@/services";
export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { organizationId } = payload;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return http.unauthorized();
  }

  if (!organizationId) {
    return http.badRequest("Invalid organizationId");
  }

  const { data, error } = await organizationsRepository.getOrganizationByUserIdAndOrganizationId(
    currentUser.id,
    organizationId,
  );

  if (!data || error) {
    return http.badRequest("You are not belong to organization or organization invalid");
  }

  const supabaseAdmin = await createServiceRoleClient();
  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    name: "organization_id",
    value: organizationId,
    path: "/",
    secure: true,
  });

  await supabaseAdmin.auth.admin.updateUserById(currentUser.id, {
    app_metadata: {
      active_organization_id: organizationId,
    },
  });

  revalidatePath("/");
  return NextResponse.json({ success: true, message: "Update Success", data }, { status: 200 });
}
