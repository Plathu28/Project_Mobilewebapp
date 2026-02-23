
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding inbox-content">
      <div class="pb-28 px-4 pt-2">

        <!-- Header -->
        <header class="mb-8 mt-6 flex justify-between items-end">
          <div>
            <div class="flex items-baseline gap-3">
              <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Inbox</h1>
              <span class="text-xl font-bold text-gray-400">{{ currentDate }}</span>
            </div>
            <p class="text-gray-500 text-lg font-medium mt-1">
              You have {{ store.activeTasks.length }} tasks
            </p>
          </div>
          <div 
  @click="router.push('/profile')"
  class="w-12 h-12 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm cursor-pointer active:scale-90 transition-transform"
>
  <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="User" />
</div>
        </header>

        <!-- Category Cards -->
        <section class="grid grid-cols-2 gap-4 mb-8">
          <div
            v-for="cat in categoryCards"
            :key="cat.name"
            :class="[
              'relative p-5 rounded-[2rem] h-36 flex flex-col justify-between shadow-sm transition-transform active:scale-95 cursor-pointer',
              cat.bgColor,
            ]"
            @click="scrollToCategory(cat.name)"
          >
            <div class="bg-white/40 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md">
              <ion-icon :icon="cat.ionIcon" class="text-xl text-gray-800"></ion-icon>
            </div>
            <div>
              <p class="text-3xl font-bold text-gray-900">{{ store.categoryCounts[cat.name] }}</p>
              <p class="text-sm font-semibold text-gray-800/70 mt-1">{{ cat.name }}</p>
            </div>
          </div>
        </section>

        <!-- Task List -->
        <section>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">All Tasks</h3>
          </div>

          <!-- Loading -->
          <div v-if="store.loading" class="flex justify-center py-12">
            <ion-spinner name="crescent" color="primary"></ion-spinner>
          </div>

          <!-- Empty State -->
          <div v-else-if="store.activeTasks.length === 0" class="text-center py-16">
            <ion-icon :icon="checkmarkDoneCircleOutline" class="text-6xl text-gray-300 mb-4"></ion-icon>
            <p class="text-gray-400 text-lg font-medium">No tasks yet!</p>
            <p class="text-gray-400 text-sm mt-1">Tap + to add your first task</p>
          </div>

          <!-- Task Items with Swipe -->
          <ion-list v-else lines="none" class="bg-transparent">
            <ion-item-sliding
              v-for="task in store.activeTasks"
              :key="task.id"
              @ionDrag="onDrag"
            >
              <!-- Swipe Delete Option -->
              <ion-item-options side="end">
                <ion-item-option color="danger" @click="handleDelete(task.id)" expandable>
                  <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
                </ion-item-option>
              </ion-item-options>

              <!-- Task Card -->
              <ion-item class="task-item">
                <div class="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 w-full my-1">
                  <!-- Checkbox -->
                  <div
                    style="min-width: 28px; min-height: 28px;"
                    class="mt-1 w-7 h-7 bg-white rounded-full border-2 border-solid border-gray-400 flex-shrink-0 flex items-center justify-center cursor-pointer transition-all active:scale-75 active:bg-green-100 group"
                    :class="getCategoryBorderColor(task.category)"
                    @click.stop="handleComplete(task.id)"
                  >
                    <ion-icon 
                      :icon="checkmark" 
                      class="text-transparent group-active:text-green-600 text-xl transition-colors"
                    ></ion-icon>
                  </div>

                  <div class="flex-1 min-w-0">
                    <p class="text-base font-bold text-gray-800 truncate">{{ task.title }}</p>

                    <!-- Subtasks -->
                    <div v-if="task.subtasks && task.subtasks.length > 0" class="mt-2 ml-2 space-y-1">
                      <div v-for="sub in task.subtasks" :key="sub.id" class="flex items-center gap-2">
                        <div class="w-4 h-4 rounded border border-gray-300 flex items-center justify-center">
                          <ion-icon v-if="sub.completed" :icon="checkmark" class="text-xs text-green-500"></ion-icon>
                        </div>
                        <span class="text-sm text-gray-600" :class="{ 'line-through opacity-50': sub.completed }">{{ sub.title }}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 mt-2">
                      <span
                        class="inline-block px-2 py-0.5 rounded-md text-xs font-bold tracking-wide"
                        :class="getCategoryBadgeClass(task.category)"
                      >
                        {{ task.category.toUpperCase() }}
                      </span>
                      <span v-if="task.date" class="text-xs text-gray-400">
                        {{ formatDate(task.date) }}
                      </span>
                      <span v-if="task.startTime" class="text-xs text-gray-400">
                        {{ task.startTime }}
                      </span>
                      <span v-if="task.routine" class="text-xs text-blue-400">
                        <ion-icon :icon="repeatOutline" class="text-xs"></ion-icon>
                      </span>
                    </div>
                  </div>
                </div>
              </ion-item>
            </ion-item-sliding>
          </ion-list>
        </section>
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
import {
  IonPage, IonContent, IonList, IonItem, IonItemSliding,
  IonItemOptions, IonItemOption, IonIcon, IonFab, IonFabButton,
  IonSpinner, toastController,
} from '@ionic/vue';
import {
  add, trashOutline, heartOutline, briefcaseOutline,
  happyOutline, folderOutline, checkmarkDoneCircleOutline,
  checkmark, repeatOutline,
} from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';
import type { CategoryName } from '@/types/task';

import { useRoute, useRouter } from 'vue-router';
const router = useRouter();

const store = useTaskStore();

const currentDate = new Date().toLocaleDateString('en-US', { 
  weekday: 'short', 
  month: 'short', 
  day: 'numeric' 
});

const categoryCards = [
  { name: 'Health' as CategoryName, bgColor: 'bg-cyan-200', ionIcon: heartOutline },
  { name: 'Work' as CategoryName, bgColor: 'bg-green-200', ionIcon: briefcaseOutline },
  { name: 'Mental Health' as CategoryName, bgColor: 'bg-purple-200', ionIcon: happyOutline },
  { name: 'Others' as CategoryName, bgColor: 'bg-amber-200', ionIcon: folderOutline },
];

function getCategoryBorderColor(cat: CategoryName) {
  const map: Record<CategoryName, string> = {
    Health: 'border-cyan-400',
    Work: 'border-green-400',
    'Mental Health': 'border-purple-400',
    Others: 'border-amber-400',
  };
  return map[cat] || 'border-gray-300';
}

function getCategoryBadgeClass(cat: CategoryName) {
  const map: Record<CategoryName, string> = {
    Health: 'bg-cyan-100 text-cyan-700',
    Work: 'bg-green-100 text-green-700',
    'Mental Health': 'bg-purple-100 text-purple-700',
    Others: 'bg-amber-100 text-amber-700',
  };
  return map[cat] || 'bg-gray-100 text-gray-700';
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

async function handleComplete(taskId: string) {
  await store.toggleComplete(taskId);
  const toast = await toastController.create({
    message: '✅ Task completed!',
    duration: 1500,
    position: 'bottom',
    color: 'success',
    cssClass: 'custom-toast',
  });
  await toast.present();
}

async function handleDelete(taskId: string) {
  await store.deleteTask(taskId);
  const toast = await toastController.create({
    message: '🗑️ Task deleted',
    duration: 1500,
    position: 'bottom',
    color: 'danger',
  });
  await toast.present();
}

function scrollToCategory(name: CategoryName) {
  // Could filter or scroll – for now it's a visual indicator
}

function onDrag(ev: any) {
  // Optional: handle drag events
}
</script>

<style scoped>
.inbox-content {
  --background: #f9fafb;
}

.task-item {
  --background: transparent;
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
}

ion-item-sliding {
  margin-bottom: 4px;
}
</style>
