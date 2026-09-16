<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createAdminPatient } from '@/api/admin'

const router = useRouter()
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const form = reactive({ username: '', password: '', real_name: '', id_card: '', gender: 0, birthday: '', phone: '', address: '', emergency_contact: '', emergency_phone: '' })
const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''
  try {
    await createAdminPatient({ ...form, birthday: form.birthday || null })
    notice.value = '患者账户已创建'
    setTimeout(() => router.replace('/admin/users/manage'), 500)
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '患者账户创建失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <RouterLink class="back" to="/admin/users/manage"><ArrowLeft :size="16" />返回账号管理</RouterLink>
      <header><p>账号管理</p><h1>新增患者账户</h1></header>
      <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
      <div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div>
      <form class="form" @submit.prevent="save">
        <label>登录用户名<input v-model="form.username" required maxlength="50" /></label>
        <label>初始密码<input v-model="form.password" required minlength="8" maxlength="64" type="password" /></label>
        <label>姓名<input v-model="form.real_name" required maxlength="50" /></label>
        <label>身份证号<input v-model="form.id_card" required maxlength="18" /></label>
        <label>性别<select v-model.number="form.gender"><option :value="0">未知</option><option :value="1">男</option><option :value="2">女</option></select></label>
        <label>出生日期<input v-model="form.birthday" type="date" /></label>
        <label>联系电话<input v-model="form.phone" required maxlength="20" /></label>
        <label>联系地址<input v-model="form.address" maxlength="255" /></label>
        <label>紧急联系人<input v-model="form.emergency_contact" maxlength="50" /></label>
        <label>紧急电话<input v-model="form.emergency_phone" maxlength="20" /></label>
        <button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '创建中' : '创建患者账户' }}</button>
      </form>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page{max-width:900px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.form{padding:26px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.form label{display:grid;gap:7px;color:var(--ink);font-size:12px;font-weight:650}.form input,.form select{min-height:42px;padding:0 11px;background:var(--surface);border:1px solid var(--border-strong);border-radius:5px}.wide{grid-column:1/-1}.primary{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;color:#fff;background:var(--primary);border:0;border-radius:5px;cursor:pointer}.primary:disabled{opacity:.6}.notice{margin-bottom:14px;padding:12px;display:flex;gap:8px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}@media(max-width:620px){.form{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
