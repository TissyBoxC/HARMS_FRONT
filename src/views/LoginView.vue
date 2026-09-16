<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ArrowRight, Eye, EyeOff, HeartPulse, LoaderCircle } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/http'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { signIn, rolePath } = useAuth()
const form = reactive({ username: '', password: '' })
const errors = reactive({ username: '', password: '' })
const serverError = ref('')
const isSubmitting = ref(false)
const showPassword = ref(false)

const targetPath = computed(() => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  return redirect.startsWith('/') ? redirect : ''
})

const validate = () => {
  errors.username = form.username.trim() ? '' : '请输入用户名。'
  errors.password = form.password ? '' : '请输入密码。'
  return !errors.username && !errors.password
}

const handleSubmit = async () => {
  serverError.value = ''
  if (!validate()) return
  isSubmitting.value = true
  try {
    const user = await signIn({ username: form.username.trim(), password: form.password })
    const destination = targetPath.value || rolePath(user.primary_role)
    await router.replace(destination)
  } catch (error) {
    serverError.value = error instanceof ApiError ? error.message : '登录失败，请稍后重试。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-brand"><span><HeartPulse :size="22" :stroke-width="1.8" /></span><strong>CLARK</strong></div>
      <header class="login-heading">
        <p>欢迎回来</p>
        <h1 id="login-title">登录账号</h1>
        <span>使用已注册的账号进入服务。</span>
      </header>

      <form novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="login-username">用户名</label>
          <input id="login-username" v-model="form.username" type="text" maxlength="50" autocomplete="username" placeholder="请输入用户名" :aria-invalid="Boolean(errors.username)" />
          <p v-if="errors.username" class="field-error">{{ errors.username }}</p>
        </div>
        <div class="field">
          <label for="login-password">密码</label>
          <div class="password-input">
            <input id="login-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入密码" :aria-invalid="Boolean(errors.password)" />
            <button type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :title="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="18" :stroke-width="1.7" />
              <Eye v-else :size="18" :stroke-width="1.7" />
            </button>
          </div>
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>
        <div v-if="serverError" class="server-error" role="alert">{{ serverError }}</div>
        <button class="submit-button" type="submit" :disabled="isSubmitting">
          <LoaderCircle v-if="isSubmitting" class="spin" :size="18" :stroke-width="1.8" />
          <span>{{ isSubmitting ? '正在登录' : '登录' }}</span>
          <ArrowRight v-if="!isSubmitting" :size="18" :stroke-width="1.8" />
        </button>
      </form>

      <p class="register-prompt">还没有账号？ <RouterLink to="/register">创建患者账号</RouterLink></p>
    </section>
  </div>
</template>

<style scoped>
.login-page { width: min(100% - 48px, 560px); margin: 0 auto; padding: 84px 0 110px; }
.login-panel { padding: 48px 56px 42px; background: var(--surface-strong); border: 1px solid var(--border); border-radius: 8px; }
.login-brand { display: inline-flex; align-items: center; gap: 10px; color: var(--primary); }
.login-brand span { width: 38px; height: 38px; display: grid; place-items: center; color: var(--surface); background: var(--primary); border-radius: 6px; }
.login-brand strong { font-family: var(--font-serif); font-size: 21px; }
.login-heading { margin: 42px 0 34px; }
.login-heading p { color: var(--primary); font-size: 12px; font-weight: 650; }
.login-heading h1 { margin-top: 10px; font-family: var(--font-serif); font-size: 38px; font-weight: 500; }
.login-heading span { display: block; margin-top: 12px; color: var(--muted); font-size: 13px; }
.field { margin-top: 24px; }
.field label { display: block; margin-bottom: 10px; color: var(--muted); font-size: 12px; font-weight: 600; }
.field input { width: 100%; height: 48px; padding: 0; color: var(--ink); background: transparent; border: 0; border-bottom: 1px solid var(--border-strong); font-family: var(--font-serif); font-size: 17px; outline: 0; }
.field input:focus { border-color: var(--primary); }
.field input[aria-invalid='true'] { border-color: var(--danger); }
.field input::placeholder { color: #adb4b0; font-family: var(--font-sans); font-size: 13px; }
.password-input { position: relative; }
.password-input input { padding-right: 42px; }
.password-input button { position: absolute; right: 0; bottom: 1px; width: 40px; height: 44px; display: grid; place-items: center; color: var(--muted); background: transparent; border: 0; cursor: pointer; }
.field-error { margin-top: 8px; color: var(--danger); font-size: 11px; }
.server-error { margin-top: 22px; padding: 13px 15px; color: var(--danger); background: var(--danger-soft); border: 1px solid color-mix(in srgb, var(--danger) 18%, var(--border)); border-radius: 5px; font-size: 12px; line-height: 1.6; }
.submit-button { width: 100%; min-height: 50px; margin-top: 30px; display: inline-flex; align-items: center; justify-content: center; gap: 12px; color: var(--surface); background: var(--primary); border: 1px solid var(--primary); border-radius: 5px; font-weight: 650; cursor: pointer; }
.submit-button:hover:not(:disabled) { background: var(--primary-hover); }
.submit-button:disabled { cursor: wait; opacity: .72; }
.register-prompt { margin-top: 28px; color: var(--muted); font-size: 12px; text-align: center; }
.register-prompt a { color: var(--primary); font-weight: 650; }
.spin { animation: spin 900ms linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 620px) { .login-page { width: calc(100% - 28px); padding: 46px 0 72px; } .login-panel { padding: 36px 24px 32px; } }
</style>
