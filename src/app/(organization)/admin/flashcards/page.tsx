import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

export const metadata: Metadata = {
  title: "Quản lý Flashcard",
  description: "Quản lý flashcard cho người học",
};

const FlashcardsPage: React.FC = () => {
  return (
    <PageContainer
      title="Quản lý Flashcard"
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
      ]}
    >
      <div>
        <h1>Flashcard List Page</h1>
        <p>This is the flashcard list page. Content will be updated later.</p>
      </div>
    </PageContainer>
  );
};

export default FlashcardsPage;
