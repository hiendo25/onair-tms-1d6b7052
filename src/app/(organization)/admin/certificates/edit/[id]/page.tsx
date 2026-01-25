import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { certificateTemplatesRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";

import EditCertificateForm from "./_components/EditCertificateForm";

type EditCertificatePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EditCertificatePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  const certificateDetail = await certificateTemplatesRepository.getCertificateTemplateById(id);

  return {
    title: certificateDetail?.name || "Sửa mẫu chứng nhận",
    description: certificateDetail?.name,
  };
}

export default async function EditCertificatePage({ params }: EditCertificatePageProps) {
  const { id } = await params;
  const certificateDetail = await certificateTemplatesRepository.getCertificateTemplateById(id);

  if (!certificateDetail) {
    notFound();
  }

  return (
    <PageContainer
      title={certificateDetail.name || "Sửa mẫu chứng nhận"}
      breadcrumbs={[
        { title: "Quản lý chứng nhận", path: PATHS.CERTIFICATES.ROOT },
        { title: certificateDetail.name || "Mẫu chứng nhận", path: PATHS.CERTIFICATES.EDIT(certificateDetail.id) },
        { title: "Chỉnh sửa" },
      ]}
    >
      <EditCertificateForm data={certificateDetail} />
    </PageContainer>
  );
}
