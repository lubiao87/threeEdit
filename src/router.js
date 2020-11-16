import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      redirect: "/home"
    },
    {
      path: '/home',
      name: 'home',
      component: () => import("./views/home/Home.vue"),
    },
    {
      path: '/modelEdit',
      name: 'modelEdit',
      component: () => import("./views/modelEdit/index.vue"),
      meta: {
        auth: false, // 这里设置，当前路由需要校验
        keepAlive: true
      },
    },
  ]
})
