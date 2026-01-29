import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import { flashcardsRepository } from "@/repository";
import PageContainer from "@/shared/ui/PageContainer";
import FlashcardForm from "../../_components/FlashcardForm";

type EditFlashcardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EditFlashcardPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  const flashcard = await flashcardsRepository.getFlashcardById(id);

  if (!flashcard) {
    return {
      title: "Chỉnh sửa Flashcard",
      description: "Chỉnh sửa flashcard",
    };
  }

  return {
    title: `Chỉnh sửa Flashcard: ${flashcard.name}`,
    description: `Chỉnh sửa flashcard ${flashcard.name}`,
  };
}

export default async function EditFlashcardPage({ params }: EditFlashcardPageProps) {
  const { id } = await params;
  const flashcard = await flashcardsRepository.getFlashcardById(id);

  if (!flashcard) {
    notFound();
  }

  return (
    <PageContainer
      title={`Chỉnh sửa Flashcard: ${flashcard.name}`}
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
        { title: flashcard.name, path: PATHS.FLASHCARDS.DETAIL(id) },
        { title: "Chỉnh sửa" },
      ]}
    >
      <FlashcardForm mode="edit" flashcardId={id} />
    </PageContainer>
  );
}
