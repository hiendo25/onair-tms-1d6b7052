import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { PATHS } from "@/constants/path.constant";
import { employeesRepository } from "@/repository";
import { createSVClient, questionBankService } from "@/services";
import type { CreateQuestionBankDto } from "@/types/dto/question-bank";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    return NextResponse.json({ success: false, message: "Organization invalid" }, { status: 403 });
  }

  try {
    const supabase = await createSVClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || undefined;
    const questionType = searchParams.get("questionType") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;

    const result = await questionBankService.getQuestionBank(
      {
        page,
        limit,
        search,
        organizationId,
        questionType,
        categoryId,
      },
      supabase,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching question bank:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tải ngân hàng câu hỏi";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: CreateQuestionBankDto = await request.json();
    const organizationId = payload.organizationId;

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

    const employee = await employeesRepository.getCurrentEmployee(user.id, organizationId);

    const result = await questionBankService.createQuestionBankQuestions(payload, employee.id, supabase);

    revalidatePath(PATHS.ASSIGNMENTS.QUESTION_BANK);

    return NextResponse.json(
      {
        success: true,
        message: "Tạo câu hỏi thành công",
        total: result.length,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating question bank:", error);

    const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo câu hỏi";

    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
