import { employeesRepository } from "@/repository";
import { DeleteUserDto, DeleteUserDtoResponse } from "@/types/dto/auth/delete-user.dto";
import { DomainError } from "../DomainError";
import { createServiceRoleClient } from "../supabase/service-role-client";

export class DeleteUserService {
  async execute(dto: DeleteUserDto): Promise<DeleteUserDtoResponse> {
    const { userId, employeeId } = dto;
    const supabaseAdmin = await createServiceRoleClient();

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.admin.deleteUser(userId, true);

    if (error) {
      throw new Error(error.message);
    }

    if (!user) {
      throw new DomainError("Delete user failure", "DELETE_USER_FAILED", 300);
    }

    const { data: deActiveEmployee, error: errorDeActiveEmployee } = await employeesRepository.updateStatus(
      employeeId,
      "inactive",
    );

    if (errorDeActiveEmployee) {
      throw new Error(errorDeActiveEmployee.message);
    }

    return {
      employeeCode: deActiveEmployee.employee_code,
      employeeId: deActiveEmployee.id,
      userId: deActiveEmployee.user_id,
      profile: {
        fullName: deActiveEmployee.profiles?.full_name || "",
        email: deActiveEmployee.profiles?.email || "",
      },
    };
  }
}
