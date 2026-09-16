<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import { getDoctorAppointment, updateDoctorAppointment } from '@/api/clinical'
import { useAuth } from '@/stores/auth'
import type { Department } from '@/types/user'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.role_codes.includes('ADMIN') || currentUser.value?.primary_role === 'ADMIN')
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const departments = ref<Department[]>([])
const form = reactive({ patient_name: '', appointment_date: '', status: 2, queue_no: 0, department_id: 0, period: 1, remark: '' })
const statusLabel = (value: number) => ({ 1: '待支付', 2: '已预约', 3: '已签到', 4: '就诊中', 5: '已完成', 6: '已取消', 7: '医生停诊取消', 8: '已过期', 9: '已退款' }[value] || '处理中')

onMounted(async () => {
  if (isAdmin.value) { loading.value = false; return }
  try {
    const [appointment, departmentData] = await Promise.all([getDoctorAppointment(Number(route.params.id)), getPublicDepartments()])
    departments.value = departmentData
    Object.assign(form, { patient_name: appointment.patient_name || '', appointment_date: appointment.appointment_date || '', status: appointment.status, queue_no: appointment.queue_no || 0, department_id: appointment.department_id || departmentData[0]?.id || 0, period: appointment.period || 1, remark: appointment.remark || '' })
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '预约详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})

const save = async () => {
  if (isAdmin.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const { status: _status, ...editable } = form
    await updateDoctorAppointment(Number(route.params.id), editable)
    await router.replace('/doctor/appointments')
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '预约保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout role="doctor"><div class="page"><RouterLink class="back" to="/doctor/appointments"><ArrowLeft :size="16" />返回预约处理</RouterLink><header><p>预约处理</p><h1>编辑预约</h1></header><div v-if="isAdmin" class="notice info"><CircleAlert :size="16" />管理员可以浏览医生页面；预约修改请使用有权限的医生账号。</div><div v-else-if="loading" class="state">正在加载预约详情…</div><template v-else><div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><form class="form" @submit.prevent="save"><label>患者姓名<input v-model="form.patient_name" required maxlength="50" /></label><label>预约日期<input v-model="form.appointment_date" type="date" required /></label><label>预约状态<div class="readonly-status">{{ statusLabel(form.status) }}</div></label><label>排队号<input v-model.number="form.queue_no" type="number" min="0" required /></label><label>科室<select v-model.number="form.department_id" required><option v-for="item in departments" :key="item.id" :value="item.id">{{ item.name }}</option></select></label><label>时段<select v-model.number="form.period"><option :value="1">上午</option><option :value="2">下午</option><option :value="3">晚上</option></select></label><label class="wide">备注<textarea v-model="form.remark" rows="4" maxlength="500"></textarea></label><button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '保存中' : '保存预约' }}</button></form></template></div></WorkspaceLayout>
</template>

<style scoped>
.page{max-width:900px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.form{padding:26px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.form label{display:grid;gap:7px;color:#475569;font-size:12px;font-weight:600}.form input,.form select,.form textarea{min-height:42px;padding:0 11px;color:#1e293b;background:#f8fafc;border:1px solid #dbe3ec;border-radius:6px}.form textarea{padding-top:10px;resize:vertical}.wide{grid-column:1/-1}.primary{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;color:#fff;background:#2563eb;border:0;border-radius:6px;cursor:pointer}.primary:disabled{opacity:.6}.state{padding:48px;color:#64748b;text-align:center}.notice{margin-bottom:16px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}.notice.info{color:#1e4f80;background:#e4f0fb}@media(max-width:620px){.form{grid-template-columns:1fr;padding:18px}.wide{grid-column:auto}}
</style>
