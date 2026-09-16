<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPatientProfile, updatePatientProfile } from '@/api/patient'
import { useAuth } from '@/stores/auth'

const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const profile = ref<{ id_card: string; birthday: string | null; gender: number } | null>(null)
const form = reactive({ real_name: '', phone: '', address: '', emergency_contact: '', emergency_phone: '' })
const { currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.role_codes.includes('ADMIN') || currentUser.value?.primary_role === 'ADMIN')
const load = async () => {
  try {
    const data = await getPatientProfile()
    profile.value = data
    Object.assign(form, { real_name: data.real_name, phone: data.phone, address: data.address || '', emergency_contact: data.emergency_contact || '', emergency_phone: data.emergency_phone || '' })
  } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '资料加载失败，请稍后重试。' } finally { loading.value = false }
}
const save = async () => {
  notice.value = ''; errorMessage.value = ''; saving.value = true
  try { profile.value = await updatePatientProfile(form); notice.value = '个人资料已保存' } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '保存失败，请稍后重试。' } finally { saving.value = false }
}
onMounted(() => {
  if (isAdmin.value) {
    loading.value = false
    return
  }
  void load()
})
</script>

<template>
  <div class="role-page profile-page">
    <header class="role-heading"><p>个人资料</p><h1>我的资料</h1><span>维护联系电话和就诊时使用的联系信息。</span></header>
    <div v-if="loading" class="state">正在加载资料…</div>
    <template v-else-if="isAdmin">
      <div class="notice info"><CircleAlert :size="16" />管理员可以浏览患者端页面；患者个人资料请在管理工作台的账号列表中维护。</div>
      <RouterLink class="back-link" to="/admin/users/accounts">返回账号列表</RouterLink>
    </template>
    <template v-else>
      <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
      <div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div>
      <form class="profile-form" @submit.prevent="save">
        <div class="readonly-grid"><div><span>身份证号</span><strong>{{ profile?.id_card }}</strong></div><div><span>出生日期</span><strong>{{ profile?.birthday || '未填写' }}</strong></div></div>
        <label>姓名<input v-model="form.real_name" required /></label>
        <label>联系电话<input v-model="form.phone" required /></label>
        <label class="wide">联系地址<input v-model="form.address" /></label>
        <label>紧急联系人<input v-model="form.emergency_contact" /></label>
        <label>紧急电话<input v-model="form.emergency_phone" /></label>
        <button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '保存中' : '保存资料' }}</button>
      </form>
    </template>
  </div>
</template>

<style scoped>
.role-page { width: min(100% - 48px, 960px); margin: 0 auto; padding: 72px 0 110px; }.role-heading p { color: var(--primary); font-size: 12px; font-weight: 650; }.role-heading h1 { margin-top: 12px; font-family: var(--font-serif); font-size: 46px; font-weight: 500; }.role-heading span { display: block; margin-top: 12px; color: var(--muted); font-size: 14px; }.profile-form { margin-top: 42px; padding: 28px; display: grid; grid-template-columns: repeat(2,1fr); gap: 18px; background: var(--surface-strong); border: 1px solid var(--border); border-radius: 8px; }.profile-form label { display: grid; gap: 7px; color: var(--muted); font-size: 12px; font-weight: 600; }.profile-form input { min-height: 44px; padding: 0 11px; color: var(--ink); background: #fff; border: 1px solid var(--border-strong); border-radius: 5px; }.wide { grid-column: 1/-1; }.readonly-grid { grid-column: 1/-1; display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; }.readonly-grid div { padding: 13px; display: grid; gap: 6px; background: var(--primary-soft); border-radius: 6px; }.readonly-grid span { color: var(--muted); font-size: 11px; }.readonly-grid strong { font-size: 13px; }.primary { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; color: #fff; background: var(--primary); border: 0; border-radius: 5px; cursor: pointer; font-weight: 650; }.primary:disabled { opacity: .6; }.notice { margin-bottom: 16px; padding: 12px 14px; display: flex; gap: 8px; align-items: center; border-radius: 6px; font-size: 13px; }.notice.success { color: #166534; background: #dcfce7; }.notice.error { color: var(--danger); background: var(--danger-soft); }.notice.info { color: #1e4f80; background: #e4f0fb; }.back-link { color: var(--primary); font-size: 13px; font-weight: 650; text-decoration: none; }.state { padding: 48px; color: var(--muted); text-align: center; }@media(max-width:620px){.role-page{width:calc(100% - 28px);padding:48px 0 72px}.role-heading h1{font-size:38px}.profile-form{grid-template-columns:1fr;padding:18px}.readonly-grid{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
