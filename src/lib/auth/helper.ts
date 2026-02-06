import { createSVClient } from "@/services";

export class OrganizationAuthHelper {
  static async createSvClient() {
    return await createSVClient();
  }

  static async getCurrentUser() {
    const supabaseSV = await this.createSvClient();

    const {
      data: { user },
    } = await supabaseSV.auth.getUser();

    return user;
  }

  static async getEmployee(userId: string, organizationId: string) {
    const supabaseSV = await this.createSvClient();

    const { data: employee, error } = await supabaseSV
      .from("employees")
      .select("*")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) {
      throw new Error(error.details);
    }
    return employee;
  }
}
