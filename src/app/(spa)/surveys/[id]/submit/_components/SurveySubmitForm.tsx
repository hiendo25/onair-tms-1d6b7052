// "use client";

// import * as React from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Box,
//   Button,
//   Card,
//   Checkbox,
//   CircularProgress,
//   FormControl,
//   FormControlLabel,
//   FormGroup,
//   FormHelperText,
//   FormLabel,
//   MenuItem,
//   OutlinedInput,
//   Radio,
//   RadioGroup,
//   Rating,
//   Select,
//   Stack,
//   Typography,
// } from "@mui/material";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import StarIcon from "@mui/icons-material/Star";
// import PublicPageContainer from "@/shared/ui/PageContainer/PublicPageContainer";
// import { MOCK_SURVEYS } from "@/constants/survey.constants";
// import { Question, QuestionAnswer, Survey } from "@/types/survey.types";
// import { SurveySubmissionSchema, surveySubmissionSchema } from "@/modules/surveys/survey-submission.schema";
// import useNotifications from "@/hooks/useNotifications/useNotifications";
// import { PATHS } from "@/constants/path.contstants";

// interface QuestionCardProps {
//   question: Question;
//   questionNumber: number;
//   value: QuestionAnswer;
//   onChange: (answer: QuestionAnswer) => void;
//   error?: string;
// }

// function QuestionCard({ question, questionNumber, value, onChange, error }: QuestionCardProps) {
//   const handleTextChange = (text: string) => {
//     onChange({
//       ...value,
//       questionId: question.id,
//       questionType: question.type,
//       textAnswer: text,
//     });
//   };

//   const handleRadioChange = (selectedValue: string) => {
//     onChange({
//       ...value,
//       questionId: question.id,
//       questionType: question.type,
//       radioAnswer: selectedValue,
//     });
//   };

//   const handleCheckboxToggle = (option: string) => {
//     const currentAnswers = value.checkboxAnswers || [];
//     const newAnswers = currentAnswers.includes(option)
//       ? currentAnswers.filter((a) => a !== option)
//       : [...currentAnswers, option];

//     onChange({
//       ...value,
//       questionId: question.id,
//       questionType: question.type,
//       checkboxAnswers: newAnswers,
//     });
//   };

//   const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
//     onChange({
//       ...value,
//       questionId: question.id,
//       questionType: question.type,
//       ratingAnswer: newValue || undefined,
//     });
//   };

//   const handleSelectChange = (selectedValue: string) => {
//     onChange({
//       ...value,
//       questionId: question.id,
//       questionType: question.type,
//       selectAnswer: selectedValue,
//     });
//   };

//   return (
//     <Card variant="outlined" sx={{ p: 3 }}>
//       <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
//         Câu {questionNumber}
//         {question.is_required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
//       </Typography>

//       <Typography variant="body1" sx={{ mb: 2 }}>
//         {question.label}
//       </Typography>

//       {/* Text Question */}
//       {question.type === "text" && (
//         <FormControl fullWidth error={!!error}>
//           <OutlinedInput
//             value={value.textAnswer || ""}
//             onChange={(e) => handleTextChange(e.target.value)}
//             multiline
//             minRows={4}
//             maxRows={8}
//             placeholder="Nhập câu trả lời của bạn..."
//             size="small"
//           />
//           {error && <FormHelperText>{error}</FormHelperText>}
//         </FormControl>
//       )}

//       {/* Radio Question */}
//       {question.type === "radio" && question.options && (
//         <FormControl fullWidth error={!!error}>
//           <RadioGroup value={value.radioAnswer || ""} onChange={(e) => handleRadioChange(e.target.value)}>
//             {question.options.map((option, index) => (
//               <FormControlLabel
//                 key={index}
//                 value={option}
//                 control={<Radio size="small" />}
//                 label={option}
//                 sx={{ mb: 0.5 }}
//               />
//             ))}
//           </RadioGroup>
//           {error && <FormHelperText>{error}</FormHelperText>}
//         </FormControl>
//       )}

//       {/* Checkbox Question */}
//       {question.type === "checkbox" && question.options && (
//         <FormControl fullWidth error={!!error}>
//           <FormGroup>
//             {question.options.map((option, index) => (
//               <FormControlLabel
//                 key={index}
//                 control={
//                   <Checkbox
//                     size="small"
//                     checked={(value.checkboxAnswers || []).includes(option)}
//                     onChange={() => handleCheckboxToggle(option)}
//                   />
//                 }
//                 label={option}
//                 sx={{ mb: 0.5 }}
//               />
//             ))}
//           </FormGroup>
//           {error && <FormHelperText>{error}</FormHelperText>}
//         </FormControl>
//       )}

//       {/* Rating Question */}
//       {question.type === "rating" && (
//         <FormControl fullWidth error={!!error}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Rating
//               value={value.ratingAnswer || 0}
//               onChange={handleRatingChange}
//               size="large"
//               emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
//             />
//             {value.ratingAnswer && (
//               <Typography variant="body2" color="text.secondary">
//                 {value.ratingAnswer}/5
//               </Typography>
//             )}
//           </Box>
//           {error && <FormHelperText>{error}</FormHelperText>}
//         </FormControl>
//       )}

//       {/* Select Question */}
//       {question.type === "select" && question.options && (
//         <FormControl fullWidth error={!!error} size="small">
//           <Select
//             value={value.selectAnswer || ""}
//             onChange={(e) => handleSelectChange(e.target.value)}
//             displayEmpty
//           >
//             <MenuItem value="" disabled>
//               <em>Chọn một tùy chọn...</em>
//             </MenuItem>
//             {question.options.map((option, index) => (
//               <MenuItem key={index} value={option}>
//                 {option}
//               </MenuItem>
//             ))}
//           </Select>
//           {error && <FormHelperText>{error}</FormHelperText>}
//         </FormControl>
//       )}
//     </Card>
//   );
// }


// export default function SurveySubmitForm() {
//   const params = useParams();
//   const router = useRouter();
//   const notifications = useNotifications();

//   const surveyId = params.id as string;
//   const [isSubmitting, setIsSubmitting] = React.useState(false);

//   // Find survey from mock data
//   const survey = React.useMemo(() => {
//     return MOCK_SURVEYS.find((s) => s.id === surveyId);
//   }, [surveyId]);

//   // Initialize form with default values
//   const defaultAnswers: QuestionAnswer[] = React.useMemo(() => {
//     if (!survey) return [];
//     return survey.questions.map((q) => ({
//       questionId: q.id,
//       questionType: q.type,
//     }));
//   }, [survey]);

//   const {
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm<SurveySubmissionSchema>({
//     resolver: zodResolver(surveySubmissionSchema),
//     defaultValues: {
//       answers: defaultAnswers,
//     },
//   });

//   const answers = watch("answers");

//   const handleAnswerChange = (index: number, answer: QuestionAnswer) => {
//     setValue(`answers.${index}`, answer, { shouldValidate: true });
//   };

//   const validateRequiredQuestions = (): boolean => {
//     if (!survey) return false;

//     for (let i = 0; i < survey.questions.length; i++) {
//       const question = survey.questions[i];
//       const answer = answers[i];

//       if (question.is_required) {
//         switch (question.type) {
//           case "text":
//             if (!answer.textAnswer || answer.textAnswer.trim() === "") {
//               notifications.show(`Vui lòng trả lời câu hỏi ${i + 1}`, { severity: "error" });
//               return false;
//             }
//             break;
//           case "radio":
//             if (!answer.radioAnswer) {
//               notifications.show(`Vui lòng chọn đáp án cho câu hỏi ${i + 1}`, { severity: "error" });
//               return false;
//             }
//             break;
//           case "checkbox":
//             if (!answer.checkboxAnswers || answer.checkboxAnswers.length === 0) {
//               notifications.show(`Vui lòng chọn ít nhất một đáp án cho câu hỏi ${i + 1}`, { severity: "error" });
//               return false;
//             }
//             break;
//           case "rating":
//             if (!answer.ratingAnswer || answer.ratingAnswer === 0) {
//               notifications.show(`Vui lòng đánh giá cho câu hỏi ${i + 1}`, { severity: "error" });
//               return false;
//             }
//             break;
//           case "select":
//             if (!answer.selectAnswer) {
//               notifications.show(`Vui lòng chọn đáp án cho câu hỏi ${i + 1}`, { severity: "error" });
//               return false;
//             }
//             break;
//         }
//       }
//     }

//     return true;
//   };

//   const onSubmit = async (data: SurveySubmissionSchema) => {
//     if (!validateRequiredQuestions()) {
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // Simulate API call with setTimeout
//       await new Promise((resolve) => setTimeout(resolve, 500));

//       console.log("Survey submission data:", data);

//       notifications.show("Cảm ơn bạn đã hoàn thành khảo sát!", {
//         severity: "success",
//         autoHideDuration: 3000,
//       });

//       // Redirect to thank you page
//       router.push(PATHS.SURVEYS.THANK_YOU(surveyId));
//     } catch (error) {
//       console.error("Error submitting survey:", error);
//       notifications.show("Có lỗi xảy ra khi nộp khảo sát. Vui lòng thử lại.", {
//         severity: "error",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   if (!survey) {
//     return (
//       <PublicPageContainer title="Khảo sát không tồn tại" breadcrumbs={[{ title: "Khảo sát" }]}>
//         <Box sx={{ py: 3 }}>
//           <Card sx={{ p: 3 }}>
//             <Typography variant="body1" color="text.secondary" align="center">
//               Không tìm thấy khảo sát này.
//             </Typography>
//           </Card>
//         </Box>
//       </PublicPageContainer>
//     );
//   };

//   return (
//     <PublicPageContainer
//       title={survey.name}
//       breadcrumbs={[
//         { title: "Khảo sát", path: "/surveys" },
//         { title: "Nộp khảo sát" },
//       ]}
//     >
//       <Box sx={{ py: 3 }}>
//         <Card sx={{ p: 3 }}>
//           <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
//             <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={isSubmitting}>
//               Quay lại
//             </Button>
//           </Stack>

//           {/* Survey Header */}
//           <Box sx={{ mb: 4 }}>
//             <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
//               {survey.name}
//             </Typography>
//             <Typography variant="body1" color="text.secondary">
//               {survey.description}
//             </Typography>
//           </Box>

//           {/* Form */}
//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Stack spacing={3}>
//               {survey.questions.map((question, index) => (
//                 <QuestionCard
//                   key={question.id}
//                   question={question}
//                   questionNumber={index + 1}
//                   value={answers[index]}
//                   onChange={(answer) => handleAnswerChange(index, answer)}
//                   error={errors.answers?.[index]?.message}
//                 />
//               ))}

//               {/* Submit Actions */}
//               <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
//                 <Button variant="outlined" onClick={handleBack} disabled={isSubmitting}>
//                   Hủy
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="contained"
//                   disabled={isSubmitting}
//                   startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
//                 >
//                   {isSubmitting ? "Đang nộp..." : "Nộp khảo sát"}
//                 </Button>
//               </Box>
//             </Stack>
//           </form>
//         </Card>
//       </Box>
//     </PublicPageContainer>
//   );
// }



