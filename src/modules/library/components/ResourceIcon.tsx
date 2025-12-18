import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import ImageIcon from "@mui/icons-material/Image";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import TableChartIcon from "@mui/icons-material/TableChart";
import VideoFileIcon from "@mui/icons-material/VideoFile";

import { Resource } from "../types";

interface ResourceIconProps {
  isFolder?: boolean;
  size?: number;
  mimeType?: string;
  extension?: string;
}

export function ResourceIcon({ isFolder = false, size = 48, extension, mimeType}: ResourceIconProps) {
  if (isFolder) {
    return <FolderIcon sx={{ fontSize: size, color: "#5f6368" }} />;
  }

  extension = extension?.toLowerCase() || "";
  mimeType = mimeType?.toLowerCase() || "";

  if (mimeType.includes("pdf") || extension === "pdf") {
    return <PictureAsPdfIcon sx={{ fontSize: size, color: "#ea4335" }} />;
  }
  if (mimeType.includes("image") || ["jpg", "jpeg", "png", "gif", "svg"].includes(extension)) {
    return <ImageIcon sx={{ fontSize: size, color: "#34a853" }} />;
  }
  if (mimeType.includes("video") || ["mp4", "avi", "mov", "mkv"].includes(extension)) {
    return <VideoFileIcon sx={{ fontSize: size, color: "#fbbc04" }} />;
  }
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    ["xlsx", "xls", "csv"].includes(extension)
  ) {
    return <TableChartIcon sx={{ fontSize: size, color: "#0f9d58" }} />;
  }
  if (
    mimeType.includes("presentation") ||
    mimeType.includes("powerpoint") ||
    ["pptx", "ppt"].includes(extension)
  ) {
    return <SlideshowIcon sx={{ fontSize: size, color: "#f4b400" }} />;
  }
  if (
    mimeType.includes("document") ||
    mimeType.includes("word") ||
    ["docx", "doc", "txt"].includes(extension)
  ) {
    return <DescriptionIcon sx={{ fontSize: size, color: "#4285f4" }} />;
  }

  return <InsertDriveFileIcon sx={{ fontSize: size, color: "#5f6368" }} />;
}

