import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { learningPathsRepository } from "@/repository";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, message: "Invalid learning path ID" }, { status: 400 });
    }

    await learningPathsRepository.deleteLearningPath(id);

    revalidatePath(PATHS.LEARNING_PATHS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Learning path deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting learning path:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while deleting the learning path";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

