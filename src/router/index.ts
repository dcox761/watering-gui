import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        name: 'settings',
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        name: 'queue',
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        name: 'programs',
        path: 'tab3',
        component: () => import('@/views/Tab3Page.vue')
      },
      {
        name: 'schedule',
        path: 'tab4',
        component: () => import('@/views/Tab4Page.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
