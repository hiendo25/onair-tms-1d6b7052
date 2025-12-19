import { createClient } from "@/services/supabase/client";
import type { BranchDto } from "@/types/dto/branches";
import type { CreateDepartmentDto, DepartmentDto, GetDepartmentsParams, UpdateDepartmentDto } from "@/types/dto/departments";
import type { PaginatedResult } from "@/types/dto/pagination.dto";

export const departmentRepository = {
  /**
   * Get list of departments with optional filters and pagination
   */
  async getList(
    params?: GetDepartmentsParams
  ): Promise<PaginatedResult<DepartmentDto>> {
    const { page = 0, limit = 10, search, organizationId, branchId } = params || {};
    const supabase = createClient();
    let query = supabase
      .from("departments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply organization filter
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    // Apply branch filter
    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    // Apply search filter (name, case-insensitive)
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // Return plain objects to avoid Next.js serialization issues
    return {
      data: (data || []).map(item => ({ ...item })) as DepartmentDto[],
      total: count ?? 0,
      page,
      limit,
    };
  },

  /**
   * Get a single department by ID
   */
  async getById(id: string): Promise<DepartmentDto> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    // Return plain object to avoid Next.js serialization issues
    return { ...data } as DepartmentDto;
  },

  /**
   * Create a new department
   */
  async create(department: CreateDepartmentDto): Promise<DepartmentDto> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("departments")
      .insert(department)
      .select()
      .single();

    if (error) throw error;
    // Return plain object to avoid Next.js serialization issues
    return { ...data } as DepartmentDto;
  },

  /**
   * Update an existing department
   */
  async update(payload: UpdateDepartmentDto): Promise<DepartmentDto> {
    const supabase = createClient();
    const { id, ...updateData } = payload;
    const { data, error } = await supabase
      .from("departments")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as DepartmentDto;
  },

  /**
   * Delete a department (only if no employees belong to it)
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();

    // Check if department has any employees
    const { data: employeeDepartments, error: checkError } = await supabase
      .from("employee_departments")
      .select("id")
      .eq("department_id", id)
      .limit(1);

    if (checkError) throw checkError;

    if (employeeDepartments && employeeDepartments.length > 0) {
      throw new Error(
        "Không thể xóa phòng ban có nhân viên"
      );
    }

    const { error } = await supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Check if department name already exists in the organization
   */
  async checkNameExists(
    name: string,
    organizationId: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = createClient();
    let query = supabase
      .from("departments")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("name", name);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) throw error;
    return data && data.length > 0;
  },

  /**
   * Get branches for department dropdown
   */
  async getBranches(organizationId: string): Promise<BranchDto[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("organization_id", organizationId)
      .order("name", { ascending: true });

    if (error) throw error;
    // Return plain objects to avoid Next.js serialization issues
    return (data || []).map(item => ({ ...item })) as BranchDto[];
  },

  /**
   * Bulk import departments
   */
  async bulkImport(departments: CreateDepartmentDto[]): Promise<DepartmentDto[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("departments")
      .insert(departments)
      .select();

    if (error) throw error;
    return data as DepartmentDto[];
  },
};
