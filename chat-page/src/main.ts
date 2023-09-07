import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import { createPinia } from 'pinia'
import 'viewerjs/dist/viewer.css';
import Viewer from 'v-viewer'

const app = createApp(App)
app.use(ElementPlus)
app.use(createPinia())
// 图片预览插件
app.use(Viewer);
app.use(router).mount('#app')
