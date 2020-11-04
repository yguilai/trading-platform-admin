import Vue from 'vue'

// 重置浏览器默认样式
import 'normalize.css/normalize.css'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 全局样式
import '@/styles/index.scss'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // SVG图标
import '@/permission' // 权限控制

Vue.use(ElementUI)

Vue.config.productionTip = false

// composeImageUrl全局过滤器, 给图片链接添加上cdn
Vue.filter('composeImageUrl', val => {
  return process.env.VUE_APP_QINIU_CDN + val
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
