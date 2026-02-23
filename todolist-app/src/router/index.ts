// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import TabsPage from '@/views/TabsPage.vue';
import { auth } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
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
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// ✅ รอ Firebase auth พร้อมก่อนเสมอ (แก้ race condition)
let authReady = false;
let currentUser: any = null;

const authReadyPromise = new Promise<void>((resolve) => {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (!authReady) {
      authReady = true;
      resolve();
    } else {
      currentUser = user;
    }
  });
});

router.beforeEach(async (to) => {
  // รอให้ Firebase auth พร้อมก่อนเสมอ
  await authReadyPromise;

  if (to.meta.requiresAuth && !currentUser) {
    return { path: '/login' };
  }

  if (to.meta.requiresGuest && currentUser) {
    return { path: '/tabs/inbox' };
  }
});

export default router;