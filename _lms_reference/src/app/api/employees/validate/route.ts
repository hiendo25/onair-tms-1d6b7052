import { NextRequest, NextResponse } from "next/server";

import { http } from "@/lib/api/http-status";
import { requireAuth } from "@/lib/auth/require-auth";
import { DomainError } from "@/lib/errors/DomainError";
import { employeeFileService } from "@/services";
import { ImportEmployeeService } from "@/services/employees/import-employee.service";
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // const result = await employeeFileService.validateEmployeeFile(file);
    const data = await new ImportEmployeeService(auth.employeeId, auth.organizationId).readFileWithValidation(file);

    // console.log("data from server", data);
    return http.ok(data);
  } catch (error) {
    console.error("Error validating employee file:", error);
    if (error instanceof DomainError) {
      return http.fromDomainError(error);
    }

    return http.serverError("Có lỗi xảy ra khi xác thực file");
  }
}
