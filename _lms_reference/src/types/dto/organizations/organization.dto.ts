export class OrganizationDto {
  id!: string;
  name!: string;
  subdomain!: string;
  logo!: string;
  is_active!: boolean;
  employee_limit!: number | null;
  created_at!: string;
  code!: string | null;
}
