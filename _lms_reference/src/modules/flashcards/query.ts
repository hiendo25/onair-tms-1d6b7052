import { useTQuery } from "@/lib/queryClient";
import { flashcardsRepository } from "@/repository";
import { GetFlashcardsQueryParams } from "@/repository/flashcards/type";

/**
 * Fetch flashcards for an organization
 *
 * @param params - Query parameters including organizationId, page, pageSize, search
 * @param options - Query options
 * @returns Query result with flashcards data
 */
export const useGetFlashcardsQuery = (
  params: GetFlashcardsQueryParams,
  options?: { enabled?: boolean }
) => {
  const { organizationId, page = 1, pageSize = 20, search } = params;

  return useTQuery({
    queryKey: ["flashcards", organizationId, page, pageSize, search],
    queryFn: () => flashcardsRepository.getFlashcards(params),
    enabled: options?.enabled !== false && !!organizationId,
  });
};

/**
 * Fetch a single flashcard by ID
 *
 * @param id - Flashcard ID
 * @param options - Query options
 * @returns Query result with flashcard data
 */
export const useGetFlashcardByIdQuery = (
  id: string,
  options?: { enabled?: boolean }
) => {
  return useTQuery({
    queryKey: ["flashcard", id],
    queryFn: () => flashcardsRepository.getFlashcardById(id),
    enabled: options?.enabled !== false && !!id,
  });
};
