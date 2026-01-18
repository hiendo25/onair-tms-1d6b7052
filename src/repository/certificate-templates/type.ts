export type CreateCertificateTemplatePayload = {
  name?: string | null;
  description?: string | null;
  frame_id: string;
  organization_id: string;
  created_by: string;
};

export type UpdateCertificateTemplatePayload = {
  id: string;
  name?: string | null;
  description?: string | null;
  frame_id?: string;
};

export type GetCertificateTemplatesQueryParams = {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  search?: string;
};
