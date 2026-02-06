import { Metadata, ResolvingMetadata } from "next";

import { PATHS } from "@/constants/path.constant";
import { flashcardsRepository } from "@/repository";
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
  const flashcard = await flashcardsRepository.getFlashcardById(id);

  if (!flashcard) {
    return {
      title: "Flashcard không tồn tại",
      description: "Flashcard không tồn tại",
    };
  }

  return {
    title: flashcard.name,
    description: `Chi tiết flashcard ${flashcard.name}`,
  };
}

export default async function FlashcardDetailPage({ params }: FlashcardDetailPageProps) {
  const { id } = await params;
  const flashcard = await flashcardsRepository.getFlashcardById(id);

  if (!flashcard) {
    notFound();
  }

  const statusLabel = flashcard.status === "active" ? "Hoạt động" : "Không hoạt động";

  return (
    <PageContainer
      title={flashcard.name}
      breadcrumbs={[
        { title: "Flashcard", path: PATHS.FLASHCARDS.ROOT },
        { title: flashcard.name },
      ]}
    >
      <div className="bg-white rounded-xl p-3 md:p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="w-full md:w-1/3">
            <div
              className="rounded-xl overflow-hidden border border-gray-200"
              style={{ aspectRatio: "4/3" }}
            >
              {flashcard.image_url ? (
                <img
                  src={flashcard.image_url}
                  alt={flashcard.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="w-full h-full bg-gray-100 flex items-center justify-center"
                  style={{ aspectRatio: "4/3" }}
                >
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" fill="#E0E0E0"/>
                    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="#9E9E9E" strokeWidth="1.5"/>
                    <path d="M3 10H21" stroke="#9E9E9E" strokeWidth="1.5"/>
                    <path d="M7 15H12" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm ${
                  flashcard.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {statusLabel}
              </span>
            </div>

            <h2 className="text-xl font-semibold mb-4">{flashcard.name}</h2>

            {flashcard.content && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Nội dung</h3>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: flashcard.content }}
                />
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Ngày tạo: {new Date(flashcard.created_at).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
