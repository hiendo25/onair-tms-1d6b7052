import { GetClassRoomBySlugResponse } from "@/repository/class-room";
import { FileAdioIcon, FileExcelIcon, FileIcon, FileImageIcon, FilePdfIcon, FileVideoIcon, FileWordIcon, FileZipIcon } from "@/shared/assets/icons";

const PDF_EXTENSIONS = ["pdf"];
const WORD_EXTENSIONS = ["doc", "docx"];
const EXCEL_EXTENSIONS = ["xls", "xlsx", "csv"];
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mov", "mkv"];
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg"];
const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z"];

type DocumentItem = NonNullable<GetClassRoomBySlugResponse["data"]>["resources"][number];


export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


const getFileExtension = (name?: string | null): string => {
  if (!name) {
    return "";
  }

  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1]! : "";
};

export const resolveDocumentIcon = (resource: DocumentItem["resource"]) => {
  const mimeType = resource?.mime_type?.toLowerCase() ?? "";
  const extension = getFileExtension(resource?.name);

  if (mimeType.includes("pdf") || PDF_EXTENSIONS.includes(extension)) {
    return FilePdfIcon;
  }
  if (mimeType.includes("word") || WORD_EXTENSIONS.includes(extension)) {
    return FileWordIcon;
  }
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet") || EXCEL_EXTENSIONS.includes(extension)) {
    return FileExcelIcon;
  }
  if (mimeType.startsWith("image/") || IMAGE_EXTENSIONS.includes(extension)) {
    return FileImageIcon;
  }
  if (mimeType.startsWith("video/") || VIDEO_EXTENSIONS.includes(extension)) {
    return FileVideoIcon;
  }
  if (mimeType.startsWith("audio/") || AUDIO_EXTENSIONS.includes(extension)) {
    return FileAdioIcon;
  }
  if (mimeType.includes("zip") || mimeType.includes("compressed") || ARCHIVE_EXTENSIONS.includes(extension)) {
    return FileZipIcon;
  }

  return FileIcon;
};