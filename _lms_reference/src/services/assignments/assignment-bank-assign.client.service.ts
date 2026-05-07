import { employeesRepository } from "@/repository";
import { createClient } from "@/services";
import type { AssignAssignmentBankDto } from "@/types/dto/assignment-bank";

import { assignAssignmentBankToEmployees } from "./assignment-bank-assign.service";

const assignAssignmentBankToEmployeesClient = async (payload: AssignAssignmentBankDto) => {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Bạn cần đăng nhập để thực hiện thao tác này");
  }

  const employee = await employeesRepository.getOneEmployee({
    userId: user.id,
    organizationId: payload.organizationId,
  });

  if (!employee?.id) {
    throw new Error("Không tìm thấy nhân viên");
  }

  return assignAssignmentBankToEmployees(payload, employee.id, supabase);
};

export { assignAssignmentBankToEmployeesClient };
