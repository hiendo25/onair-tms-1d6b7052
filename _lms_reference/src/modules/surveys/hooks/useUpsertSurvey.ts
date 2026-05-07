import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { EnumSurveyType } from "@/model/survey";
import { useUserOrganization } from "@/modules/organization";
import { surveyService } from "@/services";
import { UpsertSurveyFormData } from "../components/UpsertSurveyForm/survey-form.schema";
const useUpsertSurvey = () => {
  const {
    id: employeeId,
    organization: { id: organizationId },
  } = useUserOrganization((state) => state.currentEmployee);
  const upsertSurvey = new surveyService.UpsertSurvey(organizationId, employeeId);

  const queryClient = useQueryClient();
  const { mutate: createSurvey, isPending: isPendingCreate } = useTMutation({
    mutationFn: async (variables: { type: EnumSurveyType; formData: UpsertSurveyFormData }) => {
      return await upsertSurvey.createSurvey(variables);
    },
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SURVEYS] });
    },
  });

  const { mutate: updateSurvey, isPending: isPendingUpdate } = useTMutation({
    mutationFn: async (variables: { surveyId: string; formData: UpsertSurveyFormData }) => {
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
