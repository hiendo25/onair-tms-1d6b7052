export type CertificateLayoutConfig = {
  completion_title: string;
  awarded_to: string;
  program_completion: string;
  issue_date_label: string;
  expiry_date_label: string;
};

export type CreateCertificateTemplatePayload = {
  name?: string | null;
  layout_config?: CertificateLayoutConfig | null;
  frame_id: string;
  organization_id: string;
  created_by: string;
};

export type UpdateCertificateTemplatePayload = {
  id: string;
  name?: string | null;
  layout_config?: CertificateLayoutConfig | null;
  frame_id?: string;
};

export type GetCertificateTemplatesQueryParams = {
  page?: number;
  pageSize?: number;
  organizationId?: string;
  search?: string;
};
