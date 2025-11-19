import * as React from "react";
import {
  Card,
  Typography,
  FormLabel,
  Stack,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Box,
  Button,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { AssignmentQuestionDto } from "@/types/dto/assignments";
import FileUploadButton from "./FileUploadButton";
import FileListItem from "./FileListItem";
import AttachmentSection from "./AttachmentSection";

interface QuestionCardProps {
  question: AssignmentQuestionDto;
  questionNumber: number;
  // For file type questions
  files?: File[];
  onFileSelect?: (files: FileList | null) => void;
  onRemoveFile?: (fileIndex: number) => void;
  // For text type questions
  textAnswer?: string;
  onTextChange?: (text: string) => void;
  // For radio type questions
  radioAnswer?: string;
  onRadioChange?: (optionId: string) => void;
  // For checkbox type questions
  checkboxAnswers?: string[];
  onCheckboxChange?: (optionIds: string[]) => void;
  // For optional attachments (text, radio, checkbox)
  attachments?: File[];
  onAttachmentSelect?: (files: FileList | null) => void;
  onRemoveAttachment?: (fileIndex: number) => void;
}

const getFileIcon = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif"].includes(extension || "")) {
    return <ImageIcon className="w-5 h-5 text-blue-500" />;
  }
  return <DescriptionIcon className="w-5 h-5 text-red-500" />;
};

const isImageFile = (url: string) => {
  const extension = url.split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif"].includes(extension || "");
};

function QuestionCard({
  question,
  questionNumber,
  files = [],
  onFileSelect,
  onRemoveFile,
  textAnswer = "",
  onTextChange,
  radioAnswer = "",
  onRadioChange,
  checkboxAnswers = [],
  onCheckboxChange,
  attachments = [],
  onAttachmentSelect,
  onRemoveAttachment,
}: QuestionCardProps) {
  const handleCheckboxToggle = (optionId: string) => {
    if (!onCheckboxChange) return;

    if (checkboxAnswers.includes(optionId)) {
      onCheckboxChange(checkboxAnswers.filter(id => id !== optionId));
    } else {
      onCheckboxChange([...checkboxAnswers, optionId]);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
        Câu {questionNumber}
        <Typography className="ml-2" variant="caption">
          ({question.score} điểm)
        </Typography>
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        {question.label}
      </Typography>

      {/* Display question attachments */}
      {question.attachments && question.attachments.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary", fontSize: "0.875rem" }}>
            Tài liệu đính kèm:
          </Typography>
          <Stack spacing={1}>
            {question.attachments.map((url, index) => (
              <Box key={index}>
                {isImageFile(url) ? (
                  // Display image inline
                  <Box
                    component="img"
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    sx={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  // Display file link for non-images
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={getFileIcon(url)}
                    endIcon={<OpenInNewIcon />}
                    onClick={() => window.open(url, "_blank")}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    {decodeURIComponent(url.split("/").pop() || "Tải xuống tệp")}
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Render input based on question type */}
      {question.type === "file" && (
        <>
          <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
            Tải lên file trả lời <span style={{ color: "red" }}>*</span>
          </FormLabel>

          <FileUploadButton onFileSelect={onFileSelect || (() => {})} />

          {/* File List */}
          {files.length > 0 && (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {files.map((file, fileIndex) => (
                <FileListItem
                  key={fileIndex}
                  file={file}
                  onRemove={() => onRemoveFile?.(fileIndex)}
                />
              ))}
            </Stack>
          )}
        </>
      )}

      {question.type === "text" && (
        <>
          <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
            Câu trả lời <span style={{ color: "red" }}>*</span>
          </FormLabel>
          <TextField
            multiline
            rows={5}
            fullWidth
            placeholder="Nhập câu trả lời của bạn..."
            value={textAnswer}
            onChange={(e) => onTextChange?.(e.target.value)}
            variant="outlined"
            size="small"
          />

          <AttachmentSection
            attachments={attachments}
            onAttachmentSelect={onAttachmentSelect}
            onRemoveAttachment={onRemoveAttachment}
          />
        </>
      )}

      {question.type === "radio" && question.options && (
        <>
          <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
            Chọn đáp án <span style={{ color: "red" }}>*</span>
          </FormLabel>
          <RadioGroup
            value={radioAnswer}
            onChange={(e) => onRadioChange?.(e.target.value)}
            sx={{ gap: 0.5 }}
          >
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio size="small" />}
                label={option.label}
                sx={{ mb: 0 }}
              />
            ))}
          </RadioGroup>

          <AttachmentSection
            attachments={attachments}
            onAttachmentSelect={onAttachmentSelect}
            onRemoveAttachment={onRemoveAttachment}
          />
        </>
      )}

      {question.type === "checkbox" && question.options && (
        <>
          <FormLabel sx={{ mb: 1.5, display: "block", fontSize: "0.875rem" }}>
            Chọn đáp án (có thể chọn nhiều) <span style={{ color: "red" }}>*</span>
          </FormLabel>
          <FormGroup sx={{ gap: 0.5 }}>
            {question.options.map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    size="small"
                    checked={checkboxAnswers.includes(option.id)}
                    onChange={() => handleCheckboxToggle(option.id)}
                  />
                }
                label={option.label}
                sx={{ mb: 0 }}
              />
            ))}
          </FormGroup>

          <AttachmentSection
            attachments={attachments}
            onAttachmentSelect={onAttachmentSelect}
            onRemoveAttachment={onRemoveAttachment}
          />
        </>
      )}
    </Card>
  );
}

export default React.memo(QuestionCard);
