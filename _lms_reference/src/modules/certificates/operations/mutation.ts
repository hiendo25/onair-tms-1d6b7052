import { useTMutation } from "@/lib";
import { certificateTemplatesRepository } from "@/repository";

/**
 * Mutation hook for creating a certificate template
 */
export const useCreateCertificateTemplateMutation = () => {
  return useTMutation({
    mutationFn: certificateTemplatesRepository.createCertificateTemplate,
    mutationKey: ["create_certificate_template"],
  });
};

/**
 * Mutation hook for updating a certificate template
 */
export const useUpdateCertificateTemplateMutation = () => {
  return useTMutation({
    mutationFn: certificateTemplatesRepository.updateCertificateTemplate,
    mutationKey: ["update_certificate_template"],
  });
};

/**
 * Mutation hook for deleting a certificate template
 */
export const useDeleteCertificateTemplateMutation = () => {
  return useTMutation({
    mutationFn: certificateTemplatesRepository.deleteCertificateTemplate,
    mutationKey: ["delete_certificate_template"],
  });
};
