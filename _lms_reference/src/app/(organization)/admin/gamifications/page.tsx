import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import GamificationContainer from "./_components/GamificationContainer";

export const metadata: Metadata = {
  title: "Gamification",
  description: "Quản lý hệ thống gamification",
};

const GamificationPage: React.FC = () => {
  return (
    <PageContainer
      title="Gamification"
      breadcrumbs={[
        { title: "Gamification", path: PATHS.GAMIFICATIONS.ROOT },
      ]}
    >
      <GamificationContainer />
    </PageContainer>
  );
};

export default GamificationPage;
