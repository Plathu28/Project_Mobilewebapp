<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding today-content">
      <div class="pb-28 px-4 pt-2">

        <!-- Header -->
        <header class="mb-6 mt-6">
          <div class="flex items-baseline gap-3">
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Today</h1>
            <span class="text-xl font-bold text-gray-400">{{ currentDate }}</span>
          </div>
          <p class="text-blue-400 text-xl font-semibold mt-1">
            {{ todayTasksWithTime.length }} task{{ todayTasksWithTime.length !== 1 ? 's' : '' }}
          </p>
        </header>

        <!-- Empty State -->
        <div v-if="store.todayTasks.length === 0 && !store.loading" class="text-center py-16">
          <ion-icon :icon="sunnyOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-400 text-lg font-medium">No tasks for today</p>
          <p class="text-gray-400 text-sm mt-1">Enjoy your free day!</p>
        </div>

        <!-- Timeline -->
        <div v-else class="relative">
          <div
            v-for="hour in timelineHours"
            :key="hour"
            class="flex min-h-[60px] relative"
          >
            <!-- Time Label -->
            <div class="w-14 text-right pr-3 pt-0 flex-shrink-0">
              <span class="text-xs text-gray-400 font-medium">{{ formatHour(hour) }}</span>
            </div>

            <!-- Line -->
            <div class="absolute left-14 top-0 bottom-0 w-px bg-gray-200"></div>

            <!-- Task Block -->
            <div class="flex-1 pl-4 relative">
              <div
                v-for="task in getTasksAtHour(hour)"
                :key="task.id"
                :class="[
                  'rounded-xl p-3 mb-1 border-l-4',
                  getTaskBlockStyle(task),
                ]"
                :style="{ minHeight: getBlockHeight(task) + 'px' }"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :class="getCategoryDotColor(task.category)"
                  ></div>
                  <span class="font-bold text-sm text-gray-800 truncate">{{ task.title }}</span>
                  <span v-if="task.duration" class="ml-auto text-xs text-gray-400">
                    {{ formatDuration(task.duration) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tasks without time -->
        <div v-if="todayTasksNoTime.length > 0" class="mt-8">
          <h3 class="text-lg font-bold text-gray-700 mb-3">Unscheduled</h3>
          <div class="space-y-3">
            <div
              v-for="task in todayTasksNoTime"
              :key="task.id"
              class="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <button
                class="w-5 h-5 rounded-full border-2 flex-shrink-0"
                :class="getCategoryBorderColor(task.category)"
                @click="handleComplete(task.id)"
              ></button>
              <span class="font-semibold text-gray-800">{{ task.title }}</span>
              <span
                class="ml-auto px-2 py-0.5 rounded text-xs font-bold"
                :class="getCategoryBadgeClass(task.category)"
              >
                {{ task.category.toUpperCase() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mb-2 mr-2">
        <ion-fab-button color="dark" router-link="/new-task">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton, toastController } from '@ionic/vue';
import { add, sunnyOutline } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { Task, CategoryName } from '@/types/task';

const store = useTaskStore();

const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'short', 
  month: 'short', 
  day: 'numeric' 
});

const timelineHours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 - 23:00

const todayTasksWithTime = computed(() =>
  store.todayTasks.filter((t) => t.startTime)
);

const todayTasksNoTime = computed(() =>
  store.todayTasks.filter((t) => !t.startTime)
);

function getTasksAtHour(hour: number): Task[] {
  return todayTasksWithTime.value.filter((t) => {
    if (!t.startTime) return false;
    const h = parseInt(t.startTime.split(':')[0], 10);
    return h === hour;
  });
}

function formatHour(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function getBlockHeight(task: Task): number {
  if (!task.duration) return 50;
  return Math.max(50, task.duration);
}

function getTaskBlockStyle(task: Task): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-50 border-cyan-400',
    Work: 'bg-green-50 border-green-400',
    'Mental Health': 'bg-purple-50 border-purple-400',
    Others: 'bg-amber-50 border-amber-400',
  };
  return map[task.category] || 'bg-gray-50 border-gray-400';
}

function getCategoryDotColor(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-500',
    Work: 'bg-green-500',
    'Mental Health': 'bg-purple-500',
    Others: 'bg-amber-500',
  };
  return map[cat] || 'bg-gray-500';
}

function getCategoryBorderColor(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'border-cyan-400',
    Work: 'border-green-400',
    'Mental Health': 'border-purple-400',
    Others: 'border-amber-400',
  };
  return map[cat] || 'border-gray-300';
}

function getCategoryBadgeClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-100 text-cyan-700',
    Work: 'bg-green-100 text-green-700',
    'Mental Health': 'bg-purple-100 text-purple-700',
    Others: 'bg-amber-100 text-amber-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
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
</script>

<style scoped>
.today-content {
  --background: #f9fafb;
}
</style>
