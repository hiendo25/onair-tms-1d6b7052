import { employeesRepository } from "@/repository";
import { DeleteUserDto, DeleteUserDtoResponse } from "@/types/dto/auth/delete-user.dto";
import { createServiceRoleClient } from "../supabase/service-role-client";

export class DeleteUserService {
  async execute(dto: DeleteUserDto): Promise<DeleteUserDtoResponse> {
    const { userId, employeeId } = dto;
    const supabaseAdmin = await createServiceRoleClient();

    const { data: dataEmployee, error: errorDeActiveEmployee } = await employeesRepository.updateStatus(
      employeeId,
      "inactive",
    );

    if (errorDeActiveEmployee) {
      throw new Error(errorDeActiveEmployee.message);
    }

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.deleteUser(userId, true);

    if (error) {
      throw new Error(error.message);
    }

    return {
      employeeCode: dataEmployee.employee_code,
      employeeId: dataEmployee.id,
      userId: dataEmployee.user_id,
      profile: {
        fullName: dataEmployee.profiles?.full_name || "",
        email: dataEmployee.profiles?.email || "",
      },
    };
  }
}
