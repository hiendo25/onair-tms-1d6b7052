import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import CreateCertificateForm from "./_components/CreateCertificateForm";

export const metadata: Metadata = {
  title: "Tạo mẫu chứng nhận",
  description: "Tạo mới mẫu chứng nhận",
};

const CreateCertificatePage: React.FC = () => {
  return (
    <PageContainer
      title="Tạo mẫu chứng nhận"
      breadcrumbs={[
        { title: "Quản lý chứng nhận", path: PATHS.CERTIFICATES.ROOT },
        { title: "Tạo mẫu chứng nhận", path: PATHS.CERTIFICATES.CREATE },
      ]}
    >
      <CreateCertificateForm />
    </PageContainer>
  );
};

export default CreateCertificatePage;
