import * as XLSX from "xlsx";

import { DomainError } from "@/lib/errors/DomainError";
import { EmployeeType } from "@/model/employee.model";
import { Gender } from "@/model/profile.model";
import { employeesRepository, organizationsRepository } from "@/repository";

import { EmployeeHeaderRowKey, EmployeeParseItem, EmployeeParseItemWithValidate } from "./employee.dto";
import { ImportEmployeeValidation } from "./validation";
type FileExtension = "csv" | "xlsx" | "xls";

export class ImportEmployeeService {
  private authorId: string;
  private organizationId: string;
  private maxFileSize = 4; //mb

  private allowedExtensions: FileExtension[] = ["csv", "xlsx", "xls"];

  private rowsHeaderAllow: EmployeeHeaderRowKey[] = [
    "code",
    "fullName",
    "email",
    "phoneNumber",
    "gender",
    "dateOfBirth",
    "startDate",
    "employeeType",
  ];

  constructor(authorId: string, organizationId: string) {
    this.authorId = authorId;
    this.organizationId = organizationId;
  }

  async readFile(file: File) {
    const fileExtension = this.validateFileType(file);

    this.validateFileSize(file);

    const parsedData =
      fileExtension === "csv"
        ? this.parseCSVOnServer(await file.text())
        : await this.parseXLSXOnServer(await file.arrayBuffer());

    return this.mapParsedDataToEmployeeResult(parsedData);
  }

  async readFileWithValidation(file: File): Promise<EmployeeParseItemWithValidate[]> {
    return await this.validateParsedData(await this.readFile(file));
  }

  private mapParsedDataToEmployeeResult(data: Record<EmployeeHeaderRowKey, string>[]) {
    return data.map<EmployeeParseItem>((item, index) => ({
      index,
      code: item.code,
      dateOfBirth: item.dateOfBirth,
      email: item.email,
      employeeType: item.employeeType as EmployeeType,
      fullName: item.fullName,
      gender: item.gender as Gender,
      phoneNumber: item.phoneNumber,
      startDate: item.startDate,
    }));
  }

  private validateFileType(file: File) {
    const fileName = file.name.toLowerCase();
    const ext = fileName.split(".").pop() as FileExtension | undefined;

    if (!ext || !this.allowedExtensions.includes(ext)) {
      throw new DomainError(
        "Định dạng file không được hỗ trợ. Vui lòng tải lên file CSV hoặc XLSX",
        "FILE_INVALID",
        400,
      );
    }
    return ext;
  }

  private validateFileSize(file: File) {
    const maxSize = this.maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      throw new DomainError(`File quá lớn. Kích thước tối đa là ${this.maxFileSize}`, "FILE_SIZE_LARGE", 400);
    }
    return file.size;
  }

  private parseCSVOnServer(text: string): Record<EmployeeHeaderRowKey, string>[] {
    const lines = text.split("\n").filter((line) => line.trim());
    const headerLine = lines[0];

    if (!lines.length || !headerLine) {
      throw new DomainError("File CSV trống.", "EMPTY_LINE_CSV", 400);
    }

    const rawHeaders = headerLine.split(",").map((h) => h.trim());

    this.validateTemplateHeader(rawHeaders);

    const data: Record<EmployeeHeaderRowKey, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]?.split(",");
      const row: Record<EmployeeHeaderRowKey, string> = {} as Record<EmployeeHeaderRowKey, string>;

      this.rowsHeaderAllow.forEach((fieldKey, index) => {
        row[fieldKey] = values?.[index]?.trim() || "";
      });

      data.push(row);
    }
    return data;
  }

  private async parseXLSXOnServer(buffer: ArrayBuffer): Promise<Record<EmployeeHeaderRowKey, string>[]> {
    const workbook = XLSX.read(buffer, { type: "array" });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new DomainError("File Excel không chứa sheet nào", "EMPTY_SHEET", 400);
    }

    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new DomainError("WorkSheet đang trống.", "EMPTY_WORK_SHEET", 400);
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      blankrows: false,
      rawNumbers: false,
    }) as any[][];

    if (!jsonData.length) {
      throw new DomainError("Row WorkSheet đang trống.", "EMPTY_ROW_WORK_SHEET", 400);
    }

    const rawHeaders = jsonData[0] as string[];

    this.validateTemplateHeader(rawHeaders);

    const data: Record<EmployeeHeaderRowKey, string>[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const values = jsonData[i];
      const row: Record<EmployeeHeaderRowKey, string> = {} as Record<EmployeeHeaderRowKey, string>;

      this.rowsHeaderAllow.forEach((fieldKey, index) => {
        const value = values?.[index];
        row[fieldKey] = value != null ? String(value).trim() : "";
      });

      data.push(row);
    }

    return data;
  }

  private async validateParsedData(employees: EmployeeParseItem[]): Promise<EmployeeParseItemWithValidate[]> {
    const recordsWithValidations: EmployeeParseItemWithValidate[] = [];

    const codeList: string[] = [];
    const emailList: string[] = [];

    const organizationCode = await this.getOrganizationCode(this.organizationId);

    employees.forEach((employee) => {
      const rowSafeParse = ImportEmployeeValidation.safeParse(employee);

      const errorMap = new Map<string, { path: string; message: string }>();

      rowSafeParse.error?.issues.forEach((item) => {
        const path = item.path[0] as string | undefined;

        if (!path || errorMap.has(path)) return;

        errorMap.set(path, {
          path: path as string,
          message: item.message,
        });
      });
      const errors = errorMap.size > 0 ? [...errorMap.values()] : undefined;
      codeList.push(`${organizationCode ?? ""}${employee.code}`);
      emailList.push(employee.email);
      recordsWithValidations.push({ ...employee, errors, existedCode: false, existedEmail: false });
    });

    this.applyDuplicateFieldErrors(recordsWithValidations, this.collectDuplicateFieldsValue(employees, "email"));
    this.applyDuplicateFieldErrors(recordsWithValidations, this.collectDuplicateFieldsValue(employees, "code"));

    console.log(codeList);
    /**
     * Check email exist
     */

    const [emailsCheck, codesCheck] = await Promise.all([
      this.getEmployeesByEmails(emailList),
      this.getEmployeeByCodes(codeList),
    ]);

    const codesMap = new Map(codesCheck.map((item) => [item.employee_code, item]));
    const mailsMap = new Map(emailsCheck.map((item) => [item.profiles.email, item]));

    return recordsWithValidations.map((record) => ({
      ...record,
      existedCode: codesMap.has(record.code),
      existedEmail: mailsMap.has(record.email),
    }));
  }

  private async getEmployeesByEmails(emails: string[]) {
    return await employeesRepository.getEmployeesByEmailsAndOrganizationId(emails, this.organizationId);
  }

  private async getEmployeeByCodes(codes: string[]) {
    return await employeesRepository.getEmployeesByCodes(codes);
  }

  private collectDuplicateFieldsValue<K extends keyof EmployeeParseItem>(
    data: EmployeeParseItem[],
    field: K,
  ): Array<{ value: string; rows: number[]; field: K }> {
    const fieldMap = new Map<string, number[]>();

    data.forEach((row) => {
      const rawFieldValue = row[field];

      if (!rawFieldValue) return;

      const normalizedValue = String(rawFieldValue).trim().toLowerCase();

      const rows = fieldMap.get(normalizedValue) || [];
      rows.push(row.index);
      fieldMap.set(normalizedValue, rows);
    });

    return [...fieldMap.entries()]
      .filter(([, rows]) => rows.length > 1)
      .map(([value, rows]) => ({
        value,
        rows,
        field,
      }));
  }

  private applyDuplicateFieldErrors<K extends keyof EmployeeParseItem>(
    records: EmployeeParseItemWithValidate[],
    duplicates: { value: string; rows: number[]; field: K }[],
  ) {
    const duplicateRowIndex = new Map<number, K>();

    duplicates.forEach(({ value, rows, field }) => {
      rows.forEach((rowIndex) => {
        duplicateRowIndex.set(rowIndex, field);
      });
    });

    records.forEach((record) => {
      const duplicateField = duplicateRowIndex.get(record.index);
      if (duplicateField) {
        record.errors?.push({
          path: duplicateField,
          message: `${duplicateField} bị trùng.`,
        });
      }
    });
  }

  private validateTemplateHeader(headers: string[]) {
    if (headers.length !== this.rowsHeaderAllow.length) {
      throw new DomainError(
        `Templat không hợp lệ columns: ${this.rowsHeaderAllow.join(", ")}`,
        "TEMPLATE_IN_VALID",
        400,
      );
    }

    const columnsMissing: string[] = [];

    this.rowsHeaderAllow.forEach((col) => {
      if (!headers.includes(col)) {
        columnsMissing.push(col);
      }
    });
    if (columnsMissing.length) {
      throw new DomainError(`Missing columns: ${columnsMissing.join(", ")}`, "TEMPLATE_MISSING_COLUMNS", 400);
    }
  }

  private async getOrganizationCode(organizationId: string) {
    const organization = await organizationsRepository.getOrganizationById(organizationId);

    return organization.code;
  }
}
