import type { LessonContentLike, ResourceRow } from "@/modules/learning-screen/types";
import { supabase } from "@/services";

const FALLBACK_BUCKET = "uploads";
const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "m4v", "mkv", "webm", "avi"]);
const DOCUMENT_EXTENSIONS = new Set(["doc", "docx", "txt", "rtf"]);

const DOCUMENT_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const isHttpUrl = (value: string) => /^https?:\/\//.test(value);

const parseResourcePath = (
  path: string,
): { bucket: string; objectPath: string } | null => {
  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(/^\/+/, "");

  if (normalized.includes("::")) {
    const [bucket, ...rest] = normalized.split("::");
    const objectPath = rest.join("::").replace(/^\/+/, "");
    return {
      bucket: bucket || FALLBACK_BUCKET,
      objectPath,
    };
  }

  if (normalized.includes(":")) {
    const [bucket, ...rest] = normalized.split(":");
    const objectPath = rest.join(":").replace(/^\/+/, "");
    return {
      bucket: bucket || FALLBACK_BUCKET,
      objectPath,
    };
  }

  if (normalized.startsWith(`${FALLBACK_BUCKET}/`)) {
    return {
      bucket: FALLBACK_BUCKET,
      objectPath: normalized.slice(FALLBACK_BUCKET.length + 1),
    };
  }

  return {
    bucket: FALLBACK_BUCKET,
    objectPath: normalized,
  };
};

export const getSignedResourceUrl = async (
  resource: ResourceRow | null,
  options?: { expiresInSeconds?: number },
): Promise<string | null> => {
  if (!resource || !resource.path) {
    return null;
  }

  if (isHttpUrl(resource.path)) {
    return resource.path;
  }

  const cached = signedUrlCache.get(resource.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  const parsedPath = parseResourcePath(resource.path);
  if (!parsedPath) {
    return null;
  }

  const ttl = Math.max(60, options?.expiresInSeconds ?? DEFAULT_SIGNED_URL_TTL_SECONDS);

  const { data, error } = await supabase.storage
    .from(parsedPath.bucket)
    .createSignedUrl(parsedPath.objectPath, ttl);

  if (error || !data?.signedUrl) {
    return null;
  }

  const expiresAt = Date.now() + (ttl - 5) * 1000;
  signedUrlCache.set(resource.id, {
    url: data.signedUrl,
    expiresAt,
  });

  return data.signedUrl;
};

export type LessonContentKind =
  | "video"
  | "pdf"
  | "document"
  | "text"
  | "scorm"
  | "assessment"
  | "unknown";

const normalizeExtension = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const cleaned = value.startsWith(".") ? value.slice(1) : value;
  return cleaned.toLowerCase();
};

const normalizeMime = (mime?: string | null) => mime?.toLowerCase().trim() ?? null;

export const inferLessonContentKind = (lesson: LessonContentLike): LessonContentKind => {
  if (lesson.lesson_type === "assessment") {
    return "assessment";
  }

  const resource = lesson.mainResource;
  const extension = normalizeExtension(resource?.extension);
  const mime = normalizeMime(resource?.mime_type);

  if (resource) {
    if (mime?.includes("scorm") || extension === "zip") {
      return "scorm";
    }

    if (mime?.startsWith("video/") || (extension && VIDEO_EXTENSIONS.has(extension))) {
      return "video";
    }

    if (mime?.includes("pdf") || extension === "pdf") {
      return "pdf";
    }

    if (
      mime?.startsWith("text/") ||
      mime === "application/json" ||
      (extension && DOCUMENT_EXTENSIONS.has(extension)) ||
      (mime && DOCUMENT_MIME_TYPES.has(mime))
    ) {
      return "document";
    }
  }

  if (lesson.content) {
    return "text";
  }

  if (!resource) {
    if (lesson.lesson_type === "video") {
      return "video";
    }
    if (lesson.lesson_type === "file") {
      return "document";
    }
  }

  return "unknown";
};
