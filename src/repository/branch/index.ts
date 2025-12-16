import { createClient } from "@/services/supabase/client";
import type { BranchDto, CreateBranchDto, GetBranchesParams, UpdateBranchDto } from "@/types/dto/branches";
import type { PaginatedResult } from "@/types/dto/pagination.dto";

export const branchRepository = {
  /**
   * Get list of branches with optional filters and pagination
   */
  async getList(
    params?: GetBranchesParams
  ): Promise<PaginatedResult<BranchDto>> {
    const { page = 0, limit = 10, search, organizationId } = params || {};
    const supabase = createClient();
    let query = supabase
      .from("branches")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply organization filter
    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    // Apply search filter (name, case-insensitive, accent-sensitive)
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
      data: (data || []).map(item => ({ ...item })) as BranchDto[],
      total: count ?? 0,
      page,
      limit,
    };
  },

  /**
   * Get a single branch by ID
   */
  async getById(id: string): Promise<BranchDto> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    // Return plain object to avoid Next.js serialization issues
    return { ...data } as BranchDto;
  },

  /**
   * Create a new branch
   */
  async create(branch: CreateBranchDto): Promise<BranchDto> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("branches")
      .insert(branch)
      .select()
      .single();

    if (error) throw error;
    // Return plain object to avoid Next.js serialization issues
    return { ...data } as BranchDto;
  },

  /**
   * Update an existing branch
   */
  async update(payload: UpdateBranchDto): Promise<BranchDto> {
    const supabase = createClient();
    const { id, ...updateData } = payload;
    const { data, error } = await supabase
      .from("branches")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as BranchDto;
  },

  /**
   * Delete a branch (only if no departments belong to it)
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();

    // Check if branch has any departments referencing it
    const { data: departments, error: checkError } = await supabase
      .from("departments")
      .select("id")
      .eq("branch_id", id)
      .limit(1);

    if (checkError) throw checkError;

    if (departments && departments.length > 0) {
      throw new Error(
        "Không thể xóa chi nhánh có phòng ban"
      );
    }

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Check if branch name already exists
   */
  async checkNameExists(
    name: string,
    organizationId: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = createClient();
    let query = supabase
      .from("branches")
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
   * Check if branch code already exists
   */
  async checkCodeExists(
    code: string,
    organizationId: string,
    excludeId?: string
  ): Promise<boolean> {
    const supabase = createClient();
    let query = supabase
      .from("branches")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("code", code);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) throw error;
    return data && data.length > 0;
  },

  /**
   * Generate next branch code (CN001, CN002, etc.)
   */
  async generateNextBranchCode(organizationId: string): Promise<string> {
    const supabase = createClient();
    
    // Get all branch codes for this organization
    const { data, error } = await supabase
      .from("branches")
      .select("code")
      .eq("organization_id", organizationId)
      .like("code", "CN%");

    if (error) throw error;

    // Extract numeric parts and find the max
    let maxNumber = 0;
    if (data && data.length > 0) {
      data.forEach((item) => {
        const match = item.code.match(/^CN(\d+)$/);
        if (match && match?.[1]) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      });
    }

    // Generate next code
    const nextNumber = maxNumber + 1;
    return `CN${nextNumber.toString().padStart(3, "0")}`;
  },

  /**
   * Bulk import branches
   */
  async bulkImport(branches: CreateBranchDto[]): Promise<BranchDto[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("branches")
      .insert(branches)
      .select();

    if (error) throw error;
    return data as BranchDto[];
  },
};
