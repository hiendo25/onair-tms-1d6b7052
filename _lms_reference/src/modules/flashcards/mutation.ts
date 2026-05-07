import { useTMutation } from "@/lib/queryClient";
import { flashcardsRepository } from "@/repository";
import { CreateFlashcardPayload, UpdateFlashcardPayload } from "@/repository/flashcards/type";

/**
 * Create a new flashcard
 */
export const useCreateFlashcardMutation = () => {
  return useTMutation({
    mutationFn: (payload: CreateFlashcardPayload) => flashcardsRepository.createFlashcard(payload),
  });
};

/**
 * Update an existing flashcard
 */
export const useUpdateFlashcardMutation = () => {
  return useTMutation({
    mutationFn: (payload: UpdateFlashcardPayload) => flashcardsRepository.updateFlashcard(payload),
  });
};

/**
 * Delete a flashcard
 */
export const useDeleteFlashcardMutation = () => {
  return useTMutation({
    mutationFn: (id: string) => flashcardsRepository.deleteFlashcard(id),
  });
};

/**
 * Toggle flashcard active/inactive status
 */
export const useToggleFlashcardMutation = () => {
  return useTMutation({
    mutationFn: ({ id, status }: { id: string; status: "active" | "inactive" }) =>
      flashcardsRepository.toggleFlashcard(id, status),
  });
};
