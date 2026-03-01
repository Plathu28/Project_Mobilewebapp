// src/stores/taskStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Task, Subtask, RoutineConfig, CategoryName } from '@/types/task';
import {
  auth,
  tasksCollection,
  onAuthStateChanged,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  db,
  query,
  where,
  orderBy,
  onSnapshot,
  type User,
  type Unsubscribe,
} from '@/services/firebase';

export const useTaskStore = defineStore('tasks', () => {
  // ---- State ----
  const tasks = ref<Task[]>([]);
  const currentUser = ref<User | null>(null);
  const loading = ref(true);
  let unsubscribe: Unsubscribe | null = null;

  // ---- Auth ----
  async function initAuth(): Promise<void> {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          currentUser.value = user;
          listenToTasks();
        } else {
          // ✅ ไม่ signInAnonymously แล้ว — ให้ router พา user ไปหน้า login เอง
          currentUser.value = null;
          tasks.value = [];
          loading.value = false;
        }
        resolve();
      });
    });
  }

  // ---- Real-time listener ----
  function listenToTasks() {
    if (!currentUser.value) return;
    if (unsubscribe) unsubscribe();

    const q = query(
      tasksCollection,
      where('userId', '==', currentUser.value.uid),
      orderBy('createdAt', 'desc')
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
      tasks.value = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Task, 'id'>),
        id: d.id,
      }));
      loading.value = false;
    }, (error) => {
      console.error('Firestore listen error:', error);
      loading.value = false;
    });
  }

  // ---- CRUD ----
  async function addTask(task: Omit<Task, 'id' | 'userId' | 'createdAt'>) {
    if (!currentUser.value) return;
    const newTask = {
      ...task,
      userId: currentUser.value.uid,
      labels: task.labels || [],
      createdAt: new Date().toISOString(),
    };
    await addDoc(tasksCollection, newTask);
  }

  async function toggleComplete(taskId: string) {
    const task = tasks.value.find((t) => t.id === taskId);
    if (!task) return;
    const ref = doc(db, 'tasks', taskId);
    await updateDoc(ref, { completed: !task.completed });
  }

  async function deleteTask(taskId: string) {
    const ref = doc(db, 'tasks', taskId);
    await deleteDoc(ref);
  }

  async function updateTask(taskId: string, data: Partial<Task>) {
    const ref = doc(db, 'tasks', taskId);
    await updateDoc(ref, data as Record<string, any>);
  }

  // ---- Computed ----
  const activeTasks = computed(() => tasks.value.filter((t) => !t.completed));
  const completedTasks = computed(() => tasks.value.filter((t) => t.completed));

  const todayTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.value.filter((t) => t.date === today && !t.completed);
  });

  const upcomingTasks = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.value
      .filter((t) => t.date && t.date > today && !t.completed)
      .sort((a, b) => (a.date! > b.date! ? 1 : -1));
  });

  function tasksByCategory(category: CategoryName) {
    return computed(() => tasks.value.filter((t) => t.category === category && !t.completed));
  }

  const categoryCounts = computed(() => {
    const counts: Record<CategoryName, number> = {
      Health: 0,
      Work: 0,
      'Mental Health': 0,
      Others: 0,
    };
    activeTasks.value.forEach((t) => {
      if (counts[t.category] !== undefined) counts[t.category]++;
    });
    return counts;
  });

  return {
    tasks,
    currentUser,
    loading,
    activeTasks,
    completedTasks,
    todayTasks,
    upcomingTasks,
    categoryCounts,
    initAuth,
    addTask,
    toggleComplete,
    deleteTask,
    updateTask,
    tasksByCategory,
  };
});