// 自定义声明文件，为缺少类型定义的模块提供类型支持

// Element Plus
declare module 'element-plus' {
  const ElementPlus: any;
  export default ElementPlus;
}

// Element Plus Icons
declare module '@element-plus/icons-vue' {
  import { Component } from 'vue';
  
  // 导出常用的图标组件
  export const Document: Component;
  export const VideoPlay: Component;
  export const List: Component;
  export const User: Component;
  export const Grid: Component;
  export const Menu: Component;
  export const Setting: Component;
  export const Search: Component;
  export const Refresh: Component;
  export const Plus: Component;
  export const Delete: Component;
  export const Edit: Component;
  export const Download: Component;
  export const MoreFilled: Component;
  export const ArrowDown: Component;
  export const ArrowUp: Component;
  export const ArrowLeft: Component;
  export const ArrowRight: Component;
  export const Close: Component;
}

// Vue 3 特定类型如果需要
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: any;
    $route: any;
    $store: any;
  }
}

// 为Vue添加明确的类型声明
declare module 'vue' {
  export const createApp: any;
  export const ref: any;
  export const reactive: any;
  export const computed: any;
  export const watch: any;
  export const onMounted: any;
  export const onUnmounted: any;
  export const defineComponent: any;
  export const nextTick: any;
  export const provide: any;
  export const inject: any;
  export const toRef: any;
  export const toRefs: any;
  export const h: any;
  
  export interface Component {
    name?: string;
    setup?: any;
    render?: any;
    components?: Record<string, Component>;
    props?: any;
    emits?: string[];
    data?: () => any;
    computed?: Record<string, any>;
    methods?: Record<string, any>;
    watch?: Record<string, any>;
    provide?: any;
    inject?: any;
    beforeCreate?: any;
    created?: any;
    beforeMount?: any;
    mounted?: any;
    beforeUpdate?: any;
    updated?: any;
    beforeUnmount?: any;
    unmounted?: any;
    errorCaptured?: any;
  }
}
