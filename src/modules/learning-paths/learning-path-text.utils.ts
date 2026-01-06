const HTML_TAG_REGEX = /<[^>]*>/g;
const WHITESPACE_REGEX = /\s+/g;
const HTML_NAMED_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: "\"",
  "#39": "'",
  "#x27": "'",
} as const;
const HTML_ENTITY_REGEX = /&([a-zA-Z0-9#]+);/g;

const decodeHtmlEntities = (value: string): string => {
  return value.replace(HTML_ENTITY_REGEX, (match, entity) => {
    const mapped = HTML_NAMED_ENTITIES[entity as keyof typeof HTML_NAMED_ENTITIES];
    if (mapped !== undefined) {
      return mapped;
    }

    if (entity.startsWith("#x")) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      if (Number.isFinite(codePoint)) {
        return String.fromCodePoint(codePoint);
      }
    }

    if (entity.startsWith("#")) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      if (Number.isFinite(codePoint)) {
        return String.fromCodePoint(codePoint);
      }
    }

    return match;
  });
};

const normalizeWhitespace = (value: string): string => {
  return value.replace(WHITESPACE_REGEX, " ").trim();
};

export const toPlainText = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const withoutTags = trimmed.replace(HTML_TAG_REGEX, " ");
  const decoded = decodeHtmlEntities(withoutTags);

  return normalizeWhitespace(decoded);
};
