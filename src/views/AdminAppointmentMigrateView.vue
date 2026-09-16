<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminAppointment } from '@/api/adminAppointment'
import { getAdminSchedules, getAdminSlots, updateAdminAppointment } from '@/api/admin'
import type { AppointmentRecord, Schedule, Slot } from '@/types/user'

const route = useRoute()
const router = useRouter()
const appointment = ref<AppointmentRecord | null>(null)
const schedules = ref<Schedule[]>([])
const slots = ref<Slot[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const form = reactive({ schedule_id: 0, slot_id: 0, queue_no: 0, remark: '' })

const loadSlots = async () => {
  if (!form.schedule_id) { slots.value = []; return }
  try { slots.value = await getAdminSlots(form.schedule_id) } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '时间段加载失败，请稍后重试。' }
}
const load = async () => {
  try {
    const id = Number(route.params.id)
    const [detail, scheduleList] = await Promise.all([getAdminAppointment(id), getAdminSchedules()])
    appointment.value = detail
    schedules.value = scheduleList
    form.schedule_id = detail.schedule_id || 0
    form.slot_id = detail.slot_id || 0
    form.queue_no = detail.queue_no || 0
    form.remark = detail.remark || ''
    await loadSlots()
  } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '预约迁移信息加载失败，请稍后重试。' } finally { loading.value = false }
}
const save = async () => {
  saving.value = true; errorMessage.value = ''; notice.value = ''
  try {
    await updateAdminAppointment(Number(route.params.id), { schedule_id: form.schedule_id, slot_id: form.slot_id || null, queue_no: form.queue_no || null, remark: form.remark })
    notice.value = '预约已迁移'
    setTimeout(() => router.replace(`/admin/appointments/${route.params.id}`), 500)
  } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '预约迁移失败，请稍后重试。' } finally { saving.value = false }
}
onMounted(load)
</script>
<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <RouterLink class="back" :to="`/admin/appointments/${route.params.id}`"><ArrowLeft :size="16" />返回预约详情</RouterLink>
      <header><p>预约管理</p><h1>调整预约安排</h1></header>
      <div v-if="loading" class="state">正在加载预约信息…</div>
      <div v-else-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div>
      <template v-else>
        <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
        <section v-if="appointment" class="summary"><span>患者<strong>{{ appointment.patient_name || '未返回' }}</strong></span><span>当前日期<strong>{{ appointment.appointment_date || '未返回' }}</strong></span><span>当前医生<strong>{{ appointment.doctor_name || '未返回' }}</strong></span></section>
        <form class="form" @submit.prevent="save">
          <label>目标排班<select v-model.number="form.schedule_id" required @change="form.slot_id = 0; loadSlots()"><option :value="0" disabled>请选择排班</option><option v-for="item in schedules" :key="item.id" :value="item.id">{{ item.schedule_date }} · {{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }} · {{ item.booked_count }}/{{ item.total_count }}</option></select></label>
          <label>目标时间段<select v-model.number="form.slot_id"><option :value="0">不指定时间段</option><option v-for="item in slots" :key="item.id" :value="item.id" :disabled="item.status !== 0">第 {{ item.slot_no }} 号 · {{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}{{ item.status !== 0 ? '（不可用）' : '' }}</option></select></label>
          <label>队列号<input v-model.number="form.queue_no" type="number" min="1" /></label>
          <label class="wide">备注<textarea v-model="form.remark" rows="3" maxlength="500"></textarea></label>
          <button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '保存中' : '保存调整' }}</button>
        </form>
      </template>
    </div>
  </WorkspaceLayout>
</template>
<style scoped>.page{max-width:900px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;text-decoration:none;font-size:13px}.page header{margin:28px 0 24px}.page header p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.summary{padding:18px;display:flex;gap:28px;flex-wrap:wrap;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.summary span,.summary strong{display:block}.summary span{color:#64748b;font-size:12px}.summary strong{margin-top:5px;color:#1e293b;font-size:14px}.form{margin-top:16px;padding:22px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.form label{display:grid;gap:7px;color:#475569;font-size:12px;font-weight:600}.form input,.form select,.form textarea{min-height:40px;padding:0 10px;background:#f8fafc;border:1px solid #dbe3ec;border-radius:6px}.form textarea{padding-top:9px;resize:vertical}.wide{grid-column:1/-1}.primary{min-height:40px;display:inline-flex;align-items:center;justify-content:center;gap:7px;color:#fff;background:#2563eb;border:0;border-radius:6px;cursor:pointer}.primary:disabled{opacity:.6}.notice{padding:12px;display:flex;gap:7px;align-items:center;border-radius:6px}.notice.error{color:#b91c1c;background:#fee2e2}.notice.success{color:#166534;background:#dcfce7}.state{padding:45px;color:#64748b;text-align:center}@media(max-width:620px){.form{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
