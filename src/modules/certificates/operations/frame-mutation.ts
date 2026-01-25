import { useTMutation } from "@/lib";
import { certificateFramesRepository } from "@/repository";

/**
 * Mutation hook for deleting a certificate frame
 */
export const useDeleteCertificateFrameMutation = () => {
  return useTMutation({
    mutationFn: certificateFramesRepository.deleteCertificateFrame,
    mutationKey: ["delete_certificate_frame"],
  });
};
