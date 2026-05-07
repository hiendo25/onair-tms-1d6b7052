import { useUserOrganization } from "@/modules/organization/store/OrganizationProvider";

export function useOrganizationId() {
  const organizationId = useUserOrganization((state) => state.currentOrganization.orgId);

  return {
    organizationId,
    isLoading: false,
    error: null,
  };
}
