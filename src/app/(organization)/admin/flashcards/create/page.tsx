import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

export const metadata: Metadata = {
  title: "Tạo Flashcard",
  description: "Tạo mới flashcard",
};

const CreateFlashcardPage: React.FC = () => {
  return (
    <PageContainer
      title="Tạo Flashcard"
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
        { title: "Tạo Flashcard", path: PATHS.FLASHCARDS.CREATE },
      ]}
    >
      <div>
        <h1>Create Flashcard Page</h1>
        <p>This is the create flashcard page. Content will be updated later.</p>
      </div>
    </PageContainer>
  );
};

export default CreateFlashcardPage;
