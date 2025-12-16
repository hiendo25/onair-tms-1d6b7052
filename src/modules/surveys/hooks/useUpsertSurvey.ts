import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { EnumSurveyType } from "@/model/survey";
import { useUserOrganization } from "@/modules/organization";
import { serveyService } from "@/services";
import { UpsertSurveyFormData } from "../survey-form.schema";
const useUpsertSurvey = () => {
  const userOrganization = useUserOrganization((state) => state.data);
  const upsertSurvey = new serveyService.UpsertSurvey(userOrganization.organization.id, userOrganization.id);

  const queryClient = useQueryClient();
  const { mutate: createSurvey, isPending: isPendingCreate } = useTMutation({
    mutationFn: async (variables: { type: EnumSurveyType; formData: UpsertSurveyFormData }) => {
      console.log("createeeee");
      return await upsertSurvey.createSurvey(variables);
    },
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SURVEYS] });
    },
  });

  const { mutate: updateSurvey, isPending: isPendingUpdate } = useTMutation({
    mutationFn: async (variables: { surveyId: string; formData: UpsertSurveyFormData }) => {
      console.log("calllllll");
      const { surveyId, formData } = variables;
      return await upsertSurvey.updateSurvey(surveyId, formData);
    },
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SURVEYS] });
    },
  });
  return {
    create: createSurvey,
    update: updateSurvey,
    isLoading: isPendingCreate || isPendingUpdate,
  };
};
export { useUpsertSurvey };
