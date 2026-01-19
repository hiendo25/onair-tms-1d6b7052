import type { MatchingQuestionData, OrderItem } from "@/types/dto/assignments/create-assignment.dto";
import type { QuestionOption } from "@/types/dto/assignments/question-option.dto";
import type { Database, Json } from "@/types/supabase.types";

interface QuestionOptionsInput {
  type: Database["public"]["Enums"]["question_type"];
  options?: QuestionOption[] | null;
  matchingData?: MatchingQuestionData | null;
  orderItems?: OrderItem[] | null;
}

interface QuestionOptionsConfig {
  shuffleOrderItems?: boolean;
}

const buildShuffledOrder = (length: number) => {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
};

const buildQuestionOptions = (
  question: QuestionOptionsInput,
  { shuffleOrderItems = false }: QuestionOptionsConfig = {},
): Json | null => {
  if (question.type === "matching" && question.matchingData) {
    const { columnAItems, columnBItems, correctMappings } = question.matchingData;
    return {
      columnAItems,
      columnBItems,
      correctMappings,
    } as Json;
  }

  if (question.type === "order" && question.orderItems) {
    const orderItemsWithCorrectOrder = question.orderItems.map((item, index) => ({
      ...item,
      correctOrder: index + 1,
    }));

    const displayOrder = shuffleOrderItems
      ? buildShuffledOrder(orderItemsWithCorrectOrder.length)
      : orderItemsWithCorrectOrder.map((_, index) => index);

    const orderItemsWithDisplayOrder = orderItemsWithCorrectOrder.map((item, index) => ({
      ...item,
      displayOrder: displayOrder[index] + 1,
    }));

    return {
      orderItems: orderItemsWithDisplayOrder,
    } as Json;
  }

  return question.options ?? null;
};

export { buildQuestionOptions };
