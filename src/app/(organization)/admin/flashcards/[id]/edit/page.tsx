import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

import { PATHS } from "@/constants/path.constant";
import PageContainer from "@/shared/ui/PageContainer";

type EditFlashcardPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params, searchParams }: EditFlashcardPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Chỉnh sửa Flashcard ${id}`,
    description: `Chỉnh sửa flashcard ${id}`,
  };
}

export default async function EditFlashcardPage({ params }: EditFlashcardPageProps) {
  const { id } = await params;

  // TODO: Fetch flashcard data from API
  // const flashcardDetail = await flashcardRepository.getFlashcardById(id);

  // For now, just show the page
  // if (!flashcardDetail) {
  //   notFound();
  // }

  return (
    <PageContainer
      title={`Chỉnh sửa Flashcard ${id}`}
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
        { title: `Flashcard ${id}`, path: PATHS.FLASHCARDS.DETAIL(id) },
        { title: "Chỉnh sửa" },
      ]}
    >
      <div>
        <h1>Edit Flashcard Page</h1>
        <p>Flashcard ID: {id}</p>
        <p>This is the edit flashcard page. Content will be updated later.</p>
      </div>
    </PageContainer>
  );
}
