declare module '*.vue' {
  import { Component } from 'vue'
  const component: Component
  export default component
}

// 声明Vue 3的Composition API
declare module 'vue' {
  export interface Component {
    name?: string;
    props?: any;
    emits?: string[];
    setup?: Function;
    render?: Function;
  }
  
  export const defineComponent: Function;
  export const ref: Function;
  export const reactive: Function;
  export const computed: Function;
  export const watch: Function;
  export const onMounted: Function;
  export const onUnmounted: Function;
  export const nextTick: Function;
  export const createApp: Function;
  export const PropType: any;
}
