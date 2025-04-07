/// <reference types="vite/client" />

// 声明Vue模块
declare module 'vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明Pinia模块
declare module 'pinia' {
  export function defineStore(id: string, options: any): any
  export function createPinia(): any
}

// 声明Vue Router模块
declare module 'vue-router' {
  export function createRouter(options: any): any
  export function createWebHashHistory(): any
  export function useRouter(): any
}

// 声明Element Plus模块
declare module 'element-plus' {
  const ElementPlus: any
  export default ElementPlus
}

// 声明Element Plus Icons模块
declare module '@element-plus/icons-vue' {
  import { Component } from 'vue'
  
  export const Document: Component
  export const VideoPlay: Component
  export const List: Component
  export const User: Component
  export const Grid: Component // 使用Grid替代Collection
  
  // 支持动态访问
  const components: Record<string, Component>
  export { components }
}

// 解决 import.meta.hot 类型问题
interface ImportMeta {
  readonly hot?: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    prune(cb: () => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}
