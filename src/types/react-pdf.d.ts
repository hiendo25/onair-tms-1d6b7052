import React from "react";

declare module 'react-pdf' {
  import { ComponentType } from 'react';

  export interface DocumentProps {
    file: string | ArrayBuffer | { url: string };
    onLoadSuccess?: (pdf: { numPages: number }) => void;
    onLoadError?: (error: Error) => void;
    loading?: React.ReactNode;
    children?: React.ReactNode;
  }

  export interface PageProps {
    pageNumber: number;
    width?: number;
    height?: number;
    scale?: number;
    renderTextLayer?: boolean;
    renderAnnotationLayer?: boolean;
  }

  export const Document: ComponentType<DocumentProps>;
  export const Page: ComponentType<PageProps>;

  export const pdfjs: {
    version: string;
    GlobalWorkerOptions: {
      workerSrc: string;
    };
  };
}

declare module 'react-pdf/dist/Page/AnnotationLayer.css';
declare module 'react-pdf/dist/Page/TextLayer.css';
