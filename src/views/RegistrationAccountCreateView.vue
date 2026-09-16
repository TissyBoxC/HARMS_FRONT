<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft, CheckCircle2, CircleAlert, Eye, EyeOff, KeyRound, LoaderCircle, RotateCcw, Save, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createAdminRegistration } from '@/api/admin'
import type { AdminCreateAccountResult } from '@/types/user'

const form = reactive({ username: '', password: '', confirmPassword: '' })
const errors = reactive({ username: '', password: '', confirmPassword: '' })
const saving = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const result = ref<AdminCreateAccountResult | null>(null)

const clearErrors = () => {
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
  errorMessage.value = ''
}

const validate = () => {
  clearErrors()
  const username = form.username.trim()
  if (!username) errors.username = '请输入登录用户名。'
  else if (!/^[A-Za-z0-9_]{4,50}$/.test(username)) errors.username = '用户名需为 4-50 位字母、数字或下划线。'
  if (!form.password) errors.password = '请输入初始密码。'
  else if (form.password.length < 8) errors.password = '初始密码至少需要 8 个字符。'
  if (!form.confirmPassword) errors.confirmPassword = '请再次输入初始密码。'
  else if (form.password !== form.confirmPassword) errors.confirmPassword = '两次输入的密码不一致。'
  return !errors.username && !errors.password && !errors.confirmPassword
}

const submit = async () => {
  if (!validate()) return
  saving.value = true
  try {
    result.value = await createAdminRegistration({ username: form.username.trim(), password: form.password })
    form.username = ''
    form.password = ''
    form.confirmPassword = ''
    showPassword.value = false
    showConfirmPassword.value = false
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '挂号员账户创建失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

const resetForm = () => {
  result.value = null
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  showPassword.value = false
  showConfirmPassword.value = false
  clearErrors()
}
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="registration-page">
      <RouterLink class="back-link" to="/admin/users/accounts"><ArrowLeft :size="16" />返回账户列表</RouterLink>
      <header class="page-header">
        <p>账号管理</p>
        <h1>新增挂号员账户</h1>
        <span>创建一个供服务台使用的登录账号。</span>
      </header>

      <section class="registration-panel">
        <div v-if="result" class="success-panel" role="status">
          <span class="success-icon"><CheckCircle2 :size="34" /></span>
          <h2>账户创建成功</h2>
          <p>挂号员现在可以使用新账号登录工作台。</p>
          <dl class="result-list">
            <div><dt>登录用户名</dt><dd>{{ result.username }}</dd></div>
            <div><dt>账号编号</dt><dd>{{ result.user_id }}</dd></div>
          </dl>
          <div class="success-actions">
            <RouterLink class="primary-link" to="/admin/users/accounts">查看账户列表</RouterLink>
            <button class="secondary-button" type="button" @click="resetForm"><RotateCcw :size="16" />继续创建</button>
          </div>
        </div>

        <form v-else class="account-form" novalidate @submit.prevent="submit">
          <div v-if="errorMessage" class="notice error"><CircleAlert :size="17" /><span>{{ errorMessage }}</span></div>
          <section class="form-section">
            <div class="section-heading"><span><UserRound :size="18" /></span><div><p>第一步</p><h2>设置登录账号</h2></div></div>
            <div class="field-grid">
              <div class="field field-wide">
                <label for="username">登录用户名</label>
                <input id="username" v-model="form.username" type="text" maxlength="50" autocomplete="username" placeholder="4-50 位字母、数字或下划线" :aria-invalid="Boolean(errors.username)" />
                <p v-if="errors.username" class="field-error">{{ errors.username }}</p>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-heading"><span><KeyRound :size="18" /></span><div><p>第二步</p><h2>设置初始密码</h2></div></div>
            <div class="field-grid">
              <div class="field">
                <label for="password">初始密码</label>
                <div class="password-input">
                  <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" maxlength="64" autocomplete="new-password" placeholder="至少 8 个字符" :aria-invalid="Boolean(errors.password)" />
                  <button type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :title="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword"><EyeOff v-if="showPassword" :size="18" /><Eye v-else :size="18" /></button>
                </div>
                <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
              </div>
              <div class="field">
                <label for="confirmPassword">确认初始密码</label>
                <div class="password-input">
                  <input id="confirmPassword" v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" maxlength="64" autocomplete="new-password" placeholder="再次输入初始密码" :aria-invalid="Boolean(errors.confirmPassword)" />
                  <button type="button" :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'" :title="showConfirmPassword ? '隐藏密码' : '显示密码'" @click="showConfirmPassword = !showConfirmPassword"><EyeOff v-if="showConfirmPassword" :size="18" /><Eye v-else :size="18" /></button>
                </div>
                <p v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</p>
              </div>
            </div>
          </section>

          <div class="form-actions">
            <RouterLink class="secondary-button" to="/admin/users/accounts">取消</RouterLink>
            <button class="primary-button" type="submit" :disabled="saving"><LoaderCircle v-if="saving" class="spin" :size="17" /><Save v-else :size="17" />{{ saving ? '创建中' : '创建挂号员账户' }}</button>
          </div>
        </form>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.registration-page{max-width:960px}.back-link{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page-header{margin:28px 0 24px}.page-header p{color:var(--primary);font-size:12px;font-weight:700}.page-header h1{margin-top:8px;font-family:var(--font-serif);font-size:32px;font-weight:600}.page-header span{display:block;margin-top:10px;color:var(--muted);font-size:13px}.registration-panel{padding:30px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.account-form{display:grid;gap:26px}.form-section{display:grid;grid-template-columns:180px 1fr;gap:28px;padding-bottom:26px;border-bottom:1px solid var(--border)}.section-heading{display:flex;align-items:flex-start;gap:10px}.section-heading>span{width:34px;height:34px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:7px}.section-heading p{color:var(--faint);font-size:11px}.section-heading h2{margin-top:4px;font-size:17px;font-weight:650}.field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.field{display:grid;gap:7px}.field-wide{grid-column:1/-1}.field label{color:var(--ink);font-size:12px;font-weight:650}.field input{width:100%;min-height:44px;padding:0 12px;color:var(--ink);background:var(--surface);border:1px solid var(--border-strong);border-radius:5px}.field input[aria-invalid=true]{border-color:var(--danger)}.password-input{position:relative}.password-input input{padding-right:44px}.password-input button{position:absolute;top:50%;right:8px;display:grid;place-items:center;width:32px;height:32px;transform:translateY(-50%);color:var(--muted);background:transparent;border:0;cursor:pointer}.field-error{color:var(--danger);font-size:12px}.notice{padding:12px 14px;display:flex;align-items:center;gap:8px;color:var(--danger);background:var(--danger-soft);border:1px solid color-mix(in srgb,var(--danger) 20%,var(--border));border-radius:6px;font-size:13px}.form-actions{display:flex;justify-content:flex-end;gap:12px}.primary-button,.secondary-button,.primary-link{min-height:44px;padding:0 18px;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:5px;font-size:13px;font-weight:650;text-decoration:none;cursor:pointer}.primary-button,.primary-link{color:var(--surface-strong);background:var(--primary);border:1px solid var(--primary)}.primary-button:hover:not(:disabled),.primary-link:hover{background:var(--primary-hover)}.primary-button:disabled{cursor:wait;opacity:.65}.secondary-button{color:var(--primary);background:transparent;border:1px solid var(--border-strong)}.secondary-button:hover{background:var(--primary-soft)}.success-panel{min-height:430px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.success-icon{width:64px;height:64px;display:grid;place-items:center;color:var(--success);background:var(--primary-soft);border-radius:8px}.success-panel h2{margin-top:22px;font-family:var(--font-serif);font-size:26px;font-weight:600}.success-panel>p{margin-top:10px;color:var(--muted);font-size:13px}.result-list{width:min(100%,500px);margin:28px 0 0;border-top:1px solid var(--border)}.result-list div{padding:15px 0;display:flex;justify-content:space-between;gap:18px;border-bottom:1px solid var(--border)}.result-list dt{color:var(--muted);font-size:12px}.result-list dd{margin:0;font-size:15px;font-weight:650}.success-actions{margin-top:28px;display:flex;gap:12px}.spin{animation:spin .9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:700px){.registration-panel{padding:22px 18px}.form-section{grid-template-columns:1fr;gap:18px}.field-grid{grid-template-columns:1fr}.field-wide{grid-column:auto}.form-actions,.success-actions{flex-direction:column}.primary-button,.secondary-button,.primary-link{width:100%}}
</style>
