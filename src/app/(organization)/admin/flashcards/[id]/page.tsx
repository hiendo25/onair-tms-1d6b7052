import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

type FlashcardDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: FlashcardDetailPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Flashcard ${id}`,
    description: `Chi tiết flashcard ${id}`,
  };
}

export default async function FlashcardDetailPage({ params }: FlashcardDetailPageProps) {
  const { id } = await params;

  // TODO: Fetch flashcard data from API
  // const flashcardDetail = await flashcardRepository.getFlashcardById(id);

  // For now, just show the page
  // if (!flashcardDetail) {
  //   notFound();
  // }

  return (
    <PageContainer
      title={`Flashcard ${id}`}
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
        { title: `Flashcard ${id}`, path: PATHS.FLASHCARDS.DETAIL(id) },
      ]}
    >
      <div>
        <h1>Flashcard Detail Page</h1>
        <p>Flashcard ID: {id}</p>
        <p>This is the flashcard detail page. Content will be updated later.</p>
      </div>
    </PageContainer>
  );
}
