import 'vue'

// 扩展 Vue 的 ComponentCustomProperties 
declare module 'vue' {
  export interface ComponentCustomProperties {
    $router: any;
    $route: any;
    $store: any;
  }
  
  // 确保setup语法中定义的变量和方法在模板中可用
  export interface ComponentCustomOptions {
    setup?: (props: any, ctx: any) => Record<string, any>;
  }
}

// 声明Vue单文件组件
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
