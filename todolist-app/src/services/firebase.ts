// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

// =============================================
// 🔥 REPLACE with your own Firebase config
// =============================================
const firebaseConfig = {
  apiKey: "AIzaSyDiniw4ZMIncNeGdgciwDdOc0pfPicoulo",
  authDomain: "project-to-do-list-d3b36.firebaseapp.com",
  projectId: "project-to-do-list-d3b36",
  storageBucket: "project-to-do-list-d3b36.firebasestorage.app",
  messagingSenderId: "218684443836",
  appId: "1:218684443836:web:1b3a0dedcc7a6672b094b9",
  measurementId: "G-YTMKDRNT6H"
};



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Collection reference
const tasksCollection = collection(db, 'tasks');

export {
  db,
  auth,
  tasksCollection,
  signInAnonymously,
  onAuthStateChanged,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
};

export type { User, Unsubscribe };
