// src/services/googleClassroom.ts
// Google Classroom API integration
//
// ============================================================
// 🔑 SETUP REQUIRED:
// 1. Go to https://console.cloud.google.com
// 2. Create a project (or use your Firebase project)
// 3. Enable "Google Classroom API" in APIs & Services
// 4. Create OAuth 2.0 credentials (Web application)
//    - Add your app URL to Authorized JavaScript origins
//    - e.g. http://localhost:8100 for dev
// 5. Paste the Client ID below
// ============================================================

const GOOGLE_CLIENT_ID = '218684443836-57ne5h0bu8mh2i0ouch5jpoadnrjf517.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
].join(' ');

interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  courseState: string;
}

interface ClassroomCoursework {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  workType: string;
  state: string;
  alternateLink: string;
}

interface ClassroomSubmission {
  id: string;
  courseWorkId: string;
  state: string;
}

export interface ClassroomTask {
  title: string;
  courseName: string;
  description?: string;
  dueDate: string | null;
  dueTime: string | null;
  workType: string;
  isSubmitted: boolean;
  link: string;
}

let accessToken: string | null = null;
let tokenClient: any = null;

const MAX_AGE_DAYS = 30;

function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById('gis-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'gis-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

export async function authorizeClassroom(): Promise<string> {
  await loadGisScript();

  return new Promise((resolve, reject) => {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        accessToken = response.access_token;
        const expiresAt = Date.now() + (response.expires_in * 1000);
        localStorage.setItem('classroom_token', accessToken!);
        localStorage.setItem('classroom_token_expires', expiresAt.toString());
        resolve(accessToken!);
      },
    });

    tokenClient.requestAccessToken();
  });
}

export function isClassroomAuthorized(): boolean {
  const token = localStorage.getItem('classroom_token');
  const expires = localStorage.getItem('classroom_token_expires');
  if (!token || !expires) return false;
  if (Date.now() > parseInt(expires)) {
    localStorage.removeItem('classroom_token');
    localStorage.removeItem('classroom_token_expires');
    return false;
  }
  accessToken = token;
  return true;
}

export function revokeClassroom(): void {
  if (accessToken) {
    (window as any).google?.accounts?.oauth2?.revoke?.(accessToken);
  }
  accessToken = null;
  localStorage.removeItem('classroom_token');
  localStorage.removeItem('classroom_token_expires');
}

async function classroomFetch<T>(endpoint: string): Promise<T> {
  if (!accessToken) throw new Error('Not authorized');

  const res = await fetch(`https://classroom.googleapis.com/v1/${endpoint}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) {
    accessToken = null;
    localStorage.removeItem('classroom_token');
    localStorage.removeItem('classroom_token_expires');
    throw new Error('Token expired, please re-authorize');
  }

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Classroom API error ${res.status}: ${errBody}`);
  }

  return res.json();
}

export async function fetchCourses(): Promise<ClassroomCourse[]> {
  const data = await classroomFetch<{ courses?: ClassroomCourse[] }>(
    'courses?courseStates=ACTIVE&pageSize=30'
  );
  return data.courses || [];
}

async function fetchCoursework(courseId: string): Promise<ClassroomCoursework[]> {
  const data = await classroomFetch<{ courseWork?: ClassroomCoursework[] }>(
    `courses/${courseId}/courseWork?pageSize=50&orderBy=dueDate asc`
  );
  return data.courseWork || [];
}

async function fetchAllMySubmissions(courseId: string): Promise<ClassroomSubmission[]> {
  const allSubmissions: ClassroomSubmission[] = [];
  let pageToken = '';

  do {
    const url = `courses/${courseId}/courseWork/-/studentSubmissions?pageSize=100${pageToken ? '&pageToken=' + pageToken : ''}`;
    const data = await classroomFetch<{ studentSubmissions?: ClassroomSubmission[]; nextPageToken?: string }>(url);

    if (data.studentSubmissions) {
      allSubmissions.push(...data.studentSubmissions);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return allSubmissions;
}

// ---- Main: Pull only recent, unsubmitted assignments ----
export async function pullClassroomAssignments(): Promise<ClassroomTask[]> {
  const courses = await fetchCourses();
  const allTasks: ClassroomTask[] = [];
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

  for (const course of courses) {
    try {
      const [courseworks, submissions] = await Promise.all([
        fetchCoursework(course.id),
        fetchAllMySubmissions(course.id),
      ]);

      const submissionMap = new Map<string, string>();
      for (const sub of submissions) {
        const existing = submissionMap.get(sub.courseWorkId);
        if (!existing || isMoreComplete(sub.state, existing)) {
          submissionMap.set(sub.courseWorkId, sub.state);
        }
      }

      for (const cw of courseworks) {
        const subState = submissionMap.get(cw.id);

        // Skip turned in / returned
        if (subState === 'TURNED_IN' || subState === 'RETURNED') {
          continue;
        }

        // Parse dates
        let dueDate: string | null = null;
        let dueTime: string | null = null;
        let dueDateObj: Date | null = null;

        if (cw.dueDate) {
          const y = cw.dueDate.year;
          const m = cw.dueDate.month.toString().padStart(2, '0');
          const d = cw.dueDate.day.toString().padStart(2, '0');
          dueDate = `${y}-${m}-${d}`;
          dueDateObj = new Date(`${y}-${m}-${d}T23:59:59`);
        }

        if (cw.dueTime) {
          const h = (cw.dueTime.hours || 0).toString().padStart(2, '0');
          const min = (cw.dueTime.minutes || 0).toString().padStart(2, '0');
          dueTime = `${h}:${min}`;
        }

        const createdDate = cw.creationTime ? new Date(cw.creationTime) : null;

        // Filter old assignments
        if (dueDateObj && dueDateObj < cutoffDate) continue;
        if (!dueDateObj && createdDate && createdDate < cutoffDate) continue;
        if (!dueDateObj && !createdDate) continue;

        allTasks.push({
          title: cw.title,
          courseName: course.name,
          description: cw.description,
          dueDate,
          dueTime,
          workType: cw.workType,
          isSubmitted: false,
          link: cw.alternateLink,
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch coursework for ${course.name}:`, err);
    }
  }

  return allTasks;
}

function isMoreComplete(newState: string, existingState: string): boolean {
  const priority: Record<string, number> = {
    'NEW': 0,
    'CREATED': 1,
    'RECLAIMED_BY_STUDENT': 2,
    'TURNED_IN': 3,
    'RETURNED': 4,
  };
  return (priority[newState] || 0) > (priority[existingState] || 0);
}