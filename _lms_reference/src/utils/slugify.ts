import { toNonAccentVietnamese } from "./common";
export const slugify = (text?: string) => {
  if (!text) return "";

  const textLatin = toNonAccentVietnamese(text);
  return textLatin
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};
