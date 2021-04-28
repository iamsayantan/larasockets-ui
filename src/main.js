import Vue from 'vue'
import App from './App.vue'
import router from './router'

import Axios from './plugins/axios'

Vue.config.productionTip = false

Vue.use(Axios, {
  tls: process.env.VUE_APP_TLS,
  host: process.env.VUE_APP_SERVER_HOST,
  port: process.env.VUE_APP_SERVER_PORT
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
