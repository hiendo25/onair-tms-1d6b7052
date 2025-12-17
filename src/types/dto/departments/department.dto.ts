export interface DepartmentDto {
  id: string;
  name: string;
  organization_id: string;
  branch_id: string | null;
  created_at: string;
  branch?: {
    id: string;
    name: string;
  } | null;
}
