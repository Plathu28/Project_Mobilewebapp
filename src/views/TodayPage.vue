<template>
  <ion-page>
    <ion-content :fullscreen="true" class="today-content">
      <div class="pb-28 px-4 pt-2">

        <!-- Header -->
        <header class="mb-6 mt-6">
          <div class="flex items-baseline gap-3">
            <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Today</h1>
            <span class="text-lg text-gray-400 font-semibold">{{ todayLabel }}</span>
          </div>
          <p class="text-green-500 text-base font-semibold mt-1">
            {{ store.todayTasks.length }} task{{ store.todayTasks.length !== 1 ? 's' : '' }}
          </p>
        </header>

        <!-- Empty State -->
        <div v-if="store.todayTasks.length === 0 && !store.loading" class="text-center py-16">
          <ion-icon :icon="sunnyOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
          <p class="text-gray-400 text-lg font-medium">No tasks for today</p>
          <p class="text-gray-400 text-sm mt-1">Enjoy your free day!</p>
        </div>

        <!-- Timeline -->
        <div v-else class="relative" :style="{ height: totalTimelineHeight + 'px' }">
          <!-- Hour grid lines + labels -->
          <div
            v-for="hour in timelineHours"
            :key="'grid-' + hour"
            class="absolute left-0 right-0"
            :style="{ top: getHourTop(hour) + 'px' }"
          >
            <!-- Time label -->
            <div class="absolute left-0 w-14 text-right pr-3 -translate-y-1/2">
              <span class="text-xs text-gray-400 font-medium">{{ formatHour(hour) }}</span>
            </div>
            <!-- Horizontal line -->
            <div class="absolute left-16 right-0 h-px bg-gray-200"></div>
          </div>

          <!-- Vertical line -->
          <div
            class="absolute bg-gray-200 w-px"
            :style="{ left: '64px', top: '0', bottom: '0' }"
          ></div>

          <!-- Current time indicator -->
          <div
            v-if="isToday && currentTimeTop >= 0 && currentTimeTop <= totalTimelineHeight"
            class="absolute left-14 right-0 flex items-center z-20"
            :style="{ top: currentTimeTop + 'px' }"
          >
            <div class="w-2.5 h-2.5 bg-red-500 rounded-full -ml-1.5"></div>
            <div class="flex-1 h-0.5 bg-red-500"></div>
          </div>

          <!-- Task blocks (absolute positioned) -->
          <div
            v-for="task in positionedTasks"
            :key="task.id"
            class="absolute rounded-xl border-l-4 overflow-hidden cursor-pointer active:opacity-80 transition-opacity"
            :class="getTaskBlockStyle(task)"
            :style="{
              top: task._top + 'px',
              height: task._height + 'px',
              left: (72 + task._col * 8) + 'px',
              right: (8 + task._col * 8) + 'px',
            }"
            @click="handleComplete(task.id)"
          >
            <div class="p-3 h-full flex flex-col">
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full flex-shrink-0"
                  :class="getCategoryDotColor(task.category)"
                ></div>
                <span class="font-bold text-sm text-gray-800 truncate flex-1">{{ task.title }}</span>
                <span v-if="task.duration" class="text-xs text-gray-400 flex-shrink-0">
                  {{ formatDuration(task.duration) }}
                </span>
              </div>
              <div v-if="task._height > 60" class="mt-1">
                <span class="text-xs text-gray-500">
                  {{ task.startTime }}{{ task.endTime ? ' – ' + task.endTime : '' }}
                </span>
              </div>
              <!-- Subtasks preview if tall enough -->
              <div v-if="task._height > 90 && task.subtasks && task.subtasks.length > 0" class="mt-2 space-y-1">
                <div
                  v-for="sub in task.subtasks.slice(0, 2)"
                  :key="sub.id"
                  class="flex items-center gap-1.5"
                >
                  <div class="w-2 h-2 rounded-sm border border-gray-300 flex-shrink-0"></div>
                  <span class="text-xs text-gray-500 truncate">{{ sub.title }}</span>
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
              <span class="font-semibold text-gray-800 flex-1">{{ task.title }}</span>
              <span
                class="px-2 py-0.5 rounded text-xs font-bold"
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton, toastController } from '@ionic/vue';
import { add, sunnyOutline } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { Task, CategoryName } from '@/types/task';

const store = useTaskStore();

// ---- Constants ----
const HOUR_HEIGHT = 80; // pixels per hour
const START_HOUR = 6;   // timeline starts at 6:00
const END_HOUR = 24;    // timeline ends at 24:00 (midnight)
const timelineHours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);
const totalTimelineHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

// ---- Today label ----
const todayLabel = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
});

const isToday = true; // This page is always "today"

// ---- Current time indicator ----
const currentTimeTop = ref(0);
let timeInterval: ReturnType<typeof setInterval> | null = null;

function updateCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  const totalMins = hours * 60 + mins;
  const startMins = START_HOUR * 60;
  currentTimeTop.value = ((totalMins - startMins) / 60) * HOUR_HEIGHT;
}

onMounted(() => {
  updateCurrentTime();
  timeInterval = setInterval(updateCurrentTime, 60000); // update every minute
});

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval);
});

// ---- Computed task lists ----
const todayTasksWithTime = computed(() =>
  store.todayTasks.filter((t) => t.startTime)
);

const todayTasksNoTime = computed(() =>
  store.todayTasks.filter((t) => !t.startTime)
);

// ---- Position tasks on timeline ----
interface PositionedTask extends Task {
  _top: number;
  _height: number;
  _col: number; // for overlapping tasks
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

const positionedTasks = computed<PositionedTask[]>(() => {
  const tasks = todayTasksWithTime.value.map((task) => {
    const startMins = timeToMinutes(task.startTime!);

    // Calculate duration in minutes
    let durationMins = task.duration || 60; // default 1h if no duration

    // If we have endTime, use that to calculate duration
    if (task.endTime && !task.duration) {
      const endMins = timeToMinutes(task.endTime);
      if (endMins > startMins) {
        durationMins = endMins - startMins;
      }
    }

    const startOffset = startMins - START_HOUR * 60;
    const top = (startOffset / 60) * HOUR_HEIGHT;
    const height = Math.max(40, (durationMins / 60) * HOUR_HEIGHT); // min 40px

    return {
      ...task,
      _top: top,
      _height: height,
      _col: 0,
      _startMins: startMins,
      _endMins: startMins + durationMins,
    } as PositionedTask & { _startMins: number; _endMins: number };
  });

  // Sort by start time
  tasks.sort((a, b) => a._startMins - b._startMins);

  // Detect overlaps and assign columns
  for (let i = 0; i < tasks.length; i++) {
    for (let j = 0; j < i; j++) {
      // Check if task i overlaps with task j
      if (tasks[i]._startMins < tasks[j]._endMins && tasks[i]._endMins > tasks[j]._startMins) {
        tasks[i]._col = Math.max(tasks[i]._col, tasks[j]._col + 1);
      }
    }
  }

  return tasks;
});

// ---- Helper functions ----
function getHourTop(hour: number): number {
  return (hour - START_HOUR) * HOUR_HEIGHT;
}

function formatHour(h: number): string {
  if (h === 24) return '00:00';
  return `${h.toString().padStart(2, '0')}:00`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
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