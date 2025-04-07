import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './assets/styles/main.css'; // 如果存在的话

// 创建Pinia实例
const pinia = createPinia();

// 创建Vue应用
const app = createApp(App);

// 使用插件
app.use(pinia);

// 挂载应用
app.mount('#app');