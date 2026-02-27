<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="min-h-screen flex flex-col justify-center px-6 py-12">

        <!-- Logo / Brand -->
        <div class="mb-10">
          <div class="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <ion-icon :icon="checkmarkDoneCircleOutline" class="text-white text-3xl"></ion-icon>
          </div>
          <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
          <p class="text-gray-500 text-lg font-medium mt-1">Sign in to manage your tasks</p>
        </div>

        <!-- Forgot Password Panel -->
        <transition name="slide-fade">
          <div v-if="showForgot">
            <button class="flex items-center gap-2 text-gray-400 text-sm mb-6 active:opacity-60" @click="showForgot = false">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              Back
            </button>

            <h2 class="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
            <p class="text-gray-500 text-sm mb-6">We'll send a reset link to your email</p>

            <div v-if="resetSent" class="bg-green-50 border border-green-200 rounded-2xl p-4 flex gap-3 items-start mb-4">
              <ion-icon :icon="checkmarkCircleOutline" class="text-green-500 text-xl mt-0.5 flex-shrink-0"></ion-icon>
              <p class="text-green-700 text-sm">Reset link sent to <strong>{{ forgotEmail }}</strong>. Check your inbox.</p>
            </div>

            <div v-else class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
                <div class="relative">
                  <ion-icon :icon="mailOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
                  <input
                    v-model="forgotEmail"
                    type="email"
                    placeholder="your@email.com"
                    class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                    :class="{ 'border-red-300 bg-red-50': forgotEmailError }"
                    @blur="validateForgotEmail"
                  />
                </div>
                <p v-if="forgotEmailError" class="text-red-500 text-xs mt-1.5 ml-1">{{ forgotEmailError }}</p>
              </div>

              <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-3.5">
                <p class="text-red-600 text-sm">{{ error }}</p>
              </div>

              <button
                @click="handleForgot"
                :disabled="loading"
                class="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform disabled:opacity-50"
              >
                <span v-if="loading">Sending...</span>
                <span v-else>Send Reset Link</span>
              </button>
            </div>
          </div>
        </transition>

        <!-- Login Panel -->
        <transition name="slide-fade">
          <div v-if="!showForgot" class="space-y-4">

            <!-- Google Sign-In -->
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
              <span class="text-gray-400 text-xs font-medium">or</span>
              <div class="flex-1 h-px bg-gray-200"></div>
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
              <div class="flex justify-between items-center mb-1.5">
                <label class="text-sm font-semibold text-gray-700">Password</label>
                <button type="button" class="text-sm text-gray-400 font-medium active:opacity-60" @click="showForgot = true">
                  Forgot?
                </button>
              </div>
              <div class="relative">
                <ion-icon :icon="lockClosedOutline" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></ion-icon>
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Your password"
                  class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm font-medium outline-none focus:border-gray-400 focus:bg-white transition-all"
                  :class="{ 'border-red-300 bg-red-50': passwordError }"
                  @blur="validatePassword"
                />
                <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 active:opacity-60" @click="showPassword = !showPassword">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" class="text-lg"></ion-icon>
                </button>
              </div>
              <p v-if="passwordError" class="text-red-500 text-xs mt-1.5 ml-1">{{ passwordError }}</p>
            </div>

            <!-- Error -->
            <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-3.5">
              <p class="text-red-600 text-sm">{{ error }}</p>
            </div>

            <!-- Login Button -->
            <button
              @click="handleLogin"
              :disabled="loading"
              class="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform disabled:opacity-50 shadow-sm"
            >
              <span v-if="loading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>

            <!-- Register Link -->
            <p class="text-center text-gray-500 text-sm pt-2">
              Don't have an account?
              <router-link to="/register" class="text-gray-900 font-bold ml-1">Sign up</router-link>
            </p>

          </div>
        </transition>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import {
  checkmarkDoneCircleOutline, mailOutline, lockClosedOutline,
  eyeOutline, eyeOffOutline, arrowBackOutline, checkmarkCircleOutline
} from 'ionicons/icons'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, loginWithGoogle, forgotPassword, loading, error } = useAuth()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const showForgot = ref(false)
const forgotEmail = ref('')
const resetSent = ref(false)

const emailError = ref('')
const passwordError = ref('')
const forgotEmailError = ref('')

function validateEmail() {
  if (!email.value) return (emailError.value = 'Please enter your email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return (emailError.value = 'Invalid email format')
  emailError.value = ''
}
function validatePassword() {
  passwordError.value = !password.value ? 'Please enter your password' : ''
}
function validateForgotEmail() {
  if (!forgotEmail.value) return (forgotEmailError.value = 'Please enter your email')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.value)) return (forgotEmailError.value = 'Invalid email format')
  forgotEmailError.value = ''
}

async function handleLogin() {
  validateEmail(); validatePassword()
  if (emailError.value || passwordError.value) return
  const user = await login(email.value, password.value)
  if (user) router.push('/tabs/inbox')
}

async function handleGoogle() {
  const user = await loginWithGoogle()
  if (user) router.push('/tabs/inbox')
}

async function handleForgot() {
  validateForgotEmail()
  if (forgotEmailError.value) return
  const success = await forgotPassword(forgotEmail.value)
  if (success) resetSent.value = true
}
</script>

<style scoped>
.login-content {
  --background: #f9fafb;
}
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from { opacity: 0; transform: translateX(16px); }
.slide-fade-leave-to { opacity: 0; transform: translateX(-16px); }
</style>