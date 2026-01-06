import { useTMutation } from "@/lib";
import { client } from "@/services/api";
const useUpdateOrganizationMutation = () => {
  return useTMutation({
    mutationFn: async (organizationId: string) => {
      client.post("organization/switch", { organizationId });
    },
  });
};
export { useUpdateOrganizationMutation };
