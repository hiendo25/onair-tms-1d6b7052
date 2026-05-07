export interface CreateDepartmentDto {
  name: string;
  organization_id: string;
  branch_id?: string | null;
}
