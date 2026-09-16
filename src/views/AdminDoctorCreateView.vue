<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminDepartments } from '@/api/department'
import { createAdminDoctor } from '@/api/admin'
import type { Department } from '@/types/user'

const router = useRouter()
const departments = ref<Department[]>([])
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const form = reactive({ username: '', password: '', department_id: 0, doctor_no: '', real_name: '', title: '', specialty: '', introduction: '', avatar_url: '', consultation_fee: 0 })
onMounted(async () => { try { departments.value = await getAdminDepartments(); form.department_id = departments.value[0]?.id || 0 } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '科室加载失败，请稍后重试。' } })
const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''
  try { await createAdminDoctor(form); notice.value = '医生账户已创建'; setTimeout(() => router.replace('/admin/users/manage'), 500) }
  catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '医生账户创建失败，请稍后重试。' }
  finally { saving.value = false }
}
</script>

<template>
  <WorkspaceLayout role="admin"><div class="page"><RouterLink class="back" to="/admin/users/manage"><ArrowLeft :size="16" />返回账号管理</RouterLink><header><p>账号管理</p><h1>新增医生账户</h1></header><div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div><div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><form class="form" @submit.prevent="save"><label>登录用户名<input v-model="form.username" required maxlength="50" /></label><label>初始密码<input v-model="form.password" required minlength="8" maxlength="64" type="password" /></label><label>所属科室<select v-model.number="form.department_id" required><option v-for="item in departments" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label>医生工号<input v-model="form.doctor_no" required maxlength="50" /></label><label>姓名<input v-model="form.real_name" required maxlength="50" /></label><label>职称<input v-model="form.title" maxlength="50" /></label><label>擅长方向<input v-model="form.specialty" maxlength="255" /></label><label>挂号费<input v-model.number="form.consultation_fee" type="number" min="0" step="0.01" required /></label><label class="wide">个人简介<textarea v-model="form.introduction" rows="4" maxlength="1000"></textarea></label><label class="wide">头像地址<input v-model="form.avatar_url" maxlength="500" /></label><button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '创建中' : '创建医生账户' }}</button></form></div></WorkspaceLayout>
</template>

<style scoped>
.page{max-width:900px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.form{padding:26px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.form label{display:grid;gap:7px;color:var(--ink);font-size:12px;font-weight:650}.form input,.form select,.form textarea{min-height:42px;padding:0 11px;background:var(--surface);border:1px solid var(--border-strong);border-radius:5px}.form textarea{padding-top:10px;resize:vertical}.wide{grid-column:1/-1}.primary{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;color:#fff;background:var(--primary);border:0;border-radius:5px;cursor:pointer}.primary:disabled{opacity:.6}.notice{margin-bottom:14px;padding:12px;display:flex;gap:8px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}@media(max-width:620px){.form{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
