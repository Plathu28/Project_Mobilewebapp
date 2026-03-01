export interface Task {
  id: string;
  title: string;
  category: 'Health' | 'Work' | 'Mental Health' | 'Others';
  date: string | null;        // ISO date string e.g. '2026-02-18'
  startTime: string | null;   // e.g. '09:00'
  endTime: string | null;     // e.g. '10:00'
  duration: number | null;    // in minutes
  priority: 'low' | 'medium' | 'high' | null;
  routine: RoutineConfig | null;
  completed: boolean;
  userId: string;
  createdAt: string;
  subtasks: Subtask[];
  labels: string[];  
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface RoutineConfig {
  type: 'daily' | 'weekly' | 'weekday' | 'monthly' | 'yearly' | 'custom';
  basedOn: 'scheduled' | 'completed';
  interval: number;           // every X ...
  unit: 'day' | 'week' | 'month' | 'year';
  endsNever: boolean;
  endDate: string | null;     // ISO date
}

export const CATEGORIES = [
  { name: 'Health' as const, color: 'bg-cyan-200', textColor: 'text-cyan-700', badgeBg: 'bg-cyan-100', icon: 'heart' },
  { name: 'Work' as const, color: 'bg-green-200', textColor: 'text-green-700', badgeBg: 'bg-green-100', icon: 'briefcase' },
  { name: 'Mental Health' as const, color: 'bg-purple-200', textColor: 'text-purple-700', badgeBg: 'bg-purple-100', icon: 'face-smile' },
  { name: 'Others' as const, color: 'bg-amber-200', textColor: 'text-amber-700', badgeBg: 'bg-amber-100', icon: 'folder' },
] as const;

export type CategoryName = Task['category'];
