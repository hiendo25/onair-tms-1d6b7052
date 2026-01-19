import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { employeesRepository } from "@/repository";
import { createSVClient, questionBankService } from "@/services";
import type { UpdateQuestionBankDto } from "@/types/dto/question-bank";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Organization invalid" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const question = await questionBankService.getQuestionBankById(id, organizationId, supabase);

    if (!question) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error) {
    console.error("Error fetching question bank detail:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải câu hỏi";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const payload: UpdateQuestionBankDto = await request.json();
    const organizationId = payload.organizationId;

    const { id } = await params;

    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!organizationId) {
      return NextResponse.json({ success: false, message: "Organization Id valid" }, { status: 401 });
    }

    await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const existingQuestion = await questionBankService.getQuestionBankById(id, organizationId, supabase);

    if (!existingQuestion) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 });
    }

    await questionBankService.updateQuestionBankQuestion(id, payload.question, supabase);

    revalidatePath(PATHS.ASSIGNMENTS.QUESTION_BANK);

    return NextResponse.json(
      {
        success: true,
        message: "Cập nhật câu hỏi thành công",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating question bank:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật câu hỏi";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
