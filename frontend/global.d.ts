/// <reference types="next" />
/// <reference types="next/image-types/global" />


declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BACKEND_URL?: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.sass' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
