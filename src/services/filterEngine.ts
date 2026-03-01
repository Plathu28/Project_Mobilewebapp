// src/services/filterEngine.ts
// Filter query engine — parses text queries and matches tasks
//
// Supported keywords:
//   Date:     today, tomorrow, yesterday, this week, next week, this month,
//             next month, overdue, no date
//   Category: health, work, mental health, others
//   Priority: high, medium, low, no priority, p1, p2, p3
//   Routine:  recurring, routine, daily, weekly, monthly, yearly
//   Status:   completed, active
//   Labels:   @labelName  (not implemented yet — needs label lookup)
//
// Combinators: & (AND), | (OR) — default is AND when space-separated
// Example: "today & high"  → tasks due today with high priority
// Example: "work | health" → tasks in Work or Health category

import type { Task, CategoryName } from '@/types/task';

export interface QueryToken {
  type: 'date' | 'category' | 'priority' | 'routine' | 'status' | 'search' | 'operator' | 'unknown';
  value: string;
  raw: string;
}

export interface ParseResult {
  tokens: QueryToken[];
  isValid: boolean;
  errors: string[];
  description: string;
}

// ---- Keyword Maps ----

const DATE_KEYWORDS: Record<string, (now: Date) => (task: Task) => boolean> = {
  'today': (now) => (t) => t.date === toISO(now),
  'tomorrow': (now) => {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    return (t) => t.date === toISO(d);
  },
  'yesterday': (now) => {
    const d = new Date(now); d.setDate(d.getDate() - 1);
    return (t) => t.date === toISO(d);
  },
  'this week': (now) => {
    const { start, end } = getWeekRange(now, 0);
    return (t) => !!t.date && t.date >= start && t.date <= end;
  },
  'next week': (now) => {
    const { start, end } = getWeekRange(now, 1);
    return (t) => !!t.date && t.date >= start && t.date <= end;
  },
  'last week': (now) => {
    const { start, end } = getWeekRange(now, -1);
    return (t) => !!t.date && t.date >= start && t.date <= end;
  },
  'this month': (now) => {
    const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const end = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return (t) => !!t.date && t.date >= start && t.date <= end;
  },
  'next month': (now) => {
    const nm = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const start = toISO(nm);
    const lastDay = new Date(nm.getFullYear(), nm.getMonth() + 1, 0).getDate();
    const end = `${nm.getFullYear()}-${String(nm.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return (t) => !!t.date && t.date >= start && t.date <= end;
  },
  'overdue': (now) => {
    const today = toISO(now);
    return (t) => !!t.date && t.date < today && !t.completed;
  },
  'no date': () => (t) => !t.date,
};

const CATEGORY_KEYWORDS: Record<string, CategoryName> = {
  'health': 'Health',
  'work': 'Work',
  'mental health': 'Mental Health',
  'others': 'Others',
};

const PRIORITY_KEYWORDS: Record<string, string | null> = {
  'high': 'high',
  'medium': 'medium',
  'low': 'low',
  'p1': 'high',
  'p2': 'medium',
  'p3': 'low',
  'no priority': null,
};

const ROUTINE_KEYWORDS = ['recurring', 'routine', 'daily', 'weekly', 'monthly', 'yearly'];

const STATUS_KEYWORDS: Record<string, boolean> = {
  'completed': true,
  'done': true,
  'active': false,
  'pending': false,
};

// ---- Helpers ----

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekRange(now: Date, offset: number): { start: string; end: string } {
  const d = new Date(now);
  const day = d.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMon + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toISO(monday), end: toISO(sunday) };
}

// ---- Parser ----

export function parseQuery(queryStr: string): ParseResult {
  const raw = queryStr.trim().toLowerCase();
  if (!raw) {
    return { tokens: [], isValid: false, errors: ['Query is empty'], description: '' };
  }

  // Split by & or |
  const parts = raw.split(/\s*([&|])\s*/);
  const tokens: QueryToken[] = [];
  const errors: string[] = [];
  const descriptions: string[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    if (trimmed === '&' || trimmed === '|') {
      tokens.push({ type: 'operator', value: trimmed, raw: trimmed });
      descriptions.push(trimmed === '&' ? 'AND' : 'OR');
      continue;
    }

    // Try to match multi-word keywords first
    let matched = false;

    // Date keywords (check multi-word first)
    for (const kw of Object.keys(DATE_KEYWORDS)) {
      if (trimmed === kw) {
        tokens.push({ type: 'date', value: kw, raw: trimmed });
        descriptions.push(`date = "${kw}"`);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Category keywords
    for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
      if (trimmed === kw) {
        tokens.push({ type: 'category', value: cat, raw: trimmed });
        descriptions.push(`category = "${cat}"`);
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Priority keywords
    for (const [kw, val] of Object.entries(PRIORITY_KEYWORDS)) {
      if (trimmed === kw) {
        tokens.push({ type: 'priority', value: val ?? '__null__', raw: trimmed });
        descriptions.push(val ? `priority = "${val}"` : 'no priority');
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Routine keywords
    for (const kw of ROUTINE_KEYWORDS) {
      if (trimmed === kw) {
        tokens.push({ type: 'routine', value: kw, raw: trimmed });
        descriptions.push('has routine');
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Status keywords
    for (const [kw, val] of Object.entries(STATUS_KEYWORDS)) {
      if (trimmed === kw) {
        tokens.push({ type: 'status', value: String(val), raw: trimmed });
        descriptions.push(val ? 'completed' : 'active');
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Unknown token
    tokens.push({ type: 'unknown', value: trimmed, raw: trimmed });
    errors.push(`Unknown keyword: "${trimmed}"`);
  }

  const hasFilter = tokens.some((t) => t.type !== 'operator');

  return {
    tokens,
    isValid: errors.length === 0 && hasFilter,
    errors: hasFilter ? errors : ['No valid filter keywords found'],
    description: descriptions.join(' '),
  };
}

// ---- Matcher ----

export function matchTasks(tasks: Task[], queryStr: string): Task[] {
  const parsed = parseQuery(queryStr);
  if (!parsed.isValid) return [];

  const now = new Date();
  const filterTokens = parsed.tokens.filter((t) => t.type !== 'operator');
  const operators = parsed.tokens.filter((t) => t.type === 'operator');

  // Build matchers for each filter token
  const matchers: Array<(task: Task) => boolean> = filterTokens.map((token) => {
    switch (token.type) {
      case 'date': {
        const fn = DATE_KEYWORDS[token.value];
        return fn ? fn(now) : () => false;
      }
      case 'category':
        return (t) => t.category === token.value;
      case 'priority':
        return token.value === '__null__'
          ? (t) => !t.priority
          : (t) => t.priority === token.value;
      case 'routine':
        if (token.value === 'daily') return (t) => t.routine?.type === 'daily';
        if (token.value === 'weekly') return (t) => t.routine?.type === 'weekly';
        if (token.value === 'monthly') return (t) => t.routine?.type === 'monthly';
        if (token.value === 'yearly') return (t) => t.routine?.type === 'yearly';
        return (t) => !!t.routine;
      case 'status':
        return token.value === 'true' ? (t) => t.completed : (t) => !t.completed;
      case 'search':
        return (t) => t.title.toLowerCase().includes(token.value);
      default:
        return () => false;
    }
  });

  if (matchers.length === 0) return [];

  // Determine if using OR or AND (check first operator)
  const useOr = operators.some((op) => op.value === '|');

  return tasks.filter((task) => {
    if (useOr) {
      return matchers.some((m) => m(task));
    }
    return matchers.every((m) => m(task));
  });
}

// ---- Get available keyword suggestions ----

export function getKeywordSuggestions(): Array<{ keyword: string; type: string; description: string }> {
  return [
    { keyword: 'today', type: 'date', description: 'Tasks due today' },
    { keyword: 'tomorrow', type: 'date', description: 'Tasks due tomorrow' },
    { keyword: 'yesterday', type: 'date', description: 'Tasks due yesterday' },
    { keyword: 'this week', type: 'date', description: 'Tasks due this week' },
    { keyword: 'next week', type: 'date', description: 'Tasks due next week' },
    { keyword: 'last week', type: 'date', description: 'Tasks due last week' },
    { keyword: 'this month', type: 'date', description: 'Tasks due this month' },
    { keyword: 'next month', type: 'date', description: 'Tasks due next month' },
    { keyword: 'overdue', type: 'date', description: 'Overdue tasks' },
    { keyword: 'no date', type: 'date', description: 'Tasks without a date' },
    { keyword: 'health', type: 'category', description: 'Health category' },
    { keyword: 'work', type: 'category', description: 'Work category' },
    { keyword: 'mental health', type: 'category', description: 'Mental Health category' },
    { keyword: 'others', type: 'category', description: 'Others category' },
    { keyword: 'high', type: 'priority', description: 'High priority (p1)' },
    { keyword: 'medium', type: 'priority', description: 'Medium priority (p2)' },
    { keyword: 'low', type: 'priority', description: 'Low priority (p3)' },
    { keyword: 'no priority', type: 'priority', description: 'No priority set' },
    { keyword: 'recurring', type: 'routine', description: 'Has routine/repeat' },
    { keyword: 'daily', type: 'routine', description: 'Daily routine' },
    { keyword: 'weekly', type: 'routine', description: 'Weekly routine' },
    { keyword: 'monthly', type: 'routine', description: 'Monthly routine' },
    { keyword: 'completed', type: 'status', description: 'Completed tasks' },
    { keyword: 'active', type: 'status', description: 'Active tasks' },
  ];
}
