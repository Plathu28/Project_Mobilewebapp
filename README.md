# Todo App — Ionic Vue + Firebase

A complete task management app built with **Ionic Vue**, **Tailwind CSS**, **Pinia**, and **Firebase Firestore**.

## Features

| Page | Features |
|------|----------|
| **Inbox** | Category cards with counts, task list with checkboxes, swipe-to-delete, completion toast, FAB to add |
| **Today** | Timeline view (6:00–23:00), color-coded task blocks by category, duration display |
| **Upcoming** | Tasks grouped by date, swipe-to-delete, quick complete |
| **Browse** | Expandable category sections, completed tasks section |
| **New Task** | Title input, subtasks, category/priority picker, date modal with calendar + quick dates, time picker (start/end, AM/PM, duration), routine menu (daily/weekly/weekday/monthly/yearly/custom), custom routine config |

## Project Structure

```
src/
├── main.ts                  # Entry point
├── App.vue                  # Root component (initializes Firebase auth)
├── env.d.ts                 # Vue type declarations
├── router/index.ts          # Routes: tabs + new-task
├── services/firebase.ts     # Firebase config & exports
├── stores/taskStore.ts      # Pinia store – CRUD, auth, computed filters
├── types/task.ts            # TypeScript interfaces
├── theme/
│   ├── tailwind.css         # Tailwind directives
│   └── variables.css        # Ionic CSS variables
└── views/
    ├── TabsPage.vue         # Bottom tab bar layout
    ├── InboxPage.vue        # Main inbox with categories + task list
    ├── TodayPage.vue        # Timeline view for today
    ├── UpcomingPage.vue     # Future tasks grouped by date
    ├── BrowsePage.vue       # Tasks organized by category
    └── NewTaskPage.vue      # Full task creation with all modals
```

## Setup

### 1. Create your Ionic Vue project (if starting fresh)

```bash
npm install -g @ionic/cli
ionic start todo-app blank --type vue
cd todo-app
```

### 2. Install dependencies

```bash
npm install firebase pinia
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Copy source files

Copy all the files from this package's `src/` directory into your project's `src/` directory, replacing existing files as needed.

### 4. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Sign-in method → **Anonymous**
4. Enable **Cloud Firestore** → Create database
5. Copy your Firebase config into `src/services/firebase.ts`
6. Deploy the Firestore security rules from `firestore.rules`

```ts
// src/services/firebase.ts — Replace the placeholder config:
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 5. Create Firestore Index

In Firebase Console → Firestore → Indexes, create a composite index:

- **Collection**: `tasks`
- **Fields**: `userId` (Ascending), `createdAt` (Descending)

### 6. Run

```bash
ionic serve
```

## How It Works

- **Auth**: Uses Firebase Anonymous Auth so each device gets a unique user ID — all tasks are scoped to that user.
- **Real-time sync**: The store uses `onSnapshot` to listen for Firestore changes in real-time.
- **Swipe to delete**: Uses Ionic's `ion-item-sliding` with `ion-item-options`.
- **Completion**: Checking a task sets `completed: true` in Firestore; the task disappears from active views and a toast confirms the action.
- **Date picker**: Full modal with quick date shortcuts, scrollable calendar (3 months), and inline date selection.
- **Time picker**: Start/End time with hour/minute inputs, AM/PM toggle, and quick duration buttons.
- **Routine**: Dropdown with 5 preset options + Custom, which opens a separate modal for interval/unit/end-date configuration.
