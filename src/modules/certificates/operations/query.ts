import { useTQuery } from "@/lib/queryClient";
import { certificateTemplatesRepository } from "@/repository";
import { GetCertificateTemplatesQueryParams } from "@/repository/certificate-templates/type";

/**
 * Fetch certificate templates for an organization
 *
 * @param params - Query parameters including organizationId, page, pageSize, search
 * @param options - Query options
 * @returns Query result with certificate templates data
 */
export const useGetCertificateTemplatesQuery = (
  params: GetCertificateTemplatesQueryParams,
  options?: { enabled?: boolean }
) => {
  const { organizationId, page = 1, pageSize = 20, search } = params;

  return useTQuery({
    queryKey: ["certificate-templates", organizationId, page, pageSize, search],
    queryFn: () => certificateTemplatesRepository.getCertificateTemplates(params),
    enabled: options?.enabled !== false && !!organizationId,
  });
};

/**
 * Fetch a single certificate template by ID
 *
 * @param id - Certificate template ID
 * @param options - Query options
 * @returns Query result with certificate template data
 */
export const useGetCertificateTemplateByIdQuery = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useTQuery({
    queryKey: ["certificate-template", id],
    queryFn: () => certificateTemplatesRepository.getCertificateTemplateById(id),
    enabled: options?.enabled !== false && !!id,
  });
};
