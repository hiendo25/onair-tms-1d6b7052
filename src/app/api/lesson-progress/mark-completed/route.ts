/**
 * POST /api/lesson-progress/mark-completed
 *
 * Mark a lesson as completed
 * This immediately persists to database (no caching delay)
 * Supports both cookie-based (web) and token-based (mobile) authentication
 */

import { NextRequest, NextResponse } from "next/server";

import { employeesRepository, organizationsRepository } from "@/repository";
import { authenticateAndGetEmployee } from "@/services/auth/api-auth.helper";
import { generateCertificate } from "@/services/certificates/certificate-generator.service";
import { checkClassRoomCertificateEligibility } from "@/services/certificates/class-room-completion.service";
import { handleLessonCompletion } from "@/services/gamifications/event-handler";
import { markCompleted } from "@/services/lesson-progress/lesson-progress.service";
import type { MarkCompletedRequest } from "@/types/dto/lesson-progress";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user and get employee
    const authResult = await authenticateAndGetEmployee(request);
    if ("error" in authResult) {
      return authResult.error;
    }
    const { employee } = authResult;

    // Parse request body
    const body = await request.json();
    const { lessonId, learningPathId, classRoomId, currentPositionSeconds } =
      body as MarkCompletedRequest;

    // Validate required fields
    if (!lessonId) {
      return NextResponse.json(
        { error: "Missing required field: lessonId" },
        { status: 400 }
      );
    }

    // Validate position if provided
    if (
      currentPositionSeconds !== undefined &&
      currentPositionSeconds < 0
    ) {
      return NextResponse.json(
        { error: "currentPositionSeconds must be non-negative" },
        { status: 400 }
      );
    }

    // Mark lesson as completed
    const result = await markCompleted(employee.id, {
      lessonId,
      learningPathId: learningPathId || null,
      classRoomId: classRoomId || null,
      currentPositionSeconds,
    });

    // Check for class room completion and certificate generation
    // Only for class-room context (not learning path, and classRoomId provided)
    if (!learningPathId && classRoomId) {
      try {
        const eligibleClassRoom = await checkClassRoomCertificateEligibility(employee.id, classRoomId);

        // Generate certificate if class room is fully completed
        if (eligibleClassRoom?.isEligible) {
          // Fetch employee details with profile information
          const employeeDetails = await employeesRepository.getEmployeeById(employee.id);

          if (!employeeDetails) {
            console.error("[Certificate] Employee details not found:", employee.id);
          } else {
            const employeeProfile = employeeDetails.profiles as any;
            const employeeName = employeeProfile?.full_name || "Unknown";

            // Fetch organization details
            const organization = await organizationsRepository.getOrganizationById(employee.organization_id);

            try {
              // Generate certificate
              const certificateId = await generateCertificate({
                employeeId: employee.id,
                employeeName: employeeName,
                classRoomId: eligibleClassRoom.classRoomId!,
                classRoomTitle: eligibleClassRoom.classRoomTitle!,
                certificateTemplateId: eligibleClassRoom.certificateTemplateId!,
                completionDate: new Date(),
                organizationName: organization.name,
              });

              console.log(
                `[Certificate] Successfully generated certificate ${certificateId} for employee ${employee.id} - class room ${eligibleClassRoom.classRoomId}`
              );

              // TODO: Send notification to employee about certificate
            } catch (certError) {
              console.error(
                `[Certificate] Failed to generate certificate for employee ${employee.id}:`,
                certError
              );
            }
          }
        }
      } catch (error) {
        // Log error but don't fail the entire request
        console.error("[Certificate Check] Error checking class room completion:", error);
      }
    }

    // Handle gamification
    // Option 1: Synchronous (wait for result) - Better UX, user sees XP awards immediately
    // Option 2: Asynchronous (background) - Better performance, faster response time
    //
    // Currently using synchronous approach for better user experience
    // If performance becomes an issue, switch to async by uncommenting below

    const gamificationResult = await handleLessonCompletion({
      employeeId: employee.id,
      organizationId: employee.organization_id,
      lessonId,
      learningPathId: learningPathId || null,
    });

    // For async approach (better performance), uncomment this and comment out above:
    // handleLessonCompletion({
    //   employeeId: employee.id,
    //   organizationId: employee.organization_id,
    //   lessonId,
    //   learningPathId: learningPathId || null,
    // }).catch((error) => {
    //   console.error("[Gamification] Error processing XP awards:", error);
    // });

    // Return result with gamification info
    return NextResponse.json(
      {
        ...result,
        gamification: {
          xpAwarded: gamificationResult.xpAwarded,
          awards: gamificationResult.awards,
        },
        // For async: { processing: true, message: "XP awards are being processed" }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] Error marking lesson as completed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark lesson as completed",
      },
      { status: 500 }
    );
  }
}
