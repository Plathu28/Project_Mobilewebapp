// src/stores/notificationStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useTaskStore } from './taskStore';

export const useNotificationStore = defineStore('notifications', () => {
  // โหลดจาก localStorage ตอนเริ่ม
  const readIds = ref<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]'))
  );

  function markRead(id: string) {
    readIds.value.add(id);
    // trigger reactivity
    readIds.value = new Set(readIds.value);
    localStorage.setItem('readNotifIds', JSON.stringify([...readIds.value]));
  }

  function markAllRead() {
    const taskStore = useTaskStore();
    taskStore.activeTasks.forEach((t) => readIds.value.add(t.id));
    readIds.value = new Set(readIds.value);
    localStorage.setItem('readNotifIds', JSON.stringify([...readIds.value]));
  }

  function isRead(id: string): boolean {
    return readIds.value.has(id);
  }

  const unreadCount = computed(() => {
    const taskStore = useTaskStore();
    return taskStore.activeTasks.filter((t) => !readIds.value.has(t.id)).length;
  });

  return { readIds, unreadCount, markRead, markAllRead, isRead };
});