<template>
  <ion-page>
    <ion-content :fullscreen="true" class="profile-content">
      <div class="pb-28">

        <!-- Header -->
        <div class="flex items-center px-4 pt-12 pb-4">
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

        <!-- Avatar & Info -->
        <div class="flex flex-col items-center py-6 px-4">
          <div class="relative mb-4">
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
          <h2 class="text-2xl font-extrabold text-gray-900">
            {{ currentUser?.displayName || emailToName(currentUser?.email) }}
          </h2>
          <p class="text-gray-500 text-sm mt-1">{{ currentUser?.email || '' }}</p>
        </div>

        <!-- Stats -->
        <div class="mx-4 grid grid-cols-3 gap-3 mb-6">
          <div class="bg-cyan-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-cyan-600">{{ store.activeTasks.length }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Active</span>
          </div>
          <div class="bg-green-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-green-600">{{ store.completedTasks.length }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Completed</span>
          </div>
          <div class="bg-purple-50 rounded-2xl p-4 flex flex-col items-center">
            <span class="text-2xl font-extrabold text-purple-600">{{ classroomTasks.length }}</span>
            <span class="text-xs text-gray-500 font-medium mt-1 text-center">Classroom</span>
          </div>
        </div>

        <!-- GOOGLE CLASSROOM SECTION -->
        <div class="mx-4 mb-6">
          <h3 class="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48" class="flex-shrink-0">
              <path fill="#0F9D58" d="M42 38V10c0-2.2-1.8-4-4-4H10c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4z"/>
              <path fill="#FFF" d="M34 40H14v-2c0-3.3 4.5-6 10-6s10 2.7 10 6v2z"/>
              <circle fill="#FFF" cx="24" cy="26" r="5"/>
            </svg>
            Google Classroom
          </h3>

          <!-- Not Connected -->
          <div v-if="!classroomConnected" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-gray-600 text-sm mb-4">
              Connect Google Classroom to automatically import your assignments as tasks.
            </p>
            <button
              @click="handleClassroomAuth"
              :disabled="classroomLoading"
              class="w-full flex items-center justify-center gap-3 bg-[#1a73e8] text-white py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              <ion-spinner v-if="classroomLoading" name="crescent" class="text-white w-5 h-5"></ion-spinner>
              <span v-else>Connect Google Classroom</span>
            </button>
          </div>

          <!-- Connected -->
          <div v-else class="space-y-3">
            <div class="bg-green-50 rounded-2xl border border-green-200 p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <ion-icon :icon="checkmarkCircleOutline" class="text-green-500 text-2xl"></ion-icon>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-green-800 text-sm">Classroom Connected</p>
                  <p class="text-green-600 text-xs mt-0.5">
                    {{ connectedCourses.length }} course{{ connectedCourses.length !== 1 ? 's' : '' }} synced
                  </p>
                </div>
                <button
                  @click="handleSyncNow"
                  :disabled="classroomLoading"
                  class="px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1"
                >
                  <ion-spinner v-if="classroomLoading" name="crescent" class="w-3 h-3 text-white"></ion-spinner>
                  <template v-else>
                    <ion-icon :icon="syncOutline" class="text-sm"></ion-icon>
                    Sync
                  </template>
                </button>
              </div>
            </div>

            <p v-if="lastSyncTime" class="text-xs text-gray-400 px-1">
              Last synced: {{ lastSyncTime }} · {{ classroomTasks.length }} tasks imported
            </p>

            <div v-if="connectedCourses.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                v-for="(course, index) in connectedCourses"
                :key="course.id"
                class="flex items-center gap-3 px-4 py-3"
                :class="{ 'border-t border-gray-100': index > 0 }"
              >
                <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  :style="{ backgroundColor: getCourseColor(index) }"
                >
                  {{ course.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 text-sm truncate">{{ course.name }}</p>
                  <p v-if="course.section" class="text-xs text-gray-400 truncate">{{ course.section }}</p>
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {{ courseTaskCounts[course.name] || 0 }} tasks
                </span>
              </div>
            </div>

            <div v-if="classroomTasks.length > 0">
              <div class="flex items-center justify-between mt-4 mb-2 px-1">
                <h4 class="text-sm font-bold text-gray-600">Imported Assignments</h4>
                <span class="text-xs text-gray-400">{{ classroomTasks.length }} total</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="task in classroomTasks.slice(0, showAllClassroom ? 999 : 5)"
                  :key="task.id"
                  class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
                >
                  <button
                    class="w-5 h-5 rounded-full border-2 border-blue-400 flex-shrink-0 flex items-center justify-center active:bg-green-100 transition-colors"
                    @click="handleComplete(task.id)"
                  ></button>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm text-gray-800 truncate">
                      {{ task.title.replace('[Classroom] ', '') }}
                    </p>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">CLASSROOM</span>
                      <span v-if="task.date" class="text-xs text-gray-400">Due {{ formatDate(task.date) }}</span>
                      <span v-if="task.startTime" class="text-xs text-gray-400">{{ task.startTime }}</span>
                    </div>
                  </div>
                  <ion-icon :icon="schoolOutline" class="text-blue-400 text-lg flex-shrink-0"></ion-icon>
                </div>

                <button
                  v-if="classroomTasks.length > 5"
                  @click="showAllClassroom = !showAllClassroom"
                  class="w-full py-2 text-center text-sm font-semibold text-blue-500"
                >
                  {{ showAllClassroom ? 'Show less' : `Show all ${classroomTasks.length} tasks` }}
                </button>
              </div>
            </div>

            <button
              @click="handleDisconnect"
              class="w-full py-3 text-center text-red-400 text-sm font-medium active:text-red-600 transition-colors mt-2"
            >
              Disconnect Classroom
            </button>
          </div>
        </div>

        <!-- Favorite Labels -->
        <div class="mx-4 mb-6">
          <h3 class="text-base font-bold text-gray-700 mb-3">Favorite Labels</h3>
          <div v-if="favoriteLabels.length === 0" class="text-sm text-gray-400">
            No favorite labels yet.
          </div>
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

        <!-- Menu Items -->
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

    <!-- Settings Sheet -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonSpinner, toastController, alertController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  settingsOutline, cameraOutline, pricetagOutline, chevronForward,
  logOutOutline, notificationsOutline, schoolOutline, syncOutline,
  searchOutline, checkmarkCircleOutline, barChartOutline,
  optionsOutline as filtersIcon,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { useAuth } from '@/composables/useAuth';

import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import {
  authorizeClassroom,
  isClassroomAuthorized,
  revokeClassroom,
  pullClassroomAssignments,
  fetchCourses,
  type ClassroomTask,
} from '@/services/googleClassroom';

const router = useRouter();
const store = useTaskStore();
const { user: currentUser, logout } = useAuth();

const showSettings = ref(false);
const showAllClassroom = ref(false);

const classroomConnected = ref(false);
const classroomLoading = ref(false);
const connectedCourses = ref<Array<{ id: string; name: string; section?: string }>>([]);
const lastSyncTime = ref<string | null>(null);

const classroomTasks = computed(() =>
  store.activeTasks.filter((t) => t.title.startsWith('[Classroom]'))
);

const courseTaskCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const task of classroomTasks.value) {
    if (task.subtasks && task.subtasks.length > 0) {
      const courseName = task.subtasks[0]?.title;
      if (courseName) {
        counts[courseName] = (counts[courseName] || 0) + 1;
      }
    }
  }
  return counts;
});

const courseColors = ['#4285F4', '#34A853', '#EA4335', '#FBBC05', '#8E24AA', '#00ACC1', '#FF7043', '#5C6BC0', '#26A69A', '#EC407A'];
function getCourseColor(index: number): string {
  return courseColors[index % courseColors.length];
}

// ==========================================
// SMART MATCHING
// ==========================================

function normalizeTitle(title: string): string {
  return title.replace(/^\[Classroom\]\s*/i, '').trim().toLowerCase();
}

function findMatchingTask(assignmentTitle: string, courseName: string) {
  const normalizedAssignment = normalizeTitle(assignmentTitle);

  for (const task of store.tasks) {
    const normalizedTask = normalizeTitle(task.title);
    if (normalizedTask !== normalizedAssignment) continue;

    const taskCourseName = task.subtasks?.[0]?.title?.toLowerCase() || '';
    const matchesCourse = !taskCourseName || taskCourseName === courseName.toLowerCase();

    if (matchesCourse) {
      return {
        found: true,
        isActive: !task.completed,
        isCompleted: task.completed,
        taskId: task.id,
      };
    }
  }

  return { found: false, isActive: false, isCompleted: false, taskId: null };
}

/**
 * User-friendly popup for completed-but-not-turned-in assignments
 */
async function askReAddTask(title: string, courseName: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    const alert = await alertController.create({
      header: '⚠️ Not Turned In Yet',
      subHeader: title,
      message: `This assignment from "${courseName}" is marked as done in your app, but hasn't been turned in on Google Classroom.\n\nWould you like to add it back to your tasks as a reminder?`,
      buttons: [
        {
          text: 'No, Skip',
          role: 'cancel',
          cssClass: 'alert-button-skip',
          handler: () => resolve(false),
        },
        {
          text: 'Yes, Add Back',
          cssClass: 'alert-button-add',
          handler: () => resolve(true),
        },
      ],
    });
    await alert.present();
  });
}

onMounted(async () => {
  if (isClassroomAuthorized()) {
    classroomConnected.value = true;
    try {
      connectedCourses.value = await fetchCourses();
      await syncClassroomTasks();
    } catch (err) {
      console.warn('Failed to fetch courses on mount:', err);
      classroomConnected.value = false;
    }
  }
});

async function handleClassroomAuth() {
  classroomLoading.value = true;
  try {
    await authorizeClassroom();
    classroomConnected.value = true;
    connectedCourses.value = await fetchCourses();
    await syncClassroomTasks();

    const toast = await toastController.create({
      message: `✅ Connected! Found ${connectedCourses.value.length} courses`,
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
  } catch (err: any) {
    console.error('Classroom auth failed:', err);
    const toast = await toastController.create({
      message: `❌ ${err.message || 'Failed to connect'}`,
      duration: 2500,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  } finally {
    classroomLoading.value = false;
  }
}

// ==========================================
// SMART SYNC
// ==========================================
async function syncClassroomTasks() {
  classroomLoading.value = true;
  try {
    const assignments = await pullClassroomAssignments();

    let newCount = 0;
    let reAddCount = 0;
    let skippedCount = 0;

    for (const a of assignments) {
      const match = findMatchingTask(a.title, a.courseName);

      // Already active → skip
      if (match.found && match.isActive) {
        skippedCount++;
        continue;
      }

      // Completed in app but not turned in → ask user
      if (match.found && match.isCompleted) {
        const wantReAdd = await askReAddTask(a.title, a.courseName);
        if (!wantReAdd) {
          skippedCount++;
          continue;
        }
        reAddCount++;
      }

      // New or re-add → create task
      const taggedTitle = `[Classroom] ${a.title}`;

      await store.addTask({
        title: taggedTitle,
        category: 'Work',
        date: a.dueDate,
        startTime: a.dueTime,
        endTime: null,
        duration: null,
        priority: a.dueDate ? 'medium' : 'low',
        routine: null,
        completed: false,
        subtasks: [
          { id: Date.now().toString() + Math.random(), title: a.courseName, completed: false },
        ],
      });

      if (!match.found) newCount++;
    }

    lastSyncTime.value = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const parts = [];
    if (newCount > 0) parts.push(`${newCount} new`);
    if (reAddCount > 0) parts.push(`${reAddCount} re-added`);

    const toast = await toastController.create({
      message: parts.length > 0
        ? `📚 ${parts.join(', ')} assignment${(newCount + reAddCount) !== 1 ? 's' : ''}`
        : '✅ Everything is up to date',
      duration: 2000,
      position: 'bottom',
      color: parts.length > 0 ? 'primary' : undefined,
    });
    await toast.present();
  } catch (err: any) {
    console.error('Sync failed:', err);
    if (err.message?.includes('expired') || err.message?.includes('authorize')) {
      classroomConnected.value = false;
      revokeClassroom();
    }
    const toast = await toastController.create({
      message: `❌ Sync failed: ${err.message || 'Unknown error'}`,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });
    await toast.present();
  } finally {
    classroomLoading.value = false;
  }
}

async function handleSyncNow() {
  await syncClassroomTasks();
}

async function handleComplete(taskId: string) {
  await store.toggleComplete(taskId);
  const toast = await toastController.create({
    message: '✅ Task completed!',
    duration: 1500,
    position: 'bottom',
    color: 'success',
  });
  await toast.present();
}

function handleDisconnect() {
  revokeClassroom();
  classroomConnected.value = false;
  connectedCourses.value = [];
  lastSyncTime.value = null;
}

const favoriteLabels = ref<Array<{ name: string; bg: string; text: string }>>([]);
let unsubscribeLabels: any = null;

const getThemeFromColor = (ionicColor: string) => {
  const themes: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-700' },
    secondary: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    tertiary: { bg: 'bg-purple-100', text: 'text-purple-700' },
    success: { bg: 'bg-green-100', text: 'text-green-700' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
    danger: { bg: 'bg-red-100', text: 'text-red-500' },
    medium: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };
  return themes[ionicColor] || themes['medium'];
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (unsubscribeLabels) unsubscribeLabels();
      const q = query(
        collection(db, 'labels'),
        where('userId', '==', user.uid),
        where('isFavorite', '==', true)
      );
      unsubscribeLabels = onSnapshot(q, (snapshot) => {
        favoriteLabels.value = snapshot.docs.map((doc) => {
          const data = doc.data();
          const theme = getThemeFromColor(data.color || 'medium');
          return { name: data.name, bg: theme.bg, text: theme.text };
        });
      });
    } else {
      favoriteLabels.value = [];
    }
  });
});

onUnmounted(() => {
  if (unsubscribeLabels) unsubscribeLabels();
});

function emailToName(email?: string | null): string {
  if (!email) return 'User';
  const local = email.split('@')[0];
  return local.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function handleSignOut() {
  showSettings.value = false;
  revokeClassroom();
  await logout();
  router.replace('/login');
}

interface MenuItem {
  label: string;
  icon: string;
  action: (() => void) | null;
}

const menuItems: MenuItem[] = [
  { label: 'Search',           icon: searchOutline,          action: () => router.push('/search') },
  { label: 'Filters & Labels', icon: filtersIcon,            action: () => router.push('/filters-labels') },
  { label: 'Completed',        icon: checkmarkCircleOutline, action: () => router.push('/completed') }, // ✅ แก้ตรงนี้
  { label: 'Analytics',        icon: barChartOutline,        action: null },
];

</script>

<style scoped>
.profile-content {
  --background: #f9fafb;
}
.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.3s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .relative,
.sheet-leave-to .relative {
  transform: translateY(100%);
}
</style>