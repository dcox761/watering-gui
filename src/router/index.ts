import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/settings'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/settings'
      },
      {
        name: 'settings',
        path: 'settings',
        component: () => import('@/views/SettingsTabPage.vue')
      },
      {
        name: 'queue',
        path: 'queue',
        component: () => import('@/views/QueueTabPage.vue')
      },
      {
        name: 'programs',
        path: 'programs',
        component: () => import('@/views/ProgramsTabPage.vue')
      },
      {
        name: 'schedule',
        path: 'schedule',
        component: () => import('@/views/ScheduleTabPage.vue')
      },
      {
        name: 'events',
        path: 'events',
        component: () => import('@/views/EventsTabPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
