"use client";

import * as React from "react";
import StarIcon from "@mui/icons-material/Star";
import {
  Box,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";

import { QuestionAnswer, Survey } from "@/types/survey.types";

interface SurveyStatisticsProps {
  survey: Survey;
  responses: QuestionAnswer[][];
}

interface OptionStat {
  option: string;
  count: number;
  percentage: number;
}

interface RatingStat {
  rating: number;
  count: number;
  percentage: number;
}

interface TextResponse {
  index: number;
  text: string;
  date: string;
}

export default function SurveyStatistics({ survey, responses }: SurveyStatisticsProps) {
  // Calculate statistics for each question
  const questionStats = React.useMemo(() => {
    return survey.questions.map((question) => {
      const answers = responses
        .map((response) => response.find((a) => a.questionId === question.id))
        .filter((a) => a !== undefined);

      const totalResponses = answers.length;

      if (question.type === "radio" || question.type === "select") {
        // Single choice statistics
        const optionCounts = new Map<string, number>();
        question.options?.forEach((opt) => optionCounts.set(opt, 0));

        answers.forEach((answer) => {
          const selected = answer.radioAnswer || answer.selectAnswer;
          if (selected) {
            optionCounts.set(selected, (optionCounts.get(selected) || 0) + 1);
          }
        });

        const stats: OptionStat[] = Array.from(optionCounts.entries()).map(([option, count]) => ({
          option,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
        }));

        return { type: "choice" as const, stats, totalResponses };
      } else if (question.type === "checkbox") {
        // Multiple choice statistics
        const optionCounts = new Map<string, number>();
        question.options?.forEach((opt) => optionCounts.set(opt, 0));

        answers.forEach((answer) => {
          answer.checkboxAnswers?.forEach((selected) => {
            optionCounts.set(selected, (optionCounts.get(selected) || 0) + 1);
          });
        });

        const stats: OptionStat[] = Array.from(optionCounts.entries()).map(([option, count]) => ({
          option,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
        }));

        return { type: "checkbox" as const, stats, totalResponses };
      } else if (question.type === "rating") {
        // Rating statistics
        const ratingCounts = new Map<number, number>();
        [1, 2, 3, 4, 5].forEach((r) => ratingCounts.set(r, 0));

        answers.forEach((answer) => {
          if (answer.ratingAnswer) {
            ratingCounts.set(answer.ratingAnswer, (ratingCounts.get(answer.ratingAnswer) || 0) + 1);
          }
        });

        const stats: RatingStat[] = Array.from(ratingCounts.entries()).map(([rating, count]) => ({
          rating,
          count,
          percentage: totalResponses > 0 ? (count / totalResponses) * 100 : 0,
        }));

        const totalRating = answers.reduce((sum, a) => sum + (a.ratingAnswer || 0), 0);
        const averageRating = totalResponses > 0 ? totalRating / totalResponses : 0;

        return { type: "rating" as const, stats, totalResponses, averageRating };
      } else if (question.type === "text") {
        // Text responses
        const textResponses: TextResponse[] = answers
          .map((answer, index) => ({
            index: index + 1,
            text: answer.textAnswer || "",
            date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
          }))
          .filter((r) => r.text.trim() !== "");

        return { type: "text" as const, responses: textResponses, totalResponses: textResponses.length };
      }

      return { type: "unknown" as const, totalResponses: 0 };
    });
  }, [survey.questions, responses]);

  return (
    <Stack spacing={3}>
      {/* Total responses summary */}
      <Card>
        <Typography variant="h6" gutterBottom>
          Tổng số phản hồi: {responses.length}
        </Typography>
      </Card>

      {/* Question statistics */}
      {survey.questions.map((question, index) => {
        const stat = questionStats[index];

        return (
          <Card key={question.id}>
            {/* Question title */}
            <Typography variant="h6" gutterBottom>
              {question.label}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Loại:{" "}
              {question.type === "checkbox"
                ? "Lựa chọn nhiều đáp án"
                : question.type === "rating"
                ? "Thang điểm"
                : question.type === "text"
                ? "Câu hỏi tự luận"
                : "Lựa chọn"}{" "}
              - Tổng số trả lời: {stat?.totalResponses}
            </Typography>

            <Box sx={{ mt: 3 }}>
              {/* Render based on question type */}
              {stat?.type === "choice" && <ChoiceStatistics stats={stat?.stats} />}
              {stat?.type === "checkbox" && (
                <CheckboxStatistics stats={stat?.stats} totalResponses={stat?.totalResponses} />
              )}
              {stat?.type === "rating" && (
                <RatingStatistics
                  stats={stat?.stats}
                  averageRating={stat?.averageRating}
                  totalResponses={stat?.totalResponses}
                />
              )}
              {stat?.type === "text" && (
                <TextStatistics responses={stat?.responses} totalResponses={stat.totalResponses} />
              )}
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
}

// Choice statistics component (radio/select)
function ChoiceStatistics({ stats }: { stats: OptionStat[] }) {
  const sortedStats = [...stats].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "grey.50" }}>
            <TableCell>Lựa chọn</TableCell>
            <TableCell align="center">Lượt chọn</TableCell>
            <TableCell>% trên tổng số người trả lời</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedStats.map((stat) => (
            <TableRow key={stat.option}>
              <TableCell>{stat.option}</TableCell>
              <TableCell align="center">{stat.count}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ minWidth: 50 }}>
                    {stat.percentage.toFixed(1)}%
                  </Typography>
                  <Box
                    sx={{
                      height: 24,
                      width: `${(stat.count / maxCount) * 100}%`,
                      maxWidth: "100%",
                      backgroundColor: "primary.main",
                      borderRadius: 1,
                    }}
                  />
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Checkbox statistics component
function CheckboxStatistics({ stats, totalResponses }: { stats: OptionStat[]; totalResponses: number }) {
  const sortedStats = [...stats].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
        * Người tham gia có thể chọn nhiều đáp án, tổng phần trăm có thể vượt quá 100%
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell>Lựa chọn</TableCell>
              <TableCell align="center">Lượt chọn</TableCell>
              <TableCell>% trên tổng số người trả lời</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStats.map((stat) => (
              <TableRow key={stat.option}>
                <TableCell>{stat.option}</TableCell>
                <TableCell align="center">{stat.count}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                      {stat.percentage.toFixed(1)}%
                    </Typography>
                    <Box
                      sx={{
                        height: 24,
                        width: `${(stat.count / maxCount) * 100}%`,
                        maxWidth: "100%",
                        backgroundColor: "primary.main",
                        borderRadius: 1,
                      }}
                    />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Rating statistics component
function RatingStatistics({
  stats,
  averageRating,
  totalResponses,
}: {
  stats: RatingStat[];
  averageRating: number;
  totalResponses: number;
}) {
  const sortedStats = [...stats].sort((a, b) => a.rating - b.rating);
  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  return (
    <Box>
      {/* Average rating display */}
      <Box sx={{ backgroundColor: "grey.50", p: 2, borderRadius: 1, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Điểm trung bình
          </Typography>
          <Typography variant="h4" color="primary.main" fontWeight="bold">
            {averageRating.toFixed(2)}
          </Typography>
        </Stack>
      </Box>

      {/* Rating distribution table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell>Mức điểm</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Tỷ lệ (%)</TableCell>
              <TableCell>Phân bố</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedStats.map((stat) => (
              <TableRow key={stat.rating}>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {Array.from({ length: stat.rating }).map((_, i) => (
                      <StarIcon key={i} sx={{ fontSize: 18, color: "warning.main" }} />
                    ))}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({stat.rating})
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">{stat.count}</TableCell>
                <TableCell align="center">{stat.percentage.toFixed(1)}%</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      height: 24,
                      width: `${(stat.count / maxCount) * 100}%`,
                      maxWidth: "100%",
                      backgroundColor: "warning.main",
                      borderRadius: 1,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: "grey.50", fontWeight: "bold" }}>
              <TableCell>
                <Typography variant="body2" fontWeight="bold">
                  Tổng cộng
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight="bold">
                  {totalResponses}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2" fontWeight="bold">
                  100.0%
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// Text statistics component
function TextStatistics({ responses, totalResponses }: { responses: TextResponse[]; totalResponses: number }) {
  const [displayCount, setDisplayCount] = React.useState(5);
  const displayedResponses = responses.slice(0, displayCount);
  const hasMore = displayCount < responses.length;

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell width={80}>STT</TableCell>
              <TableCell>Câu trả lời</TableCell>
              <TableCell width={120} align="center">
                Ngày gửi
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedResponses.map((response) => (
              <TableRow key={response.index}>
                <TableCell>{response.index}</TableCell>
                <TableCell>{response.text}</TableCell>
                <TableCell align="center">{response.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {hasMore && (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
            onClick={() => setDisplayCount((prev) => Math.min(prev + 5, responses.length))}
          >
            Hiển thị {Math.min(displayCount + 5, responses.length)} trong tổng số {responses.length} câu trả lời
          </Typography>
        </Box>
      )}
    </Box>
  );
}
