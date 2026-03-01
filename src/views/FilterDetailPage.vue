<template>
  <ion-page>
    <ion-content :fullscreen="true" class="filter-detail-content">
      <div class="pb-28">

        <!-- Header -->
        <div class="flex items-center px-4 pt-12 pb-4">
          <button @click="router.back()"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3 active:scale-90 transition-transform">
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>
          <div class="flex items-center gap-2 flex-1">
            <ion-icon :icon="funnelOutline" :color="filterColor" class="text-xl"></ion-icon>
            <h1 class="text-2xl font-extrabold text-gray-900">{{ filterName }}</h1>
          </div>
          <span class="text-sm text-gray-400 font-medium">{{ filteredTasks.length }} tasks</span>
        </div>

        <!-- Query Badge -->
        <div class="px-4 mb-4">
          <div class="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
            <ion-icon :icon="codeSlashOutline" class="text-blue-400 text-sm"></ion-icon>
            <span class="text-xs text-blue-600 font-mono">{{ filterQuery }}</span>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredTasks.length === 0" class="flex flex-col items-center justify-center mt-20 px-8 text-center">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ion-icon :icon="funnelOutline" class="text-4xl text-gray-300"></ion-icon>
          </div>
          <p class="text-gray-400 text-base font-medium">No tasks match this filter</p>
          <p class="text-gray-300 text-sm mt-1">Try adjusting the filter query</p>
        </div>

        <!-- Grouped Tasks -->
        <div v-else class="px-4">
          <div v-for="group in groupedTasks" :key="group.date" class="mb-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              {{ group.label }}
            </p>

            <div class="space-y-2">
              <div v-for="task in group.tasks" :key="task.id"
                class="bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 flex items-start gap-3">
                <button @click="handleComplete(task.id)"
                  class="mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                  :class="getCategoryBorderColor(task.category)">
                </button>
                <div class="flex-1 min-w-0">
                  <p class="text-base font-semibold text-gray-800 leading-snug">{{ task.title }}</p>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="getCategoryClass(task.category)">
                      {{ task.category }}
                    </span>
                    <span v-if="task.date" class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-500">
                      {{ formatDate(task.date) }}
                    </span>
                    <span v-if="task.startTime" class="text-xs text-gray-400 self-center">{{ task.startTime }}</span>
                    <span v-if="task.priority" class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      :class="{
                        'bg-red-50 text-red-500': task.priority === 'high',
                        'bg-yellow-50 text-yellow-600': task.priority === 'medium',
                        'bg-gray-100 text-gray-500': task.priority === 'low',
                      }">
                      {{ task.priority }}
                    </span>
                    <span v-if="task.routine" class="text-xs text-blue-400 self-center">
                      <ion-icon :icon="repeatOutline" class="text-xs"></ion-icon>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="mb-2 mr-2">
        <ion-fab-button color="dark" router-link="/new-task">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton, toastController } from '@ionic/vue';
import { useRouter, useRoute } from 'vue-router';
import { arrowBack, funnelOutline, codeSlashOutline, repeatOutline, add } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import { matchTasks } from '@/services/filterEngine';
import { db, auth, collection, query, where, onSnapshot } from '@/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Task, CategoryName } from '@/types/task';

const router = useRouter();
const route = useRoute();
const store = useTaskStore();

const filterId = route.params.id as string;
const filterName = ref('');
const filterQuery = ref('');
const filterColor = ref('primary');

// Load filter data
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    const q = query(collection(db, 'filters'), where('userId', '==', user.uid));
    onSnapshot(q, (snapshot) => {
      const found = snapshot.docs.find(d => d.id === filterId);
      if (found) {
        filterName.value = found.data().name;
        filterQuery.value = found.data().query || '';
        filterColor.value = found.data().color || 'primary';
      }
    });
  });
});

const filteredTasks = computed(() => {
  if (!filterQuery.value) return [];
  return matchTasks(store.tasks, filterQuery.value);
});

// Group tasks by date
const groupedTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const groups: Record<string, { label: string; date: string; tasks: Task[] }> = {};

  filteredTasks.value.forEach((task) => {
    const key = task.date || 'no-date';
    if (!groups[key]) {
      let label = '';
      if (key === today) label = 'Today';
      else if (key === tomorrow) label = 'Tomorrow';
      else if (key === 'no-date') label = 'No Date';
      else label = new Date(key + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      groups[key] = { label, date: key, tasks: [] };
    }
    groups[key].tasks.push(task);
  });

  return Object.values(groups).sort((a, b) => {
    if (a.date === 'no-date') return 1;
    if (b.date === 'no-date') return -1;
    return a.date.localeCompare(b.date);
  });
});

function getCategoryBorderColor(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'border-cyan-400', Work: 'border-green-400',
    'Mental Health': 'border-purple-400', Others: 'border-amber-400',
  };
  return map[cat] || 'border-gray-300';
}

function getCategoryClass(cat: CategoryName): string {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-50 text-cyan-600', Work: 'bg-green-50 text-green-600',
    'Mental Health': 'bg-purple-50 text-purple-600', Others: 'bg-amber-50 text-amber-600',
  };
  return map[cat] || 'bg-gray-100 text-gray-500';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

async function handleComplete(taskId: string) {
  await store.toggleComplete(taskId);
  const toast = await toastController.create({ message: '✅ Task completed!', duration: 1500, position: 'bottom', color: 'success' });
  await toast.present();
}
</script>

<style scoped>
.filter-detail-content { --background: #f9fafb; }
</style>
