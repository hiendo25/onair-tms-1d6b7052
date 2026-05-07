import LinkExtension from "@tiptap/extension-link";
import TextAlignExtension from "@tiptap/extension-text-align";
import { Extensions } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { editorClasses } from "../classes";

export const extensions: Extensions = [
  StarterKit.configure({
    codeBlock: false,
    link: false,
    dropcursor: false,
    code: {
      HTMLAttributes: { class: editorClasses.content.codeInline },
    },
    heading: {
      HTMLAttributes: { class: editorClasses.content.heading },
    },
    horizontalRule: {
      HTMLAttributes: { class: editorClasses.content.hr },
    },
    listItem: {
      HTMLAttributes: { class: editorClasses.content.listItem },
    },
    blockquote: {
      HTMLAttributes: { class: editorClasses.content.blockquote },
    },
    bulletList: {
      HTMLAttributes: { class: editorClasses.content.bulletList },
    },
    orderedList: {
      HTMLAttributes: { class: editorClasses.content.orderedList },
    },
  }),
  TextAlignExtension.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  LinkExtension.configure({
    autolink: true,
    openOnClick: false,
    linkOnPaste: false,
    HTMLAttributes: { class: editorClasses.content.link },
    isAllowedUri: (url) => {
      return /^(https?:\/\/|www\.)\S+/.test(url);
    },
  }),
];
