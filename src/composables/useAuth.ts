// src/composables/useAuth.ts
import { ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

const user = ref<User | null>(null)
const loading = ref(false)

// Track auth state globally
onAuthStateChanged(auth, (u) => {
  user.value = u
})

export function useAuth() {
  const error = ref<string | null>(null)

  // ✅ Register with Email
  async function register(name: string, email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      user.value = cred.user
      return cred.user
    } catch (e: any) {
      error.value = getFirebaseErrorMessage(e.code)
      return null
    } finally {
      loading.value = false
    }
  }

  // ✅ Login with Email
  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user.value = cred.user
      return cred.user
    } catch (e: any) {
      error.value = getFirebaseErrorMessage(e.code)
      return null
    } finally {
      loading.value = false
    }
  }

  // ✅ Google Sign-In
  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      user.value = cred.user
      return cred.user
    } catch (e: any) {
      error.value = getFirebaseErrorMessage(e.code)
      return null
    } finally {
      loading.value = false
    }
  }

  // ✅ Forgot Password
  async function forgotPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      await sendPasswordResetEmail(auth, email)
      return true
    } catch (e: any) {
      error.value = getFirebaseErrorMessage(e.code)
      return false
    } finally {
      loading.value = false
    }
  }

  // ✅ Logout
  async function logout() {
    await signOut(auth)
    user.value = null
  }

  return { user, loading, error, register, login, loginWithGoogle, forgotPassword, logout }
}

// แปล Firebase error code เป็นภาษาไทย
function getFirebaseErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว',
    'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง',
    'auth/weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'auth/user-not-found': 'ไม่พบบัญชีผู้ใช้นี้',
    'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง',
    'auth/invalid-credential': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    'auth/too-many-requests': 'ลองใหม่อีกครั้งในภายหลัง (พยายามเข้าสู่ระบบมากเกินไป)',
    'auth/popup-closed-by-user': 'ยกเลิกการเข้าสู่ระบบด้วย Google',
    'auth/network-request-failed': 'ไม่สามารถเชื่อมต่อเครือข่ายได้',
  }
  return messages[code] || `เกิดข้อผิดพลาด: ${code}`
}