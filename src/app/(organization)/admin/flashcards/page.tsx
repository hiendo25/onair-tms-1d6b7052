import * as React from "react";
import { Metadata } from "next";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

import FlashcardsListContainer from "./_components/FlashcardsListContainer";

export const metadata: Metadata = {
  title: "Quản lý Flashcard",
  description: "Quản lý flashcard cho người học",
};

const FlashcardsPage: React.FC = () => {
  return (
    <PageContainer
      title="Flashcard"
      breadcrumbs={[{ title: "Flashcard", path: PATHS.FLASHCARDS.ROOT }]}
    >
      <FlashcardsListContainer />
    </PageContainer>
  );
};

export default FlashcardsPage;
