import { EmployeeImportData, InvalidEmployeeRecord } from "./employee-import.dto";

export class ValidateEmployeeFileDto {
  file!: File;
}

export class ValidateEmployeeFileResultDto {
  totalCount!: number;
  validCount!: number;
  invalidCount!: number;
  validRecords!: EmployeeImportData[];
  invalidRecords!: InvalidEmployeeRecord[];
}

