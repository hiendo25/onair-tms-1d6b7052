import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants/query-key.constant";
import { useTMutation } from "@/lib";
import { SurveyTargetType } from "@/model/survey";
import { useUserOrganization } from "@/modules/organization";
import { surveyService } from "@/services";
import { SurveySubmissionFormData } from "../components/SurveySubmissionForm/survey-submission.schema";
const useSubmissionSurvey = () => {
  const {
    id: employeeId,
    organization: { id: organizationId },
  } = useUserOrganization((state) => state.currentEmployee);

  const submissionService = new surveyService.SubmissionSurveyService(organizationId, employeeId);

  const queryClient = useQueryClient();
  const { mutate: createResponse, isPending: isPendingCreate } = useTMutation({
    mutationFn: async (variables: {
      formData: SurveySubmissionFormData;
      targetId?: string;
      targetType?: SurveyTargetType;
    }) => {
      const { formData, targetId, targetType } = variables;
      return await submissionService.submitSurvey({
        formData: formData,
        targetId,
        targetType,
      });
    },
    onSuccess(data, variables, onMutateResult, context) {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SURVEYS] });
    },
  });

  return {
    create: createResponse,
    isLoading: isPendingCreate,
  };
};
export { useSubmissionSurvey };
