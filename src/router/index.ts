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
      { path: 'profile', component: () => import('@/views/ProfilePage.vue') },
    ],
  },
  {
    path: '/new-task',
    component: () => import('@/views/NewTaskPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    redirect: '/tabs/profile',
  },
  {
    path: '/notifications',
    component: () => import('@/views/NotificationsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/search',
    component: () => import('@/views/SearchPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/filters-labels',
    component: () => import('@/views/FiltersLabelsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/manage-filters',
    component: () => import('@/views/ManageFiltersPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/manage-labels',
    component: () => import('@/views/ManageLabelsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/add-filter',
    component: () => import('@/views/AddFilterPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/add-label',
    component: () => import('@/views/AddLabelPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-filter/:id',
    component: () => import('@/views/EditFilterPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/edit-label/:id',
    component: () => import('@/views/EditLabelPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/completed',
    component: () => import('@/views/CompletedPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    component: () => import('@/views/AnalyticsPage.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/label/:id', 
    component: () => import('@/views/LabelDetailPage.vue'),
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
  await authReadyPromise;

  if (to.meta.requiresAuth && !currentUser) {
    return { path: '/login' };
  }

  if (to.meta.requiresGuest && currentUser) {
    return { path: '/tabs/inbox' };
  }
});

export default router;
