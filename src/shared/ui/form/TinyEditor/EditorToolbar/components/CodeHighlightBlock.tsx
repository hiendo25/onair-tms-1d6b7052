import "./code-highlight-block.css";

import React, { ComponentType } from "react";
import { Extension, NodeViewContent, NodeViewWrapper, ReactNodeViewProps } from "@tiptap/react";

import { editorClasses } from "../../classes";

export type EditorCodeHighlightBlockProps = ComponentType<ReactNodeViewProps<HTMLElement>>;

const CodeHighlightBlock: ComponentType<ReactNodeViewProps<HTMLElement>> = (props) => {
  const {
    node: {
      attrs: { language: defaultLanguage },
    },
    extension,
    updateAttributes,
  } = props;
  return (
    <NodeViewWrapper className={editorClasses.content.codeBlock}>
      <select
        name="language"
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
        className={editorClasses.content.langSelect}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight.listLanguages().map((lang: string) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>

      <pre>
        <NodeViewContent as="div" />
      </pre>
    </NodeViewWrapper>
  );
};
export default CodeHighlightBlock;
