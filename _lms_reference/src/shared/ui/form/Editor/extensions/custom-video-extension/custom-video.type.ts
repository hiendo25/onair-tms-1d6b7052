export type CustomVideoExtensionOptions = {
  HTMLAttributes: Record<string, any>;
};

declare module "@tiptap/core" {
  interface ExtensionOptions {
    customVideoOption: CustomVideoExtensionOptions;
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customVideoExtension: {
      setCustomVideo: (options: {
        src: string;
        width?: number;
        height?: number;
      }) => ReturnType;
    };
  }
}
