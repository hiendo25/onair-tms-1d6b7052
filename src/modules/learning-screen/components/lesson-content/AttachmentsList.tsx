import { useState } from "react";
import ArchiveIcon from "@mui/icons-material/Archive";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";

import type { LearningLessonAttachment } from "@/modules/learning-screen/types";
import { getSignedResourceUrl } from "@/modules/learning-screen/utils/resource";

interface AttachmentsListProps {
  attachments: LearningLessonAttachment[];
  mainResourceId?: string | null;
}

const getAttachmentIcon = (extension?: string | null, mime?: string | null) => {
  const normalizedExt = extension?.replace(".", "").toLowerCase();
  if (normalizedExt === "pdf" || mime?.includes("pdf")) {
    return <PictureAsPdfIcon className="text-[#E43F5A]" />;
  }
  if (mime?.startsWith("video/")) {
    return <PlayCircleOutlineIcon className="text-[#2150F5]" />;
  }
  if (mime?.startsWith("image/")) {
    return <ImageIcon className="text-[#16a34a]" />;
  }
  if (normalizedExt === "zip" || mime?.includes("zip")) {
    return <ArchiveIcon className="text-[#A66CFF]" />;
  }
  return <InsertDriveFileIcon className="text-[#6B7280]" />;
};

const AttachmentsList = ({ attachments, mainResourceId }: AttachmentsListProps) => {
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});

  const visibleAttachments = attachments.filter(
    (attachment) => attachment.resource && attachment.resourceId !== mainResourceId,
  );

  const handleDownload = async (attachment: LearningLessonAttachment) => {
    if (!attachment.resource) return;
    const resourceId = attachment.resource.id;
    setDownloadingIds((prev) => ({ ...prev, [resourceId]: true }));
    try {
      const url = await getSignedResourceUrl(attachment.resource);
      if (url) {
        window.open(url, "_blank");
      }
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [resourceId]: false }));
    }
  };

  if (visibleAttachments.length === 0) {
    return null;
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={600}>
        Tài liệu đính kèm
      </Typography>
      {visibleAttachments.map((attachment) => {
        const resource = attachment.resource;
        if (!resource) {
          return null;
        }
        const isDownloading = downloadingIds[resource.id] ?? false;
        return (
          <Stack
            key={attachment.bridgeId}
            direction="row"
            spacing={2}
            alignItems="center"
            className="rounded-2xl border border-[#EFF0F3] px-3 py-2"
          >
            <Box className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F6FB]">
              {getAttachmentIcon(resource.extension, resource.mime_type)}
            </Box>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500}>
                {resource.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {resource.extension?.toUpperCase() ?? resource.mime_type ?? "Tệp"}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDownload(attachment)}
              disabled={isDownloading}
            >
              {isDownloading ? "Đang tải..." : "Tải xuống"}
            </Button>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default AttachmentsList;
