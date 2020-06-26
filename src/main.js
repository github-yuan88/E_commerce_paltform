import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体样式
import './assets/fonts/iconfont.css'
// 导入全局样式
import './assets/css/global.css'
// 导入axios
import axios from 'axios'
// 导入树形图
import TreeTable from 'vue-table-with-tree-grid'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios请求拦截
axios.interceptors.request.use(config => {
  console.log(config)
  // 为请求头对象，添加token验证的 authorization
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 固定写法
  return config
})
// 把axios包挂载到vue原型对象上
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 手动注册
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
