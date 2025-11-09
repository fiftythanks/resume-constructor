declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.scss';

declare module '*.ttf' {
  const content: string;
  export default content;
}

// A fix for a "Cannot find module 'pdfjs-dist/webpack' or its corresponding type declarations" error when importing from "pdfjs-dist/webpack".
declare module 'pdfjs-dist/webpack';
