<template>
  <ion-page>
    <ion-content :fullscreen="true" class="completed-content">
      <div class="pb-28">

        <!-- Header -->
        <div class="flex items-center px-4 pt-12 pb-4">
          <button @click="router.back()" class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3">
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>
          <h1 class="text-2xl font-extrabold text-gray-900">Completed</h1>
          <span class="ml-3 px-2.5 py-0.5 bg-green-100 text-green-700 text-sm font-bold rounded-full">
            {{ store.completedTasks.length }}
          </span>
        </div>

        <!-- Empty State -->
        <div v-if="store.completedTasks.length === 0" class="flex flex-col items-center justify-center mt-24 px-8 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ion-icon :icon="checkmarkDoneOutline" class="text-4xl text-gray-300"></ion-icon>
          </div>
          <p class="text-gray-400 text-base font-medium">No completed tasks yet</p>
          <p class="text-gray-300 text-sm mt-1">Tasks you complete will appear here</p>
        </div>

        <!-- Completed Tasks List -->
        <div v-else class="px-4 space-y-3">

          <!-- Group by date -->
          <div v-for="group in groupedTasks" :key="group.date">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">
              {{ group.label }}
            </p>

            <div
              v-for="task in group.tasks"
              :key="task.id"
              class="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-start gap-3"
            >
              <!-- Checkmark -->
              <button
                @click="store.toggleComplete(task.id)"
                class="mt-0.5 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
              >
                <ion-icon :icon="checkmark" class="text-white text-sm"></ion-icon>
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <p class="text-base font-semibold text-gray-400 line-through leading-snug">
                  {{ task.title }}
                </p>

                <!-- Meta -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="getCategoryClass(task.category)">
                    {{ task.category }}
                  </span>
                  <span v-if="task.date" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-500">
                    {{ formatDate(task.date) }}
                  </span>
                  <span v-if="task.priority" class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="{
                      'bg-red-50 text-red-500': task.priority === 'high',
                      'bg-yellow-50 text-yellow-600': task.priority === 'medium',
                      'bg-gray-100 text-gray-500': task.priority === 'low',
                    }">
                    {{ task.priority }}
                  </span>
                </div>

                <!-- Subtasks -->
                <div v-if="task.subtasks?.length > 0" class="mt-2 space-y-1">
                  <div v-for="sub in task.subtasks" :key="sub.id" class="flex items-center gap-1.5">
                    <div class="w-3.5 h-3.5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                      <ion-icon :icon="checkmark" class="text-green-600 text-[8px]"></ion-icon>
                    </div>
                    <span class="text-xs text-gray-400 line-through">{{ sub.title }}</span>
                  </div>
                </div>
              </div>

              <!-- Delete -->
              <button
                @click="confirmDelete(task.id)"
                class="mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 active:scale-90 transition-all flex-shrink-0"
              >
                <ion-icon :icon="trashOutline" class="text-base"></ion-icon>
              </button>
            </div>

          </div>

          <!-- Clear All -->
          <button
            @click="confirmClearAll"
            class="w-full mt-4 py-3.5 border border-red-200 rounded-2xl text-red-400 text-sm font-bold active:scale-95 transition-transform"
          >
            Clear All Completed
          </button>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonPage, IonContent, IonIcon, alertController } from '@ionic/vue';
import { useRouter } from 'vue-router';
import {
  arrowBack, checkmark, checkmarkDoneOutline, trashOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { CategoryName } from '@/types/task';

const router = useRouter();
const store = useTaskStore();

// ---- Group tasks by date ----
const groupedTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const groups: Record<string, { label: string; date: string; tasks: typeof store.completedTasks }> = {};

  store.completedTasks.forEach((task) => {
    const key = task.date || 'no-date';
    if (!groups[key]) {
      let label = '';
      if (key === today) label = 'Today';
      else if (key === yesterday) label = 'Yesterday';
      else if (key === 'no-date') label = 'No Date';
      else label = new Date(key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      groups[key] = { label, date: key, tasks: [] };
    }
    groups[key].tasks.push(task);
  });

  // เรียง Today ก่อน ตามด้วยวันล่าสุด
  return Object.values(groups).sort((a, b) => {
    if (a.date === 'no-date') return 1;
    if (b.date === 'no-date') return -1;
    return b.date > a.date ? 1 : -1;
  });
});

// ---- Helpers ----
function getCategoryClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-50 text-cyan-600',
    Work: 'bg-green-50 text-green-600',
    'Mental Health': 'bg-purple-50 text-purple-600',
    Others: 'bg-amber-50 text-amber-600',
  };
  return map[cat] || 'bg-gray-100 text-gray-500';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ---- Actions ----
async function confirmDelete(taskId: string) {
  const alert = await alertController.create({
    header: 'Delete Task',
    message: 'Are you sure you want to delete this task?',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: () => store.deleteTask(taskId),
      },
    ],
  });
  await alert.present();
}

async function confirmClearAll() {
  const alert = await alertController.create({
    header: 'Clear All',
    message: 'Delete all completed tasks? This cannot be undone.',
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Clear All',
        role: 'destructive',
        handler: () => {
          store.completedTasks.forEach((t) => store.deleteTask(t.id));
        },
      },
    ],
  });
  await alert.present();
}
</script>

<style scoped>
.completed-content { --background: #f9fafb; }
</style>