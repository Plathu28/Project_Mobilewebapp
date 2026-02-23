<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="auth-card">
      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <span class="brand-name">TodoApp</span>
      </div>

      <h2 class="auth-title">สร้างบัญชีใหม่</h2>
      <p class="auth-subtitle">เริ่มจัดการ Todo ของคุณได้เลย</p>

      <!-- Google Sign-Up -->
      <button class="btn-google" @click="handleGoogle" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
        </svg>
        สมัครด้วย Google
      </button>

      <div class="divider"><span>หรือสมัครด้วยอีเมล</span></div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Name -->
        <div class="field-group">
          <label>ชื่อ</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              v-model="name"
              type="text"
              placeholder="ชื่อของคุณ"
              :class="{ error: nameError }"
              @blur="validateName"
            />
          </div>
          <span v-if="nameError" class="field-error">{{ nameError }}</span>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label>อีเมล</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
            </svg>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              :class="{ error: emailError }"
              @blur="validateEmail"
            />
          </div>
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>

        <!-- Password -->
        <div class="field-group">
          <label>รหัสผ่าน</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              :class="{ error: passwordError }"
              @blur="validatePassword"
              @input="checkStrength"
            />
            <button type="button" class="toggle-eye" @click="showPassword = !showPassword">
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <!-- Password Strength Bar -->
          <div v-if="password" class="strength-bar">
            <div class="strength-segments">
              <div class="seg" :class="strength >= 1 ? strengthColor : ''"></div>
              <div class="seg" :class="strength >= 2 ? strengthColor : ''"></div>
              <div class="seg" :class="strength >= 3 ? strengthColor : ''"></div>
              <div class="seg" :class="strength >= 4 ? strengthColor : ''"></div>
            </div>
            <span class="strength-label" :class="strengthColor">{{ strengthLabel }}</span>
          </div>
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <!-- Confirm Password -->
        <div class="field-group">
          <label>ยืนยันรหัสผ่าน</label>
          <div class="input-wrap">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 11l3 3L22 4"/><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            </svg>
            <input
              v-model="confirmPassword"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              :class="{ error: confirmError }"
              @blur="validateConfirm"
            />
            <button type="button" class="toggle-eye" @click="showConfirm = !showConfirm">
              <svg v-if="showConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <span v-if="confirmError" class="field-error">{{ confirmError }}</span>
        </div>

        <!-- Terms -->
        <label class="terms-check">
          <input type="checkbox" v-model="agreeTerms" />
          <span class="checkmark"></span>
          <span>ฉันยอมรับ <a href="#" @click.prevent>ข้อกำหนดการใช้งาน</a></span>
        </label>

        <div v-if="error" class="error-box">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading || !agreeTerms">
          <span v-if="loading" class="spinner"></span>
          <span v-else>สร้างบัญชี</span>
        </button>
      </form>

      <p class="switch-link">
        มีบัญชีอยู่แล้ว?
        <router-link to="/login">เข้าสู่ระบบ</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register, loginWithGoogle, loading, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeTerms = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

// Password strength
const strength = ref(0)
const strengthLabel = computed(() => ['', 'อ่อนมาก', 'อ่อน', 'ปานกลาง', 'แข็งแกร่ง'][strength.value])
const strengthColor = computed(() => ['', 'weak-strong', 'weak-strong', 'medium-strong', 'strong-strong'][strength.value])

function checkStrength() {
  const p = password.value
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  strength.value = score
}

function validateName() {
  nameError.value = name.value.trim() ? '' : 'กรุณากรอกชื่อ'
}
function validateEmail() {
  if (!email.value) return (emailError.value = 'กรุณากรอกอีเมล')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return (emailError.value = 'รูปแบบอีเมลไม่ถูกต้อง')
  emailError.value = ''
}
function validatePassword() {
  if (!password.value) return (passwordError.value = 'กรุณากรอกรหัสผ่าน')
  if (password.value.length < 6) return (passwordError.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  passwordError.value = ''
}
function validateConfirm() {
  confirmError.value = password.value !== confirmPassword.value ? 'รหัสผ่านไม่ตรงกัน' : ''
}

async function handleRegister() {
  validateName(); validateEmail(); validatePassword(); validateConfirm()
  if (nameError.value || emailError.value || passwordError.value || confirmError.value) return
  const user = await register(name.value.trim(), email.value, password.value)
  if (user) router.push('/')
}

async function handleGoogle() {
  const user = await loginWithGoogle()
  if (user) router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.auth-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  background: #0a0a14;
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.auth-bg { position: fixed; inset: 0; pointer-events: none; }

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  animation: float 8s ease-in-out infinite;
}
.blob-1 { width: 500px; height: 500px; background: #7c4dff; top: -150px; right: -150px; animation-delay: 0s; }
.blob-2 { width: 400px; height: 400px; background: #4f6ef7; bottom: -100px; left: -100px; animation-delay: -3s; }
.blob-3 { width: 250px; height: 250px; background: #06b6d4; top: 40%; right: 10%; animation-delay: -5s; }

@keyframes float {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(-20px, 20px) scale(1.05); }
  66% { transform: translate(20px, -20px) scale(0.95); }
}

.auth-card {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 36px;
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
  box-shadow: 0 32px 64px rgba(0,0,0,0.4);
  animation: cardIn 0.5s cubic-bezier(.22,1,.36,1) both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 24px;
}
.brand-icon {
  width: 40px; height: 40px;
  background: linear-gradient(135deg, #7c4dff, #4f6ef7);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white;
}
.brand-name { font-size: 1.2rem; font-weight: 700; color: #fff; letter-spacing: -0.5px; }

.auth-title { font-size: 1.5rem; font-weight: 700; color: #fff; letter-spacing: -0.5px; margin-bottom: 6px; }
.auth-subtitle { font-size: 0.875rem; color: rgba(255,255,255,0.45); margin-bottom: 24px; }

.btn-google {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  color: rgba(255,255,255,0.85);
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem; font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-google:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
.btn-google:disabled { opacity: 0.5; cursor: not-allowed; }

.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 18px 0;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
.divider span { font-size: 0.75rem; color: rgba(255,255,255,0.3); white-space: nowrap; }

.auth-form { display: flex; flex-direction: column; gap: 14px; }

.field-group { display: flex; flex-direction: column; gap: 5px; }

label { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.6); }

.input-wrap { position: relative; display: flex; align-items: center; }

.input-icon {
  position: absolute; left: 14px;
  width: 16px; height: 16px;
  color: rgba(255,255,255,0.3);
  pointer-events: none;
}

.input-wrap input {
  width: 100%;
  padding: 11px 40px 11px 40px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
}
.input-wrap input::placeholder { color: rgba(255,255,255,0.2); }
.input-wrap input:focus { border-color: #7c4dff; background: rgba(124,77,255,0.08); }
.input-wrap input.error { border-color: #f87171; }

.toggle-eye {
  position: absolute; right: 12px;
  background: none; border: none;
  color: rgba(255,255,255,0.35);
  cursor: pointer; padding: 4px;
  display: flex; transition: color 0.2s;
}
.toggle-eye:hover { color: rgba(255,255,255,0.65); }

.field-error { font-size: 0.75rem; color: #f87171; }

/* Password strength */
.strength-bar { margin-top: 6px; display: flex; align-items: center; gap: 8px; }
.strength-segments { display: flex; gap: 4px; flex: 1; }
.seg {
  flex: 1; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.1);
  transition: background 0.3s;
}
.seg.weak-strong { background: #f87171; }
.seg.medium-strong { background: #fbbf24; }
.seg.strong-strong { background: #34d399; }
.strength-label { font-size: 0.7rem; white-space: nowrap; }
.strength-label.weak-strong { color: #f87171; }
.strength-label.medium-strong { color: #fbbf24; }
.strength-label.strong-strong { color: #34d399; }

/* Terms */
.terms-check {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer;
  font-size: 0.8rem; color: rgba(255,255,255,0.5);
  user-select: none;
}
.terms-check input[type="checkbox"] { display: none; }
.checkmark {
  width: 18px; height: 18px;
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 5px;
  background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; flex-shrink: 0;
}
.terms-check input:checked + .checkmark { background: #7c4dff; border-color: #7c4dff; }
.terms-check input:checked + .checkmark::after {
  content: '';
  width: 5px; height: 9px;
  border: 2px solid #fff;
  border-top: none; border-left: none;
  transform: rotate(45deg) translate(-1px, -1px);
}
.terms-check a { color: #a78bff; text-decoration: none; }

.error-box {
  padding: 12px 14px;
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 10px;
  font-size: 0.825rem; color: #fca5a5;
}

.btn-primary {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, #7c4dff, #4f6ef7);
  border: none; border-radius: 12px;
  color: #fff; font-family: 'Sora', sans-serif;
  font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s, transform 0.1s;
  display: flex; align-items: center; justify-content: center;
  gap: 8px; letter-spacing: 0.3px;
}
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:active:not(:disabled) { transform: scale(0.98); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.switch-link {
  text-align: center;
  font-size: 0.825rem; color: rgba(255,255,255,0.4);
  margin-top: 20px;
}
.switch-link a { color: #a78bff; text-decoration: none; font-weight: 500; }
.switch-link a:hover { color: #c4b5fd; }

@media (max-width: 480px) {
  .auth-card { padding: 24px 16px; }
  .auth-title { font-size: 1.3rem; }
}
</style>