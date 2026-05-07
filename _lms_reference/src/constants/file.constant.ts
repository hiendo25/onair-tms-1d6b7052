export const FILE_TYPES = {
  images: [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".bmp", ".tif", ".tiff"],
  audios: [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
  videos: [".mp4", ".webm", ".avi", ".mov", ".mkv"],
  docs: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".md", ".csv", ".json", ".xml"],
} as const;
export const MIME_TYPES = {
  docs: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

type ValueOf<T> = T[keyof T];
type ArrayItem<T> = T extends readonly (infer U)[] ? U : never;

export type ImageFileType = ArrayItem<(typeof FILE_TYPES)["images"]>;

export type AudioFileType = ArrayItem<(typeof FILE_TYPES)["audios"]>;

export type VideoFileType = ArrayItem<(typeof FILE_TYPES)["videos"]>;

export type DocFileType = ArrayItem<(typeof FILE_TYPES)["docs"]>;

export type AnyFileType = ImageFileType | AudioFileType | VideoFileType | DocFileType;

export type FileTypes = typeof FILE_TYPES;

export type FileCategory = keyof FileTypes; // "images" | "audios" | "docs" | "videos"

export type DocMimeType = ArrayItem<(typeof MIME_TYPES)["docs"]>;

export function isAllowedFile(filename: string, category: FileCategory): boolean {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return false;

  const ext = filename.slice(dotIndex).toLowerCase();
  return FILE_TYPES[category].includes(ext as never);
}

export const getTypeOfFile = (fileExtensionOrMime: string): FileCategory | "unknown" => {
  const ext = fileExtensionOrMime.toLowerCase();

  for (const [category, extensions] of Object.entries(FILE_TYPES) as [FileCategory, readonly string[]][]) {
    if (extensions.includes(`.${ext}`)) {
      return category;
    }
  }

  return "unknown";
};

const normalizeExtension = (input: string): string | null => {
  if (!input) return null;

  // mime type
  if (input.includes("/")) return null;

  const ext = input.startsWith(".") ? input : `.${input}`;
  return ext.toLowerCase();
};
export const getTypeFromMime = (mime: string): FileCategory | "unknown" => {
  if (MIME_TYPES.docs.includes(mime as DocMimeType)) {
    return "docs";
  }
  return "unknown";
};
