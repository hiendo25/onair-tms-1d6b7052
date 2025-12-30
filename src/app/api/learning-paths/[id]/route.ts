import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { learningPathsRepository } from "@/repository";
import { transformFormPhasesToInput,transformFormToMetadata } from "@/repository/learning-paths/transformers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, message: "Invalid learning path ID" }, { status: 400 });
    }

    const learningPath = await learningPathsRepository.getLearningPathWithDetails(id);

    if (!learningPath) {
      return NextResponse.json({ success: false, message: "Learning path not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: learningPath,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching learning path:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while fetching the learning path";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, message: "Invalid learning path ID" }, { status: 400 });
    }

    const body = await request.json();
    const { info } = body;

    // Validate required fields
    if (!info?.name) {
      return NextResponse.json({ success: false, message: "Learning path name is required" }, { status: 400 });
    }

    // Transform form data to repository params
    const updateParams: learningPathsRepository.UpdateLearningPathParams = {
      id,
      name: info.name,
      description: info.description,
      thumbnail_url: info.thumbnail,
      metadata: transformFormToMetadata(body),
      phases: transformFormPhasesToInput(body.phases || []),
      assigned_employee_ids: info.assignmentMode === "manual"
        ? (info.assignedEmployees || []).map((emp: any) => emp.id)
        : undefined,
    };

    const result = await learningPathsRepository.updateLearningPath(updateParams);

    revalidatePath(PATHS.LEARNING_PATHS.ROOT);

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật lộ trình học tập thành công!",
        learning_path_id: result.learning_path_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating learning path:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred while updating the learning path";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

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

