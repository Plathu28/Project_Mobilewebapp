<template>
  <ion-page>
    <ion-content :fullscreen="true" class="register-content">
      <div class="min-h-screen flex flex-col justify-center px-6 py-12">

        <!-- Brand -->
        <div class="mb-10">
          <div class="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <ion-icon :icon="checkmarkDoneCircleOutline" class="text-white text-3xl"></ion-icon>
          </div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Create account</h1>
          <p class="text-gray-500 text-lg font-medium mt-1">Start organizing your tasks today</p>
        </div>

        <div class="space-y-4">

          <!-- Google Sign-Up -->
          <button
            @click="handleGoogle"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 py-4 rounded-2xl font-bold text-gray-800 text-base active:scale-95 transition-transform disabled:opacity-50 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Continue with Google
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-3 py-1">
            <div class="flex-1 h-px bg-gray-200"></div>
            <span class="text-gray-400 text-xs font-medium">or sign up with email</span>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <!-- Name -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Name</label>
            <div class="relative">
              <ion-icon :icon="personOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
              <input
                v-model="name"
                type="text"
                placeholder="Your name"
                class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                :class="{ 'border-red-300 bg-red-50': nameError }"
                @blur="validateName"
              />
            </div>
            <p v-if="nameError" class="text-red-500 text-xs mt-1.5 ml-1">{{ nameError }}</p>
          </div>

          <!-- Email -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
            <div class="relative">
              <ion-icon :icon="mailOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
              <input
                v-model="email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                :class="{ 'border-red-300 bg-red-50': emailError }"
                @blur="validateEmail"
              />
            </div>
            <p v-if="emailError" class="text-red-500 text-xs mt-1.5 ml-1">{{ emailError }}</p>
          </div>

          <!-- Password -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
            <div class="relative">
              <ion-icon :icon="lockClosedOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="At least 6 characters"
                class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                :class="{ 'border-red-300 bg-red-50': passwordError }"
                @blur="validatePassword"
                @input="checkStrength"
              />
              <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 active:opacity-60" @click="showPassword = !showPassword">
                <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
              </button>
            </div>
            <!-- Strength Bar -->
            <div v-if="password" class="flex items-center gap-2 mt-2 px-1">
              <div class="flex gap-1 flex-1">
                <div class="h-1 flex-1 rounded-full transition-all" :class="strength >= 1 ? strengthColor : 'bg-gray-200'"></div>
                <div class="h-1 flex-1 rounded-full transition-all" :class="strength >= 2 ? strengthColor : 'bg-gray-200'"></div>
                <div class="h-1 flex-1 rounded-full transition-all" :class="strength >= 3 ? strengthColor : 'bg-gray-200'"></div>
                <div class="h-1 flex-1 rounded-full transition-all" :class="strength >= 4 ? strengthColor : 'bg-gray-200'"></div>
              </div>
              <span class="text-xs font-medium" :class="strengthTextColor">{{ strengthLabel }}</span>
            </div>
            <p v-if="passwordError" class="text-red-500 text-xs mt-1.5 ml-1">{{ passwordError }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
            <div class="relative">
              <ion-icon :icon="lockClosedOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
              <input
                v-model="confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Re-enter your password"
                class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                :class="{ 'border-red-300 bg-red-50': confirmError }"
                @blur="validateConfirm"
              />
              <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 active:opacity-60" @click="showConfirm = !showConfirm">
                <ion-icon :icon="showConfirm ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
              </button>
            </div>
            <p v-if="confirmError" class="text-red-500 text-xs mt-1.5 ml-1">{{ confirmError }}</p>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-3.5">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Register Button -->
          <button
            @click="handleRegister"
            :disabled="loading"
            class="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform disabled:opacity-50 shadow-sm"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>

          <!-- Login Link -->
          <p class="text-center text-gray-500 text-sm pt-2">
            Already have an account?
            <router-link to="/login" class="text-gray-900 font-bold ml-1">Sign in</router-link>
          </p>

        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import {
  checkmarkDoneCircleOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, personOutline
} from 'ionicons/icons'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { register, loginWithGoogle, loading, error } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const nameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmError = ref('')

const strength = ref(0)
const strengthLabel = computed(() => ['', 'Weak', 'Fair', 'Good', 'Strong'][strength.value])
const strengthColor = computed(() => ({
  1: 'bg-red-400', 2: 'bg-amber-400', 3: 'bg-cyan-400', 4: 'bg-green-400'
}[strength.value] || 'bg-gray-200'))
const strengthTextColor = computed(() => ({
  1: 'text-red-500', 2: 'text-amber-500', 3: 'text-cyan-600', 4: 'text-green-600'
}[strength.value] || ''))

function checkStrength() {
  const p = password.value
  let score = 0
  if (p.length >= 6) score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p) || /[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  strength.value = score
}

function validateName() { nameError.value = name.value.trim() ? '' : 'Please enter your name' }
function validateEmail() {
  if (!email.value) return (emailError.value = 'Please enter your email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return (emailError.value = 'Invalid email format')
  emailError.value = ''
}
function validatePassword() {
  if (!password.value) return (passwordError.value = 'Please enter your password')
  if (password.value.length < 6) return (passwordError.value = 'At least 6 characters required')
  passwordError.value = ''
}
function validateConfirm() {
  confirmError.value = password.value !== confirmPassword.value ? 'Passwords do not match' : ''
}

async function handleRegister() {
  validateName(); validateEmail(); validatePassword(); validateConfirm()
  if (nameError.value || emailError.value || passwordError.value || confirmError.value) return
  const user = await register(name.value.trim(), email.value, password.value)
  if (user) router.push('/tabs/inbox')
}

async function handleGoogle() {
  const user = await loginWithGoogle()
  if (user) router.push('/tabs/inbox')
}
</script>

<style scoped>
.register-content {
  --background: #f9fafb;
}
</style>