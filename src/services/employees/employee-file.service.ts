import { createServiceRoleClient } from "@/services/supabase/service-role-client";
import { createSVClient } from "@/services/supabase/server";
import type { Database } from "@/types/supabase.types";
import type {
  CreateEmployeeDto,
  EmployeeImportData,
  ImportEmployeesResultDto,
  ValidateEmployeeFileResultDto,
} from "@/types/dto/employees";
import { EmployeeFormSchema } from "@/modules/employees/components/EmployeeForm/schema";
import {
  employeesRepository,
  organizationUnitsRepository,
  profilesRepository,
} from "@/repository";
import { getOrganizationUnitsByOrganizationId } from "@/repository/organization-units";
import { createEmployeeCore } from "./employee.service";

interface ValidationResult {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  validRecords: EmployeeImportData[];
  invalidRecords: Array<{
    row: number;
    data: any;
    errors: string[];
    fieldErrors: Record<string, string>;
  }>;
}

function normalizeHeader(header: string): string {
  return header.replace("*", "").trim();
}

function mapHeaderToFieldKey(headerName: string): string {
  const mapping: Record<string, string> = {
    "Mã nhân viên": "employee_code",
    "Họ và tên": "full_name",
    "Họ tên": "full_name",
    "Email": "email",
    "Số điện thoại": "phone_number",
    "Giới tính": "gender",
    "Ngày sinh": "birthday",
    "Phòng ban": "department",
    "Chi nhánh": "branch",
    "Ngày bắt đầu": "start_date",
    "Chức vụ": "position",
    "Người quản lý": "manager",
    "Vai trò": "employee_type",
  };

  return mapping[headerName] || headerName.toLowerCase().replace(/\s+/g, "_");
}

function isRowEmpty(row: any): boolean {
  const values = Object.values(row);

  return values.every(value => {
    if (value === null || value === undefined) {
      return true;
    }
    const stringValue = String(value).trim();
    return stringValue === "";
  });
}

function parseCSVOnServer(text: string): any[] {
  const lines = text.split("\n").filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error("File CSV rỗng");
  }

  const rawHeaders = lines[0].split(",").map(h => h.trim());
  const normalizedHeaders = rawHeaders.map(normalizeHeader);
  const fieldKeys = normalizedHeaders.map(mapHeaderToFieldKey);

  console.log("CSV Headers:", {
    raw: rawHeaders,
    normalized: normalizedHeaders,
    fieldKeys: fieldKeys,
  });

  const data: any[] = [];
  let emptyRowCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",");
    const row: any = {};

    fieldKeys.forEach((fieldKey, index) => {
      row[fieldKey] = values[index]?.trim() || "";
    });

    if (isRowEmpty(row)) {
      emptyRowCount++;
      continue;
    }

    data.push(row);
  }

  console.log(`CSV parsing complete: ${data.length} data rows, ${emptyRowCount} empty rows skipped`);

  return data;
}

async function parseXLSXOnServer(buffer: ArrayBuffer): Promise<any[]> {
  try {
    const XLSX = await import("xlsx");

    const workbook = XLSX.read(buffer, { type: "array" });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("File Excel không chứa sheet nào");
    }

    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, rawNumbers: false }) as any[][];

    if (jsonData.length === 0) {
      throw new Error("File Excel rỗng");
    }

    const rawHeaders = jsonData[0] as string[];
    const normalizedHeaders = rawHeaders.map(normalizeHeader);
    const fieldKeys = normalizedHeaders.map(mapHeaderToFieldKey);

    console.log("Excel Headers:", {
      raw: rawHeaders,
      normalized: normalizedHeaders,
      fieldKeys: fieldKeys,
    });

    const data: any[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const values = jsonData[i];
      const row: any = {};

      fieldKeys.forEach((fieldKey, index) => {
        const value = values[index];
        row[fieldKey] = value !== undefined && value !== null ? String(value).trim() : "";
      });

      data.push(row);
    }

    console.log(`Excel parsing complete: ${data.length} data rows`);

    return data;
  } catch (error) {
    console.error("Error parsing XLSX:", error);
    throw error;
  }
}

const EmployeeImportSchema = EmployeeFormSchema.partial({
  manager_id: true,
  position_id: true,
  employee_code: true,
  branch: true,
  phone_number: true,
  birthday: true,
  start_date: true,
}).required({
  email: true,
  full_name: true,
  gender: true,
  department: true,
  employee_type: true,
});

function validateParsedData(data: any[]): ValidationResult {
  const validRecords: EmployeeImportData[] = [];
  const invalidRecords: Array<{ row: number; data: any; errors: string[]; fieldErrors: Record<string, string> }> = [];

  const employeeCodes = new Set<string>();

  console.log("Total rows to validate:", data.length);

  data.forEach((row, index) => {
    const errors: string[] = [];
    const fieldErrors: Record<string, string> = {};
    const rowNumber = index + 2;

    if (index < 3) {
      console.log(`Row ${rowNumber} data:`, row);
      console.log(`Row ${rowNumber} keys:`, Object.keys(row));
    }

    const recordToValidate = {
      email: row.email,
      full_name: row.full_name,
      phone_number: row.phone_number,
      gender: row.gender ? String(row.gender).toLowerCase() : undefined,
      birthday: row.birthday || null,
      branch: row.branch,
      department: row.department,
      employee_code: row.employee_code,
      start_date: row.start_date,
      manager_id: undefined,
      employee_type: row.employee_type,
      position_id: undefined,
    };

    const validationResult = EmployeeImportSchema.safeParse(recordToValidate);

    if (!validationResult.success) {
      const zodErrors = validationResult.error.issues;

      zodErrors.forEach((error) => {
        const field = error.path.join(".");
        const message = error.message;

        fieldErrors[field] = message;
        errors.push(`${field}: ${message}`);
      });

      if (index < 3) {
        console.log(`Row ${rowNumber}: Zod validation FAILED -`, errors);
        console.log(`Row ${rowNumber}: Field Errors:`, fieldErrors);
      }
    }

    if (row.employee_code) {
      const code = String(row.employee_code).trim();
      if (employeeCodes.has(code)) {
        const errorMsg = `Mã nhân viên trùng lặp: ${code}`;
        errors.push(errorMsg);
        fieldErrors["employee_code"] = errorMsg;
      } else {
        employeeCodes.add(code);
      }
    }

    if (errors.length > 0) {
      invalidRecords.push({ row: rowNumber, data: row, errors, fieldErrors });
      if (index < 3) {
        console.log(`Row ${rowNumber}: INVALID - Errors:`, errors);
        console.log(`Row ${rowNumber}: Field Errors:`, fieldErrors);
      }
    } else {
      const validRecord: EmployeeImportData = {
        employee_code: row.employee_code ? String(row.employee_code).trim() : "",
        full_name: String(row.full_name).trim(),
        email: String(row.email).trim().toLowerCase(),
        phone_number: row.phone_number ? String(row.phone_number).trim() : undefined,
        gender: (row.gender ? String(row.gender).toLowerCase() : "male") as Database["public"]["Enums"]["gender"],
        birthday: row.birthday ? String(row.birthday).trim() : undefined,
        department: String(row.department).trim(),
        branch: row.branch ? String(row.branch).trim() : undefined,
        start_date: row.start_date ? String(row.start_date).trim() : undefined,
        employee_type: String(row.employee_type).toLowerCase() as Database["public"]["Enums"]["employee_type"],
      };
      validRecords.push(validRecord);
      if (index < 3) {
        console.log(`Row ${rowNumber}: VALID`);
      }
    }
  });

  console.log("Summary:", {
    total: data.length,
    valid: validRecords.length,
    invalid: invalidRecords.length,
  });

  return {
    totalCount: data.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    validRecords,
    invalidRecords,
  };
}

async function validateAgainstDatabase(
  validRecords: EmployeeImportData[],
  organizationId: string,
): Promise<{
  invalidRecords: Array<{ row: number; data: any; errors: string[]; fieldErrors: Record<string, string> }>;
  departmentNameToIdMap: Map<string, string>;
  branchNameToIdMap: Map<string, string>;
}> {
  const invalidRecords: Array<{ row: number; data: any; errors: string[]; fieldErrors: Record<string, string> }> = [];
  const departmentNameToIdMap = new Map<string, string>();
  const branchNameToIdMap = new Map<string, string>();

  if (validRecords.length === 0) {
    return { invalidRecords, departmentNameToIdMap, branchNameToIdMap };
  }

  try {
    const employeeCodes = validRecords.map(r => r.employee_code);
    const emails = validRecords.map(r => r.email);
    const departmentNames = [...new Set(validRecords.map(r => r.department).filter(Boolean))];
    const branchNames = [...new Set(validRecords.map(r => r.branch).filter(Boolean))];

    console.log("Checking database for:", {
      employeeCodes: employeeCodes.length,
      emails: emails.length,
      departmentNames: departmentNames.length,
      branchNames: branchNames.length,
    });

    const existingEmployees = await employeesRepository.findEmployeesByEmployeeCodes(employeeCodes);
    const existingEmployeeCodes = new Set(
      existingEmployees.map(e => e.employee_code),
    );
    console.log("Existing employee codes found:", existingEmployeeCodes.size);

    const existingProfiles = await profilesRepository.findProfilesByEmails(emails);
    const existingEmails = new Set(
      existingProfiles.map(p => p.email),
    );
    console.log("Existing emails found:", existingEmails.size);

    if (departmentNames.length > 0 || branchNames.length > 0) {
      try {
        const orgUnits = await getOrganizationUnitsByOrganizationId(organizationId);

        orgUnits.forEach(unit => {
          if (unit.type === "department") {
            departmentNameToIdMap.set(unit.name, unit.id);
          } else if (unit.type === "branch") {
            branchNameToIdMap.set(unit.name, unit.id);
          }
        });

        console.log("Organization units loaded:", {
          departments: departmentNameToIdMap.size,
          branches: branchNameToIdMap.size,
        });
      } catch (error) {
        console.error("Error checking organization units:", error);
        throw new Error("Không thể tải danh sách phòng ban và chi nhánh");
      }
    }

    validRecords.forEach((record, index) => {
      const errors: string[] = [];
      const fieldErrors: Record<string, string> = {};
      const rowNumber = index + 2;

      if (existingEmployeeCodes.has(record.employee_code)) {
        const errorMsg = `Mã nhân viên đã tồn tại trong hệ thống: ${record.employee_code}`;
        errors.push(errorMsg);
        fieldErrors["employee_code"] = errorMsg;
      }

      if (existingEmails.has(record.email)) {
        const errorMsg = `Email đã được sử dụng: ${record.email}`;
        errors.push(errorMsg);
        fieldErrors["email"] = errorMsg;
      }

      if (record.department) {
        if (!departmentNameToIdMap.has(record.department)) {
          const errorMsg = `Phòng ban không tồn tại trong tổ chức: ${record.department}`;
          errors.push(errorMsg);
          fieldErrors["department"] = errorMsg;
        }
      }

      if (record.branch) {
        if (!branchNameToIdMap.has(record.branch)) {
          const errorMsg = `Chi nhánh không tồn tại trong tổ chức: ${record.branch}`;
          errors.push(errorMsg);
          fieldErrors["branch"] = errorMsg;
        }
      }

      if (errors.length > 0) {
        invalidRecords.push({ row: rowNumber, data: record, errors, fieldErrors });
        if (index < 3) {
          console.log(`Row ${rowNumber}: Database validation FAILED -`, errors);
          console.log(`Row ${rowNumber}: Field Errors:`, fieldErrors);
        }
      }
    });

    console.log("Database validation complete:", {
      checked: validRecords.length,
      invalid: invalidRecords.length,
    });

    return { invalidRecords, departmentNameToIdMap, branchNameToIdMap };
  } catch (error) {
    console.error("Database validation error:", error);
    throw error;
  }
}

function mergeValidationResults(
  formatValidation: ValidationResult,
  databaseValidation: {
    invalidRecords: Array<{ row: number; data: any; errors: string[]; fieldErrors: Record<string, string> }>
  },
): ValidationResult {
  const allInvalidRecords = [...formatValidation.invalidRecords];

  databaseValidation.invalidRecords.forEach(dbInvalid => {
    allInvalidRecords.push(dbInvalid);
  });

  const dbInvalidRowNumbers = new Set(
    databaseValidation.invalidRecords.map(r => r.row),
  );

  const finalValidRecords = formatValidation.validRecords.filter((_, index) => {
    const rowNumber = index + 2;
    return !dbInvalidRowNumbers.has(rowNumber);
  });

  return {
    totalCount: formatValidation.totalCount,
    validCount: finalValidRecords.length,
    invalidCount: allInvalidRecords.length,
    validRecords: finalValidRecords,
    invalidRecords: allInvalidRecords,
  };
}

async function validateEmployeeFile(file: File): Promise<ValidateEmployeeFileResultDto> {
  const fileName = file.name.toLowerCase();
  const isCSV = fileName.endsWith(".csv");
  const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  if (!isCSV && !isXLSX) {
    throw new Error("Định dạng file không được hỗ trợ. Vui lòng tải lên file CSV hoặc XLSX");
  }

  const maxSize = 4 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File quá lớn. Kích thước tối đa là 4MB");
  }

  let parsedData: any[];

  if (isCSV) {
    const text = await file.text();
    parsedData = parseCSVOnServer(text);
  } else {
    const buffer = await file.arrayBuffer();
    parsedData = await parseXLSXOnServer(buffer);
  }

  if (!parsedData || parsedData.length === 0) {
    throw new Error("File không chứa dữ liệu hoặc định dạng không đúng");
  }

  const supabase = await createSVClient();
  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !currentUser) {
    throw new Error(`Failed to get current user: ${userError?.message || "User not authenticated"}`);
  }

  const organizationId = await employeesRepository.getEmployeeOrganizationIdByUserId(currentUser.id);

  const formatValidation = validateParsedData(parsedData);
  const databaseValidation = await validateAgainstDatabase(formatValidation.validRecords, organizationId);
  const validationResult = mergeValidationResults(formatValidation, databaseValidation);

  return validationResult;
}

async function importEmployees(file: File): Promise<ImportEmployeesResultDto> {
  const fileName = file.name.toLowerCase();
  const isCSV = fileName.endsWith(".csv");
  const isXLSX = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  if (!isCSV && !isXLSX) {
    throw new Error("Định dạng file không được hỗ trợ. Vui lòng tải lên file CSV hoặc XLSX");
  }

  const maxSize = 4 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File quá lớn. Kích thước tối đa là 4MB");
  }

  let parsedData: any[];

  if (isCSV) {
    const text = await file.text();
    parsedData = parseCSVOnServer(text);
  } else {
    const buffer = await file.arrayBuffer();
    parsedData = await parseXLSXOnServer(buffer);
  }

  if (!parsedData || parsedData.length === 0) {
    throw new Error("File không chứa dữ liệu hoặc định dạng không đúng");
  }

  const supabase = await createSVClient();
  const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

  if (userError || !currentUser) {
    throw new Error(`Failed to get current user: ${userError?.message || "User not authenticated"}`);
  }

  const organizationId = await employeesRepository.getEmployeeOrganizationIdByUserId(currentUser.id);

  const formatValidation = validateParsedData(parsedData);
  const databaseValidation = await validateAgainstDatabase(formatValidation.validRecords, organizationId);
  const validationResult = mergeValidationResults(formatValidation, databaseValidation);

  console.log("Validation result:", {
    totalCount: validationResult.totalCount,
    validCount: validationResult.validCount,
    invalidCount: validationResult.invalidCount,
  });

  if (validationResult.validCount === 0) {
    console.log("No valid records to import");
    return {
      successCount: 0,
      failedCount: 0,
      errors: [],
    };
  }

  if (validationResult.invalidCount > 0) {
    throw new Error(`File chứa ${validationResult.invalidCount} bản ghi không hợp lệ. Vui lòng sửa lỗi trước khi import.`);
  }

  console.log(`Importing employees to organization: ${organizationId}`);

  const records = validationResult.validRecords;
  let successCount = 0;
  let failedCount = 0;
  const errors: Array<{ row: number; employeeCode: string; error: string }> = [];

  console.log(`Starting import of ${records.length} valid records...`);

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2;

    if (!record) {
      console.log(`Skipping empty record at row ${rowNumber}`);
      continue;
    }

    try {
      const departmentId = record.department ? databaseValidation.departmentNameToIdMap.get(record.department) : undefined;
      const branchId = record.branch ? databaseValidation.branchNameToIdMap.get(record.branch) : undefined;

      if (record.department && !departmentId) {
        throw new Error(`Phòng ban không tồn tại: ${record.department}`);
      }

      const employeePayload: CreateEmployeeDto = {
        email: record.email,
        full_name: record.full_name,
        phone_number: record.phone_number,
        gender: record.gender,
        birthday: record.birthday || null,
        department: departmentId || "",
        branch: branchId,
        employee_code: record.employee_code,
        start_date: record.start_date || new Date().toISOString().split('T')[0],
        manager_id: "",
        position_id: undefined,
        employee_type: record.employee_type,
      };

      const result = await createEmployeeCore(employeePayload, organizationId);

      successCount++;
      console.log(`Successfully imported employee ${result.employeeCode} (${successCount}/${records.length})`);
    } catch (error) {
      failedCount++;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      errors.push({
        row: rowNumber,
        employeeCode: record.employee_code,
        error: errorMessage,
      });
      console.error(`Failed to import employee ${record.employee_code}:`, errorMessage);
    }
  }

  console.log("Import complete:", {
    successCount,
    failedCount,
    totalErrors: errors.length,
  });

  return {
    successCount,
    failedCount,
    errors,
  };
}

export {
  validateEmployeeFile,
  importEmployees,
};
