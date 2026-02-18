// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/tabs/inbox',
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/inbox' },
      { path: 'inbox', component: () => import('@/views/InboxPage.vue') },
      { path: 'today', component: () => import('@/views/TodayPage.vue') },
      { path: 'upcoming', component: () => import('@/views/UpcomingPage.vue') },
      { path: 'browse', component: () => import('@/views/BrowsePage.vue') },
    ],
  },
  {
    path: '/new-task',
    component: () => import('@/views/NewTaskPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
