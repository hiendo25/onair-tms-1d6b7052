import { useTMutation } from "@/lib";
import { employeesRepository } from "@/repository";
import { UserOrganizationService } from "@/services/organization/user-organization.service";

import { useUserOrganization } from "./useUserOrganization";
export const useUpdateMainEmployeeOrganization = () => {
  const userOrganization = useUserOrganization((state) => state.data);
  return useTMutation({
    mutationFn: async (payload: { employeeId: string; nextOrganizationId: string }) => {
      const userOrganizationService = new UserOrganizationService(userOrganization.userId);
      const newEmployeeUpdate = userOrganizationService.updateMainEmployeeOrganization({
        employeeId: payload.employeeId,
        nextOrganizationId: payload.nextOrganizationId,
      });
      return newEmployeeUpdate;
    },
  });
};
