// global.d.ts
import 'react';

declare module 'react' {
  interface CSSProperties {
    '--container-bg'?: string; // 添加自定义 CSS 变量
  }
}