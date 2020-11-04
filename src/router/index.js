import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/layout'

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  },

  {
    path: '/manage',
    component: Layout,
    meta: { title: '数据管理', icon: 'data' },
    redirect: '/manage/user',
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        path: 'goods',
        name: 'Goods',
        component: () => import('@/views/goods/index.vue'),
        meta: { title: '商品管理', icon: 'goods' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('@/views/category/index.vue'),
        meta: { title: '分类管理', icon: 'category' }
      },
      {
        path: 'order',
        name: 'OrderList',
        component: () => import('@/views/order/index.vue'),
        meta: { title: '订单管理', icon: 'order' }
      },
      {
        path: 'university',
        name: 'University',
        component: () => import('@/views/university/index.vue'),
        meta: { title: '高校管理', icon: 'school' }
      }
    ]
  },

  {
    path: '/admin',
    component: Layout,
    redirect: '/admin/list',
    meta: { title: '管理员管理', icon: 'admin' },
    children: [
      {
        path: 'list',
        name: 'AdminList',
        component: () => import('@/views/admin/index.vue'),
        meta: { title: '管理员列表', icon: 'admin' }
      },
      {
        path: 'update-pwd',
        name: 'UpdatePwd',
        component: () => import('@/views/admin/update-pwd/index'),
        meta: { title: '修改密码', icon: 'update-pwd' }
      }
    ]
  },

  {
    path: '/statistics',
    component: Layout,
    redirect: '/statistics/details',
    children: [
      {
        path: 'details',
        name: 'StatisticsDetails',
        component: () => import('@/views/statistics/index.vue'),
        meta: { title: '统计', icon: 'statistics' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
