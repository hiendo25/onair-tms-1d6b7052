import { NextRequest, NextResponse } from "next/server";

import { branchRepository } from "@/repository/branch";

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    const code = await branchRepository.generateNextBranchCode(organizationId);

    return NextResponse.json({
      success: true,
      data: { code },
    });
  } catch (error) {
    console.error("Error generating branch code:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi tạo mã chi nhánh";

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
