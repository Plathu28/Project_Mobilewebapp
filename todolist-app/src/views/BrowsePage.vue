<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding browse-content">
      <div class="pb-28 px-4 pt-2">

        <header class="mb-6 mt-6">
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Browse</h1>
          <p class="text-gray-500 text-lg font-medium mt-1">Tasks by category</p>
        </header>

        <!-- Category Sections -->
        <div v-for="cat in categoryList" :key="cat.name" class="mb-6">
          <div
            :class="['rounded-2xl p-4 mb-3', cat.headerBg]"
            @click="toggleExpand(cat.name)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <ion-icon :icon="cat.ionIcon" class="text-xl text-gray-700"></ion-icon>
                <span class="font-bold text-gray-800 text-lg">{{ cat.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-600">
                  {{ getCategoryTasks(cat.name).length }}
                </span>
                <ion-icon
                  :icon="expanded[cat.name] ? chevronUp : chevronDown"
                  class="text-gray-500"
                ></ion-icon>
              </div>
            </div>
          </div>

          <transition name="slide">
            <div v-if="expanded[cat.name]" class="space-y-2 ml-2">
              <div
                v-for="task in getCategoryTasks(cat.name)"
                :key="task.id"
                class="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <button
                  class="w-5 h-5 rounded-full border-2 flex-shrink-0"
                  :class="cat.borderColor"
                  @click="handleComplete(task.id)"
                ></button>
                <span class="font-semibold text-sm text-gray-800 flex-1 truncate">{{ task.title }}</span>
                <span v-if="task.date" class="text-xs text-gray-400">{{ formatDate(task.date) }}</span>
              </div>

              <div v-if="getCategoryTasks(cat.name).length === 0" class="p-4 text-center">
                <p class="text-gray-400 text-sm">No tasks in this category</p>
              </div>
            </div>
          </transition>
        </div>

        <!-- Completed section -->
        <div v-if="store.completedTasks.length > 0" class="mt-8">
          <div
            class="rounded-2xl p-4 mb-3 bg-gray-100 cursor-pointer"
            @click="showCompleted = !showCompleted"
          >
            <div class="flex items-center justify-between">
              <span class="font-bold text-gray-600 text-lg">Completed</span>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-gray-500">{{ store.completedTasks.length }}</span>
                <ion-icon :icon="showCompleted ? chevronUp : chevronDown" class="text-gray-400"></ion-icon>
              </div>
            </div>
          </div>

          <transition name="slide">
            <div v-if="showCompleted" class="space-y-2 ml-2">
              <div
                v-for="task in store.completedTasks"
                :key="task.id"
                class="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100"
              >
                <div class="w-5 h-5 rounded-full bg-green-400 flex items-center justify-center">
                  <ion-icon :icon="checkmark" class="text-white text-xs"></ion-icon>
                </div>
                <span class="font-semibold text-sm text-gray-500 line-through flex-1 truncate">{{ task.title }}</span>
                <button @click="handleDelete(task.id)" class="text-gray-400">
                  <ion-icon :icon="trashOutline" class="text-sm"></ion-icon>
                </button>
              </div>
            </div>
          </transition>
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
import { ref, reactive } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton, toastController } from '@ionic/vue';
import {
  add, chevronDown, chevronUp, heartOutline, briefcaseOutline,
  happyOutline, folderOutline, checkmark, trashOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { CategoryName } from '@/types/task';

const store = useTaskStore();
const showCompleted = ref(false);

const expanded = reactive<Record<string, boolean>>({
  Health: true, Work: true, 'Mental Health': true, Others: true,
});

const categoryList = [
  { name: 'Health' as CategoryName, headerBg: 'bg-cyan-100', borderColor: 'border-cyan-400', ionIcon: heartOutline },
  { name: 'Work' as CategoryName, headerBg: 'bg-green-100', borderColor: 'border-green-400', ionIcon: briefcaseOutline },
  { name: 'Mental Health' as CategoryName, headerBg: 'bg-purple-100', borderColor: 'border-purple-400', ionIcon: happyOutline },
  { name: 'Others' as CategoryName, headerBg: 'bg-amber-100', borderColor: 'border-amber-400', ionIcon: folderOutline },
];

function toggleExpand(name: string) {
  expanded[name] = !expanded[name];
}

function getCategoryTasks(name: CategoryName) {
  return store.activeTasks.filter((t) => t.category === name);
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function handleComplete(taskId: string) {
  await store.toggleComplete(taskId);
  const toast = await toastController.create({
    message: '✅ Task completed!', duration: 1500, position: 'bottom', color: 'success',
  });
  await toast.present();
}

async function handleDelete(taskId: string) {
  await store.deleteTask(taskId);
}
</script>

<style scoped>
.browse-content { --background: #f9fafb; }
.slide-enter-active, .slide-leave-active { transition: all 0.25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; max-height: 0; overflow: hidden; }
.slide-enter-to, .slide-leave-from { opacity: 1; max-height: 1000px; }
</style>
