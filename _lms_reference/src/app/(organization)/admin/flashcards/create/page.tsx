import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";
import FlashcardForm from "../_components/FlashcardForm";

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
      <FlashcardForm mode="create" />
    </PageContainer>
  );
};

export default CreateFlashcardPage;
