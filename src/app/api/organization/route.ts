import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { organizationsRepository } from "@/repository";
import { getCurrentUser } from "@/repository/auth";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const { organizationId } = payload;
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
  }

  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Bad request" }, { status: 400 });
  }

  const { data, error } = await organizationsRepository.getOrganizationByUserIdAndOrganizationId(
    currentUser.id,
    organizationId,
  );

  if (!data || error) {
    return NextResponse.json(
      { success: false, message: "You are not belong to organization or organization invalid" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  cookieStore.set({
    httpOnly: true,
    name: "organization_id",
    value: organizationId,
    path: "/",
  });

  revalidatePath("/");
  return NextResponse.json({ success: true, message: "Update Success", data }, { status: 200 });
}
