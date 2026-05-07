import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import CertificatesListContainer from "./_components/CertificatesListContainer";

export const metadata: Metadata = {
  title: "Quản lý chứng nhận",
  description: "Quản lý chứng nhận cho người học",
};

const CertificatesPage: React.FC = () => {
  return (
    <PageContainer
      title="Quản lý chứng nhận"
      breadcrumbs={[
        { title: "Quản lý chứng nhận", path: PATHS.CERTIFICATES.ROOT },
      ]}
    >
      <CertificatesListContainer />
    </PageContainer>
  );
};

export default CertificatesPage;
