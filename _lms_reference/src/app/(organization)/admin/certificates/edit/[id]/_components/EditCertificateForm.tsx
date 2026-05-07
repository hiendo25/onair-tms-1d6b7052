"use client";

import { useMemo, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSnackbar } from "notistack";

import UpsertCertificateForm, { UpsertCertificateFormProps } from "@/app/(organization)/admin/certificates/_components/UpsertCertificateForm";
import { PATHS } from "@/constants/path.constant";
import { useOrganizationId } from "@/hooks/useOrganizationId";
import { CertificateFormSchema } from "@/modules/certificates/certificate-form.schema";
import {
  useUpdateCertificateTemplateMutation,
} from "@/modules/certificates/operations/mutation";

import { CertificateLayoutConfig } from "@/repository/certificate-templates/type";

interface EditCertificateFormProps {
  data: {
    id: string;
    name: string | null;
    layout_config: CertificateLayoutConfig | null;
    frame: {
      id: string;
      image_url: string | null;
    } | null;
  };
}

export default function EditCertificateForm({ data }: EditCertificateFormProps) {
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateCertificateTemplateMutation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { organizationId } = useOrganizationId();
  const [isTransition, startTransition] = useTransition();

  const initFormData: UpsertCertificateFormProps["initialData"] = useMemo(() => {
    return {
      id: data.id,
      name: data.name || "",
      layout_config: data.layout_config || {
        completion_title: "Chứng nhận hoàn thành",
        awarded_to: "Chứng nhận này được trao cho",
        program_completion: "Hoàn thành xuất sắc chương trình",
        issue_date_label: "Ngày phát hành",
        expiry_date_label: "Ngày hết hạn",
      },
      frame_id: data.frame?.id || "",
    };
  }, [data]);

  const handleUpdateCertificate = (formData: CertificateFormSchema) => {
    updateTemplate(
      {
        id: data.id,
        name: formData.name,
        layout_config: formData.layout_config,
        frame_id: formData.frame_id,
      },
      {
        onSuccess: () => {
          startTransition(() => {
            queryClient.invalidateQueries({
              queryKey: ["certificate-templates", organizationId],
            });
            enqueueSnackbar("Cập nhật mẫu chứng nhận thành công", { variant: "success" });
            router.push(PATHS.CERTIFICATES.ROOT);
          });
        },
      }
    );
  };

  const handleCancel = () => {
    startTransition(() => {
      router.push(PATHS.CERTIFICATES.ROOT);
    });
  };

  return (
    <UpsertCertificateForm
      initialData={initFormData}
      initialFrameUrl={data.frame?.image_url || ""}
      onSubmit={handleUpdateCertificate}
      onCancel={handleCancel}
      isLoading={isUpdating || isTransition}
    />
  );
}
