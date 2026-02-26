<template>
  <ion-page>
    <ion-content :fullscreen="true" class="profile-content">
      <div class="pb-28">

        <!-- Header with back button -->
        <div class="flex items-center px-4 pt-12 pb-4">
          <button @click="router.back()" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3">
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>
          <h1 class="text-2xl font-extrabold text-gray-900">Profile</h1>
          <div class="ml-auto flex items-center gap-2">
            <button
              class="relative w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
              @click="router.push('/notifications')"
            >
              <ion-icon :icon="notificationsOutline" class="text-gray-700 text-xl"></ion-icon>
              <span
                v-if="store.activeTasks.length > 0"
                class="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {{ store.activeTasks.length > 9 ? '9+' : store.activeTasks.length }}
              </span>
            </button>
            <button
              class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 active:scale-90 transition-transform"
              @click="showSettings = true"
            >
              <ion-icon :icon="settingsOutline" class="text-gray-700 text-xl"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Avatar + Name -->
        <div class="flex flex-col items-center py-8 px-4">
          <div class="relative mb-4">
            <!-- แสดง photoURL ถ้ามี (Google login) ไม่งั้นใช้ avatar default -->
            <div class="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img
                :src="currentUser?.photoURL || 'https://api.dicebear.com/9.x/avataaars/svg?seed=' + (currentUser?.email || 'user')"
                alt="User Avatar"
              />
            </div>
            <button class="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center border-2 border-white">
              <ion-icon :icon="cameraOutline" class="text-white text-xs"></ion-icon>
            </button>
          </div>
          <!-- displayName จาก Google หรือ fallback เป็นชื่อจาก email -->
          <h2 class="text-2xl font-extrabold text-gray-900">
            {{ currentUser?.displayName || emailToName(currentUser?.email) }}
          </h2>
          <p class="text-gray-500 text-sm mt-1">{{ currentUser?.email || '' }}</p>
          
        </div>

        <!-- Stats Row -->
        <div class="mx-4 grid grid-cols-3 gap-3 mb-6">
          <div class="bg-cyan-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-cyan-600">{{ store.activeTasks.length }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Active Tasks</span>
          </div>
          <div class="bg-green-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-green-600">{{ store.completedTasks.length }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Completed</span>
          </div>
          <div class="bg-purple-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-purple-600">{{ streakDays }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Day Streak 🔥</span>
          </div>
        </div>

        <!-- Favorites Section -->
        <div class="mx-4 mb-6">
          <h3 class="text-base font-bold text-gray-700 mb-3">Favorite Labels</h3>
          <div class="flex gap-2 flex-wrap">
            <span
              v-for="label in favoriteLabels"
              :key="label.name"
              :class="['px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5', label.bg, label.text]"
            >
              <ion-icon :icon="pricetagOutline" class="text-xs"></ion-icon>
              {{ label.name }}
            </span>
          </div>
        </div>

        <!-- Menu Items (Quick Access) -->
        <div class="mx-4 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              v-for="(item, index) in menuItems"
              :key="item.label"
              class="flex items-center gap-4 px-4 py-4 active:bg-gray-50 transition-colors cursor-pointer"
              :class="{ 'border-t border-gray-100': index > 0 }"
              @click="item.action?.()"
            >
              <ion-icon :icon="item.icon" class="text-2xl text-gray-800 flex-shrink-0"></ion-icon>
              <span class="font-medium text-gray-900 text-base flex-1">{{ item.label }}</span>
              <ion-icon :icon="chevronForward" class="text-gray-300 text-lg"></ion-icon>
            </div>
          </div>
        </div>

      </div>
    </ion-content>

    <!-- Settings Bottom Sheet -->
    <transition name="sheet">
      <div v-if="showSettings" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="showSettings = false"></div>
        <div class="relative bg-white rounded-t-3xl px-4 pt-4 pb-10 z-10">
          <div class="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>
          <h2 class="text-xl font-extrabold text-gray-900 mb-5 px-1">Settings</h2>
          
          <button
            class="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            @click="handleSignOut"
          >
            <ion-icon :icon="logOutOutline" class="text-lg"></ion-icon>
            Sign Out
          </button>
        </div>
      </div>
    </transition>

  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonContent, IonIcon } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  arrowBack, settingsOutline, cameraOutline, pricetagOutline, chevronForward,
  logOutOutline, notificationsOutline,
  searchOutline, checkmarkCircleOutline, barChartOutline, optionsOutline as filtersIcon,
  colorPaletteOutline, lockClosedOutline, helpCircleOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const store = useTaskStore();
const { user: currentUser, logout } = useAuth();

const streakDays = 7;
const showSettings = ref(false);

// แปลง email เป็นชื่อ เช่น "john.doe@gmail.com" → "John Doe"
function emailToName(email?: string | null): string {
  if (!email) return 'User';
  const local = email.split('@')[0];
  return local
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function handleSignOut() {
  showSettings.value = false;
  await logout();
  router.replace('/login');
}

const favoriteLabels = [
  { name: 'Drawing', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { name: 'Workout', bg: 'bg-red-100', text: 'text-red-500' },
];

interface MenuItem {
  label: string;
  icon: string;
  action: (() => void) | null;
}

const menuItems: MenuItem[] = [
  { label: 'Search',           icon: searchOutline,          action: () => router.push('/search') },
  { label: 'Filters & Labels', icon: filtersIcon,            action: null },
  { label: 'Completed',        icon: checkmarkCircleOutline, action: null },
  { label: 'Analytics',        icon: barChartOutline,        action: null },
];


</script>

<style scoped>
.profile-content { --background: #f9fafb; }
.sheet-enter-active, .sheet-leave-active { transition: all 0.3s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .relative, .sheet-leave-to .relative { transform: translateY(100%); }
</style>