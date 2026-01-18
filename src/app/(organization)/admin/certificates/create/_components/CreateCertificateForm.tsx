"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import { PATHS } from "@/constants/path.constant";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { CertificateFormSchema } from "@/modules/certificates/certificate-form.schema";
import {
  useCreateCertificateTemplateMutation,
} from "@/modules/certificates/operations/mutation";
import { useUserOrganization } from "@/modules/organization";
import UpsertCertificateForm from "../../_components/UpsertCertificateForm";

const CreateCertificateForm: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { organizationId } = useOrganizationId();
  const currentEmployee = useUserOrganization((state) => state.currentEmployee);

  const { mutate: createTemplate, isPending: isCreating } =
    useCreateCertificateTemplateMutation();

  const onSubmit = (data: CertificateFormSchema) => {
    if (!organizationId || !currentEmployee?.id) {
      enqueueSnackbar("Không tìm thấy thông tin tổ chức", { variant: "error" });
      return;
    }

    createTemplate(
      {
        name: data.name,
        description: data.description,
        frame_id: data.frame_id,
        organization_id: organizationId,
        created_by: currentEmployee.id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["certificate-templates", organizationId],
          });
          enqueueSnackbar("Tạo mẫu chứng nhận thành công", { variant: "success" });
          router.push(PATHS.CERTIFICATES.ROOT);
        },
      }
    );
  };

  const handleCancel = () => {
    router.push(PATHS.CERTIFICATES.ROOT);
  };

  return (
    <UpsertCertificateForm
      onSubmit={onSubmit}
      onCancel={handleCancel}
      isLoading={isCreating}
    />
  );
};

export default CreateCertificateForm;
