<template>
  <ion-page>
    <ion-content :fullscreen="true" class="notif-content">
      <div class="pb-28">

        <!-- Header -->
        <div class="flex items-center px-4 pt-12 pb-4">
          <button
            @click="router.back()"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 mr-3 active:scale-90 transition-transform"
          >
            <ion-icon :icon="arrowBack" class="text-gray-700 text-xl"></ion-icon>
          </button>
          <h1 class="text-2xl font-extrabold text-gray-900">Notifications</h1>
        </div>

        <!-- Tabs: ALL / UNREAD -->
        <div class="flex border-b border-gray-200 mx-4 mb-1">
          <button
            class="flex-1 py-3 text-sm font-bold tracking-wide transition-colors"
            :class="activeTab === 'all'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-gray-400'"
            @click="activeTab = 'all'"
          >
            ALL
          </button>
          <button
            class="flex-1 py-3 text-sm font-bold tracking-wide transition-colors"
            :class="activeTab === 'unread'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-400'"
            @click="activeTab = 'unread'"
          >
            UNREAD<span v-if="unreadCount > 0">({{ unreadCount }})</span>
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="displayList.length === 0" class="flex flex-col items-center justify-center py-28 px-8">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
            <ion-icon :icon="notificationsOffOutline" class="text-4xl text-gray-300"></ion-icon>
          </div>
          <p class="text-gray-600 font-bold text-lg">All caught up!</p>
          <p class="text-gray-400 text-sm mt-1 text-center">No notifications right now.</p>
        </div>

        <!-- Notification List -->
        <div v-else>
          <div
            v-for="item in displayList"
            :key="item.id"
            class="flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors active:bg-gray-50"
            :class="readIds.has(item.id) ? 'bg-white' : 'bg-blue-50'"
            @click="markRead(item.id)"
          >
            <!-- Bell Icon Circle -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              :class="readIds.has(item.id) ? 'bg-gray-100' : 'bg-blue-100'"
            >
              <ion-icon
                :icon="notificationsOutline"
                class="text-2xl"
                :class="readIds.has(item.id) ? 'text-gray-400' : 'text-blue-400'"
              ></ion-icon>
            </div>

            <!-- Text -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 text-sm leading-snug">{{ item.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ item.dateLabel }}</p>
            </div>

            <!-- Unread dot -->
            <div v-if="!readIds.has(item.id)" class="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0"></div>
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
import { ref, computed } from 'vue';
import { IonPage, IonContent, IonIcon, IonFab, IonFabButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { arrowBack, notificationsOutline, notificationsOffOutline, add } from 'ionicons/icons';
import { useTaskStore } from '@/stores/taskStore';

const router = useRouter();
const store = useTaskStore();

const activeTab = ref<'all' | 'unread'>('all');
const readIds = ref<Set<string>>(new Set());

const todayStr = new Date().toISOString().split('T')[0];

const allNotifications = computed(() =>
  store.activeTasks.map((task) => {
    let message = '';
    let dateLabel = '';

    if (!task.date) {
      message = `You have "${task.title}" waiting`;
      dateLabel = 'No due date';
    } else if (task.date < todayStr) {
      message = `"${task.title}" is overdue!`;
      dateLabel = formatDate(task.date);
    } else if (task.date === todayStr) {
      message = `You got ${task.title.toLowerCase()} today`;
      dateLabel = formatDate(task.date);
    } else {
      message = `Upcoming: ${task.title}`;
      dateLabel = formatDate(task.date);
    }

    return { id: task.id, message, dateLabel };
  })
);

const unreadCount = computed(() =>
  allNotifications.value.filter((n) => !readIds.value.has(n.id)).length
);

const displayList = computed(() => {
  if (activeTab.value === 'unread') {
    return allNotifications.value.filter((n) => !readIds.value.has(n.id));
  }
  return allNotifications.value;
});

function markRead(id: string) {
  readIds.value = new Set([...readIds.value, id]);
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}
</script>

<style scoped>
.notif-content {
  --background: #ffffff;
}
</style>