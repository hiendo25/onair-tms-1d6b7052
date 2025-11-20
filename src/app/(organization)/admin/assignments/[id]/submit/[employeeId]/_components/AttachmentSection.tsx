import * as React from "react";
import { Box, Button, FormLabel, Stack } from "@mui/material";
import FileListItem from "./FileListItem";

interface AttachmentSectionProps {
  attachments?: File[];
  onAttachmentSelect?: (files: FileList | null) => void;
  onRemoveAttachment?: (fileIndex: number) => void;
  label?: string;
  accept?: string;
}

function AttachmentSection({
  attachments = [],
  onAttachmentSelect,
  onRemoveAttachment,
  label = "Tệp đính kèm (không bắt buộc)",
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
}: AttachmentSectionProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <FormLabel sx={{ mb: 1, display: "block", color: "text.secondary", fontSize: "0.875rem" }}>
        {label}
      </FormLabel>
      <Button
        variant="outlined"
        component="label"
        size="small"
      >
        Chọn tệp
        <input
          type="file"
          hidden
          multiple
          accept={accept}
          onChange={(e) => onAttachmentSelect?.(e.target.files)}
        />
      </Button>
      {attachments.length > 0 && (
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {attachments.map((file, index) => (
            <FileListItem
              key={index}
              file={file}
              onRemove={() => onRemoveAttachment?.(index)}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default React.memo(AttachmentSection);

