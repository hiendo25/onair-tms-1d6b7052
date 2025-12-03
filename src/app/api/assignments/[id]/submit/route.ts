import { NextRequest, NextResponse } from "next/server";
import { createSVClient } from "@/services";
import * as assignmentResultService from "@/services/assignment-results/assignment-result.service";
import { Database } from "@/types/supabase.types";
import { QuestionOption, FileMetadata } from "@/types/dto/assignments";
import { assignmentsRepository } from "@/repository";

type QuestionType = Database["public"]["Enums"]["question_type"];

interface SubmitAssignmentRequest {
  employeeId: string;
  answers: Array<{
    questionId: string;
    answer: string | string[] | boolean | FileMetadata[] | Array<{ columnAId: string; columnBId: string }> | Array<{ id: string; position: number }>;
    attachments?: FileMetadata[];
  }>;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const assignmentId = params.id;

    const body: SubmitAssignmentRequest = await request.json();
    const { employeeId, answers } = body;

    if (!employeeId) {
      return NextResponse.json(
        { error: "Missing required field: employeeId" },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc: answers" },
        { status: 400 }
      );
    }

    // Validate that all answers have questionId
    for (const answer of answers) {
      if (!answer.questionId) {
        return NextResponse.json(
          { error: "Thiếu thông tin câu hỏi" },
          { status: 400 }
        );
      }
    }

    // Fetch question details from database
    const questionIds = answers.map(a => a.questionId);
    const questions = await assignmentsRepository.getQuestionsByIds(questionIds);

    if (questions.length !== answers.length) {
      return NextResponse.json(
        { error: "Một số câu hỏi không tồn tại" },
        { status: 400 }
      );
    }

    // Create a map of questions for easy lookup
    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Populate answer objects with question details from database
    const enrichedAnswers = answers.map(answer => {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw new Error(`Question not found: ${answer.questionId}`);
      }

      return {
        questionId: answer.questionId,
        questionLabel: question.label,
        questionType: question.type,
        options: question.options as QuestionOption[] | undefined,
        answer: answer.answer,
        attachments: answer.attachments,
      };
    });

    // Validate enriched answers
    for (const answer of enrichedAnswers) {
      if (answer.attachments && Array.isArray(answer.attachments)) {
        for (const attachment of answer.attachments) {
          if (typeof attachment !== "object" || !attachment.url || !attachment.originalName || attachment.fileSize === undefined || !attachment.mimeType) {
            return NextResponse.json(
              { error: "Định dạng tệp đính kèm không hợp lệ" },
              { status: 400 }
            );
          }
          if (typeof attachment.url !== "string" || typeof attachment.originalName !== "string" || typeof attachment.fileSize !== "number" || typeof attachment.mimeType !== "string") {
            return NextResponse.json(
              { error: "Định dạng URL, tên file, kích thước hoặc loại tệp đính kèm không hợp lệ" },
              { status: 400 }
            );
          }
          if (attachment.fileSize <= 0) {
            return NextResponse.json(
              { error: "Kích thước tệp đính kèm phải là số dương" },
              { status: 400 }
            );
          }
          if (attachment.mimeType.trim() === "") {
            return NextResponse.json(
              { error: "Loại tệp đính kèm không được để trống" },
              { status: 400 }
            );
          }
          const isValidS3Url = attachment.url.includes('.s3.') && attachment.url.includes('amazonaws.com');
          if (!isValidS3Url) {
            return NextResponse.json(
              { error: "URL tệp đính kèm không hợp lệ" },
              { status: 400 }
            );
          }
        }
      }

      switch (answer.questionType) {
        case "file":
          if (!Array.isArray(answer.answer) || answer.answer.length === 0) {
            return NextResponse.json(
              { error: `Vui lòng tải lên file cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          for (const file of answer.answer) {
            if (typeof file !== "object" || !file.url || !file.originalName || file.fileSize === undefined || !file.mimeType) {
              return NextResponse.json(
                { error: "Định dạng file không hợp lệ" },
                { status: 400 }
              );
            }
            if (typeof file.url !== "string" || typeof file.originalName !== "string" || typeof file.fileSize !== "number" || typeof file.mimeType !== "string") {
              return NextResponse.json(
                { error: "Định dạng URL, tên file, kích thước hoặc loại file không hợp lệ" },
                { status: 400 }
              );
            }
            if (file.fileSize <= 0) {
              return NextResponse.json(
                { error: "Kích thước file phải là số dương" },
                { status: 400 }
              );
            }
            if (file.mimeType.trim() === "") {
              return NextResponse.json(
                { error: "Loại file không được để trống" },
                { status: 400 }
              );
            }
            const isValidS3Url = file.url.includes('.s3.') && file.url.includes('amazonaws.com');
            if (!isValidS3Url) {
              return NextResponse.json(
                { error: "URL file không hợp lệ" },
                { status: 400 }
              );
            }
          }
          break;

        case "text":
          if (typeof answer.answer !== "string" || answer.answer.trim() === "") {
            return NextResponse.json(
              { error: `Vui lòng nhập câu trả lời cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          break;

        case "checkbox":
          if (!Array.isArray(answer.answer) || answer.answer.length === 0) {
            return NextResponse.json(
              { error: `Vui lòng chọn ít nhất một đáp án cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          if (answer.options) {
            const validOptionIds = answer.options.map(opt => opt.id);
            for (const optionId of answer.answer as string[]) {
              if (!validOptionIds.includes(optionId)) {
                return NextResponse.json(
                  { error: "Đáp án được chọn không hợp lệ" },
                  { status: 400 }
                );
              }
            }
          }
          break;

        case "radio":
          if (typeof answer.answer !== "string" || answer.answer.trim() === "") {
            return NextResponse.json(
              { error: `Vui lòng chọn đáp án cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          if (answer.options) {
            const validOptionIds = answer.options.map(opt => opt.id);
            if (!validOptionIds.includes(answer.answer)) {
              return NextResponse.json(
                { error: "Đáp án được chọn không hợp lệ" },
                { status: 400 }
              );
            }
          }
          break;

        case "matching":
          if (!Array.isArray(answer.answer) || answer.answer.length === 0) {
            return NextResponse.json(
              { error: `Vui lòng hoàn thành ghép đôi cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          // Validate mapping structure
          for (const mapping of answer.answer as Array<{ columnAId: string; columnBId: string }>) {
            if (!mapping.columnAId || !mapping.columnBId) {
              return NextResponse.json(
                { error: "Dữ liệu ghép đôi không hợp lệ" },
                { status: 400 }
              );
            }
          }
          break;

        case "order":
          if (!Array.isArray(answer.answer) || answer.answer.length === 0) {
            return NextResponse.json(
              { error: `Vui lòng sắp xếp các mục cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          // Validate order structure
          for (const item of answer.answer as Array<{ id: string; position: number }>) {
            if (!item.id || typeof item.position !== "number") {
              return NextResponse.json(
                { error: "Dữ liệu sắp xếp không hợp lệ" },
                { status: 400 }
              );
            }
          }
          break;

        case "true_false":
          if (typeof answer.answer !== "boolean") {
            return NextResponse.json(
              { error: `Vui lòng chọn Đúng hoặc Sai cho câu hỏi: ${answer.questionLabel}` },
              { status: 400 }
            );
          }
          break;

        default:
          return NextResponse.json(
            { error: `Loại câu hỏi không hợp lệ: ${answer.questionType}` },
            { status: 400 }
          );
      }
    }

    const result = await assignmentResultService.submitAssignment({
      assignmentId,
      employeeId,
      answers: enrichedAnswers,
    });

    let message = "Nộp bài thành công!";
    if (result.status === "graded") {
      message = `Nộp bài thành công! Điểm: ${result.score}/${result.maxScore}`;
    } else {
      message = "Nộp bài thành công! Giáo viên sẽ chấm điểm sau.";
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting assignment:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.";

    const isDuplicateError = errorMessage.includes("đã được nộp trước đó");
    const statusCode = isDuplicateError ? 409 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const assignmentId = params.id;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "Missing required query parameter: employeeId" },
        { status: 400 }
      );
    }

    const status = await assignmentResultService.getSubmissionStatus(
      assignmentId,
      employeeId
    );

    if (!status) {
      return NextResponse.json(
        { submitted: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        submitted: true,
        data: status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking submission status:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi kiểm tra trạng thái nộp bài.";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

