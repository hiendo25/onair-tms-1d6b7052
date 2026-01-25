import { mergeAttributes,Node } from "@tiptap/core";

import { CustomVideoExtensionOptions } from "./custom-video.type";

const CustomVideoExtension = Node.create<CustomVideoExtensionOptions>({
  name: "customVideo",
  group: "block",
  selectable: true,
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 640,
      },
      height: {
        default: 360,
      },
      controls: {
        default: true,
        parseHTML: () => true,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", { class: "video-wrapper" }, ["video", HTMLAttributes]];
  },

  addCommands() {
    return {
      setCustomVideo:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});
export default CustomVideoExtension;
