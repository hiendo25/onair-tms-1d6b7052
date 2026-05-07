import { useTQuery } from "@/lib/queryClient";
import { certificateFramesRepository } from "@/repository";
import { GetCertificateFramesParams } from "@/repository/certificate-frames";

/**
 * Fetch certificate frames for an organization
 */
export const useGetCertificateFramesQuery = (
  params: GetCertificateFramesParams,
  options?: { enabled?: boolean }
) => {
  const { organizationId, page = 1, pageSize = 20 } = params;

  return useTQuery({
    queryKey: ["certificate-frames", organizationId, page, pageSize],
    queryFn: () => certificateFramesRepository.getCertificateFrames(params),
    enabled: options?.enabled !== false && !!organizationId,
  });
};
