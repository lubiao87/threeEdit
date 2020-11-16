import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from '@/store/index'

//公共css
import './assets/css/base.css';

// 引入element
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// import Avue from '@smallwei/avue';
// import '@smallwei/avue/lib/index.css';
// Vue.use(Avue);

//引入fontawesome
import 'font-awesome/css/font-awesome.min.css'

// Vue.prototype.ModelUrlServe = "http://172.16.14.225:9199/result/"
// Vue.prototype.ModelUrlServe =  "http://reparo.okaygis.com:10092/result/"

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
