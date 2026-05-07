export interface DepartmentImportRow {
  name: string;
}

export interface ImportDepartmentsDto {
  departments: DepartmentImportRow[];
  organizationId: string;
}

export interface DepartmentImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}
