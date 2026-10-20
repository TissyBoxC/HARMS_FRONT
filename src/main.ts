/**
 * 前端应用入口
 *
 * 引入全局样式，创建 Vue 应用，注册路由并挂载根组件。
 */
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
