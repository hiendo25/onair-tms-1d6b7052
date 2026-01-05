"use client";

import * as React from "react";
import { Stack, Typography } from "@mui/material";
import { isUndefined } from "lodash";

import { SurveyQuestionType } from "@/model/survey";
import ChoiceStatistics, { ChoiceStatisticsProps } from "@/modules/surveys/components/statistics/ChoiceStatistics";
import RatingStatistics, { RatingStatisticsProps } from "@/modules/surveys/components/statistics/RatingStatistics";
import SortRatingStatistics, {
  SortRatingStatisticsProps,
} from "@/modules/surveys/components/statistics/SortRatingStatistics";
import TextStatistics, { TextStatisticsProps } from "@/modules/surveys/components/statistics/TextStatistics";
import YesNoStatistics, { YesNoStatisticsProps } from "@/modules/surveys/components/statistics/YesNoStatistics";
import EmptyData from "@/shared/ui/EmptyData";

import { useSurveyStatistic } from "./SurveyStatisticProvider";

interface ResponseStatisticsProps {
  className?: string;
}
export default function ResponseStatistics(props: ResponseStatisticsProps) {
  const { questions } = useSurveyStatistic();

  const getQuestionTypeName = (type: SurveyQuestionType) => {
    const questionTypeName: Record<SurveyQuestionType, string> = {
      checkbox: "Lựa chọn nhiều đáp án",
      radio: "Chọn một đáp án",
      rating: "Đánh giá",
      sort_rating: "Đánh giá và sắp xếp",
      text: "Tự luận",
      yes_no: "Đồng ý hoặc không đồng ý",
    };

    return questionTypeName[type];
  };

  return (
    <Stack spacing={3}>
      {questions.map(({ question_type: questionType, id: questionId, name: questionName, options }, index) => (
        <div className="question-item" key={questionId}>
          <div className="question-item__head mb-4 flex gap-3">
            <span className="w-6 h-6 bg-blue-600 inline-flex items-center justify-center text-white rounded-full text-sm font-medium mt-1">
              {index + 1}
            </span>
            <div className="flex-1">
              <Typography variant="h6" component="p">
                {questionName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`(${getQuestionTypeName(questionType)})`}
              </Typography>
            </div>
          </div>
          <div className="question-item__body">
            {questionType === "text" && <TextStatisticItem questionId={questionId} />}
            {questionType === "rating" && <RatingStatisticItem questionId={questionId} />}
            {questionType === "radio" && (
              <SingleChoiceStatisticItem
                questionId={questionId}
                options={options.map((opt) => ({
                  id: opt.id,
                  isOther: opt.is_other ?? false,
                  text: opt.option_text ?? "",
                  priority: opt.priority ?? 0,
                }))}
              />
            )}
            {questionType === "checkbox" && (
              <MultipleChoiceStatisticItem
                questionId={questionId}
                options={options.map((opt) => ({
                  id: opt.id,
                  isOther: opt.is_other ?? false,
                  text: opt.option_text ?? "",
                  priority: opt.priority ?? 0,
                }))}
              />
            )}

            {questionType === "sort_rating" && (
              <SortRatingStatisticsItem
                questionId={questionId}
                options={options.map((opt) => ({
                  id: opt.id,
                  isOther: opt.is_other ?? false,
                  text: opt.option_text ?? "",
                  priority: opt.priority ?? 0,
                }))}
              />
            )}
            {questionType === "yes_no" && <YesNoStatisticsItem questionId={questionId} />}
          </div>
        </div>
      ))}
    </Stack>
  );
}

/**
 * Text  Type
 */
interface TextStatisticItemProps {
  questionId: string;
}
const TextStatisticItem: React.FC<TextStatisticItemProps> = ({ questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();

  const textResponse = getAnswersByQuestionId(questionId, "text");

  const textStatisticResponse = React.useMemo((): TextStatisticsProps["responses"] | undefined => {
    if (!textResponse || textResponse.length === 0) return;

    return textResponse.map((it) => ({
      id: it.id,
      avatar: it.avatar,
      fullName: it.fullName,
      content: it.answer_value.value,
      createdAt: it.created_at,
    }));
  }, [textResponse]);

  if (!textStatisticResponse) {
    return <EmptyStatistic />;
  }

  return <TextStatistics responses={textStatisticResponse} />;
};

/**
 * Rating  Type
 */

interface RatingStatisticItemProps {
  questionId: string;
}
const RATING_VALUE_KEYS = [1, 2, 3, 4, 5];
const RatingStatisticItem: React.FC<RatingStatisticItemProps> = ({ questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();

  const ratingsResponse = getAnswersByQuestionId(questionId, "rating");

  const ratingStats = React.useMemo((): RatingStatisticsProps["stats"] | undefined => {
    if (!ratingsResponse || ratingsResponse.length === 0) return;

    const initialRatings = RATING_VALUE_KEYS.reduce<Record<number, number>>((acc, r) => ({ ...acc, [r]: 0 }), {});

    const { total, sum, ratingsMap } = ratingsResponse.reduce(
      (acc, res) => {
        const value = res.answer_value.value;
        if (RATING_VALUE_KEYS.includes(value)) {
          acc.total += 1;
          acc.sum += value;
          if (!isUndefined(acc.ratingsMap[value])) {
            acc.ratingsMap[value] += 1;
          }
        }
        return acc;
      },
      {
        total: 0,
        sum: 0,
        ratingsMap: { ...initialRatings },
      },
    );

    return {
      subtotal: total,
      averageRating: total ? Math.round((sum / total) * 100) / 100 : 0,
      ratings: Object.entries(ratingsMap).map(([rating, ratingCount]) => ({
        rating: Number(rating),
        ratingCount,
      })),
    };
  }, [ratingsResponse]);

  if (!ratingStats) return <EmptyStatistic />;

  return <RatingStatistics stats={ratingStats} />;
};

/**
 * Single Choice Type
 */

interface SingleChoiceStatisticItemProps {
  questionId: string;
  options: { id: string; text: string; priority: number; isOther: boolean }[];
}
const SingleChoiceStatisticItem: React.FC<SingleChoiceStatisticItemProps> = ({ options, questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();

  const choiceResponse = getAnswersByQuestionId(questionId, "radio");

  const choiceStats = React.useMemo((): ChoiceStatisticsProps["stats"] | undefined => {
    if (!choiceResponse || choiceResponse.length === 0) return;

    const subtotal = choiceResponse.length;

    const optionsResponse = [...options]
      .sort((a, b) => a.priority - b.priority)
      .map((opt) => {
        const count = choiceResponse.reduce((acc, res) => (res.answer_value.optionId === opt.id ? acc + 1 : acc), 0);

        return {
          optionId: opt.id,
          optionText: opt.isOther ? "Khác" : opt.text,
          count,
        };
      });

    return {
      options: optionsResponse,
      subtotal,
    };
  }, [choiceResponse, options]);

  if (!choiceStats) return <EmptyStatistic />;

  return <ChoiceStatistics stats={choiceStats} />;
};

/**
 * Multiple Choice Type
 */

interface MultipleChoiceStatisticItemProps {
  questionId: string;
  options: { id: string; text: string; priority: number; isOther: boolean }[];
}
const MultipleChoiceStatisticItem: React.FC<MultipleChoiceStatisticItemProps> = ({ options, questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();

  const choiceResponse = getAnswersByQuestionId(questionId, "checkbox");

  const choiceStats = React.useMemo((): ChoiceStatisticsProps["stats"] | undefined => {
    if (!choiceResponse || choiceResponse.length === 0) return;

    const subtotal = choiceResponse.length;

    const optionsResponse = [...options]
      .sort((a, b) => a.priority - b.priority)
      .map((opt) => {
        const count = choiceResponse.reduce((acc, res) => {
          return res.answer_value.some((ans) => ans.optionId === opt.id) ? acc + 1 : acc;
        }, 0);

        return {
          optionId: opt.id,
          optionText: opt.isOther ? "Khác" : opt.text,
          count,
        };
      });

    return {
      options: optionsResponse,
      subtotal,
    };
  }, [choiceResponse, options]);

  if (!choiceStats) return <EmptyStatistic />;

  return <ChoiceStatistics stats={choiceStats} />;
};

/**
 * Sorting No Type
 */

interface SortRatingStatisticsItemProps {
  questionId: string;
  options: { id: string; text: string; priority: number; isOther: boolean }[];
}
const SortRatingStatisticsItem: React.FC<SortRatingStatisticsItemProps> = ({ options, questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();
  const sortRating = React.useMemo((): SortRatingStatisticsProps["stats"] | undefined => {
    const sortRatingResponse = getAnswersByQuestionId(questionId, "sort_rating");

    if (!sortRatingResponse) return;

    const allOpts = sortRatingResponse.flatMap((res) => res.answer_value);
    let totalScore = 0;
    const optionStats = options.reduce((acc, opt): SortRatingStatisticsProps["stats"]["options"] => {
      const score = allOpts.reduce((sum, item) => {
        if (item.optionId === opt.id) {
          sum += item.priority;
        }
        return sum;
      }, 0);
      totalScore += score;
      return [
        ...acc,
        {
          optionId: opt.id,
          optionText: opt.text,
          score,
        },
      ];
    }, []);

    return {
      options: optionStats,
      totalScore: totalScore,
      subtotal: 0,
    };
  }, [options, getAnswersByQuestionId, questionId]);

  if (!sortRating) return <EmptyStatistic />;

  return <SortRatingStatistics stats={sortRating} />;
};

/**
 * YES No Type
 */
interface YesNoStatisticsItemProps {
  questionId: string;
}
const YesNoStatisticsItem: React.FC<YesNoStatisticsItemProps> = ({ questionId }) => {
  const { getAnswersByQuestionId } = useSurveyStatistic();
  const yesNoStatistic = React.useMemo((): YesNoStatisticsProps["stats"] | undefined => {
    const responseAnswers = getAnswersByQuestionId(questionId, "yes_no");

    if (!responseAnswers) return;
    const countMap = responseAnswers.reduce<Map<"yes" | "no", number>>((map, res) => {
      const key = res.answer_value.value;
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map());

    const yesCount = countMap.get("yes") ?? 0;
    const noCount = countMap.get("no") ?? 0;
    const totalCount = responseAnswers.length;

    return {
      yes: {
        count: yesCount,
        percentage: Math.floor(((yesCount * 100) / totalCount) * 100) / 100,
      },
      no: {
        count: noCount,
        percentage: Math.floor(((noCount * 100) / totalCount) * 100) / 100,
      },
      subtotal: totalCount,
    };
  }, [questionId, getAnswersByQuestionId]);

  if (!yesNoStatistic) {
    return <EmptyStatistic />;
  }
  return <YesNoStatistics stats={yesNoStatistic} />;
};

const EmptyStatistic = () => {
  return (
    <div className="flex items-center justify-center">
      <EmptyData iconSize="small" description="Chưa có phản hồi nào." title="Trống" />
    </div>
  );
};
