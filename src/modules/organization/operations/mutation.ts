import { useTMutation } from "@/lib";

const useUpdateOrganizationMutation = () => {
  return useTMutation({
    mutationFn: async (organizationId: string) => {
      try {
        return await fetch("/api/organization", {
          method: "POST",
          body: JSON.stringify({ organizationId }),
        });
      } catch (err) {
        console.log(err);
      }
    },
  });
};
export { useUpdateOrganizationMutation };
