import * as React from "react";
import { Box, Card, Stack, Typography, IconButton, Chip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Image from "next/image";
import { formatFileSize } from "@/utils";

interface FileListItemProps {
  file: File;
  onRemove: () => void;
}

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/")) {
    return <ImageIcon />;
  } else if (file.type.startsWith("video/")) {
    return <VideoLibraryIcon />;
  } else if (file.type.startsWith("audio/")) {
    return <AudiotrackIcon />;
  }
  return <CloudUploadIcon />;
};

export default function FileListItem({ file, onRemove }: FileListItemProps) {
  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        {/* File Preview/Icon */}
        <Box sx={{ flexShrink: 0 }}>
          {file.type.startsWith("image/") ? (
            <Box
              sx={{
                width: 60,
                height: 60,
                position: "relative",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                fill
                style={{ objectFit: "cover" }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: 60,
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
                borderRadius: 1,
              }}
            >
              {getFileIcon(file)}
            </Box>
          )}
        </Box>

        {/* File Info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Chip
              label={formatFileSize(file.size)}
              size="small"
              variant="outlined"
            />
            <Chip
              label={file.type || "Unknown"}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* Remove Button */}
        <IconButton
          size="small"
          color="error"
          onClick={onRemove}
        >
          <DeleteIcon />
        </IconButton>
      </Stack>
    </Card>
  );
}

