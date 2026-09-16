<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { CalendarPlus, CircleAlert, Search, UserRound } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPublicDoctors, getPublicSchedules, getPublicScheduleSlots } from '@/api/public-medical'
import { createRegistrationAppointment, getRegistrationPatients } from '@/api/registration-extended'
import type { PublicDoctor, PublicSchedule, PublicSlot } from '@/types/user'

const patients = ref<Record<string, unknown>[]>([])
const doctors = ref<PublicDoctor[]>([])
const schedules = ref<PublicSchedule[]>([])
const slots = ref<PublicSlot[]>([])
const form = reactive({ keyword: '', patient_id: '', doctor_id: '', schedule_id: '', slot_id: '', remark: '' })
const doctorsLoading = ref(false)
const schedulesLoading = ref(false)
const slotsLoading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')

const search = async () => {
  errorMessage.value = ''
  try {
    patients.value = await getRegistrationPatients(form.keyword)
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '患者查询失败，请稍后重试。'
  }
}

const loadDoctors = async () => {
  doctorsLoading.value = true
  errorMessage.value = ''
  try {
    doctors.value = await getPublicDoctors()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '医生信息加载失败，请稍后重试。'
  } finally {
    doctorsLoading.value = false
  }
}

const loadSchedules = async () => {
  form.schedule_id = ''
  form.slot_id = ''
  schedules.value = []
  slots.value = []
  if (!form.doctor_id) return
  schedulesLoading.value = true
  errorMessage.value = ''
  try {
    schedules.value = await getPublicSchedules({ doctor_id: Number(form.doctor_id) })
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '排班加载失败，请稍后重试。'
  } finally {
    schedulesLoading.value = false
  }
}

const loadSlots = async () => {
  form.slot_id = ''
  slots.value = []
  if (!form.schedule_id) return
  slotsLoading.value = true
  errorMessage.value = ''
  try {
    slots.value = await getPublicScheduleSlots(Number(form.schedule_id))
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '时间段加载失败，请稍后重试。'
  } finally {
    slotsLoading.value = false
  }
}

const periodLabel = (period: number) => ({ 1: '上午', 2: '下午', 3: '晚上' }[period] || '门诊')
const timeLabel = (value: string) => value?.slice(0, 5) || ''

const submit = async () => {
  saving.value = true
  errorMessage.value = ''
  try {
    await createRegistrationAppointment({
      patient_id: Number(form.patient_id),
      schedule_id: Number(form.schedule_id),
      slot_id: form.slot_id ? Number(form.slot_id) : null,
      remark: form.remark,
    })
    notice.value = '现场挂号已完成'
    form.patient_id = ''
    form.doctor_id = ''
    form.schedule_id = ''
    form.slot_id = ''
    form.remark = ''
    schedules.value = []
    slots.value = []
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '代挂号失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

onMounted(() => { void loadDoctors() })
</script>

<template>
  <WorkspaceLayout role="registration">
    <div class="page">
      <header>
        <p>挂号服务</p>
        <h1>现场挂号</h1>
      </header>

      <section class="panel">
        <form class="search" @submit.prevent="search">
          <input v-model="form.keyword" placeholder="姓名、手机号或证件号码" />
          <button type="submit"><Search :size="16" />检索患者</button>
        </form>
        <div class="patients">
          <button v-for="item in patients" :key="Number(item.id)" type="button" :class="{ active: form.patient_id === String(item.id) }" @click="form.patient_id = String(item.id)">
            <UserRound :size="15" />{{ item.real_name }} · {{ item.phone || '无电话' }}
          </button>
        </div>
      </section>

      <form class="panel form" @submit.prevent="submit">
        <label>患者编号<input v-model="form.patient_id" required inputmode="numeric" /></label>
        <label>医生
          <select v-model="form.doctor_id" required :disabled="doctorsLoading" @change="loadSchedules">
            <option value="">{{ doctorsLoading ? '正在加载医生…' : '请选择医生' }}</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="String(doctor.id)">{{ doctor.real_name }}{{ doctor.title ? ` · ${doctor.title}` : '' }}{{ doctor.specialty ? ` · ${doctor.specialty}` : '' }}</option>
          </select>
        </label>
        <label>排班
          <select v-model="form.schedule_id" required :disabled="!form.doctor_id || schedulesLoading" @change="loadSlots">
            <option value="">{{ schedulesLoading ? '正在加载排班…' : form.doctor_id ? '请选择该医生的排班' : '请先选择医生' }}</option>
            <option v-for="schedule in schedules" :key="schedule.id" :value="String(schedule.id)">{{ schedule.schedule_date }} · {{ periodLabel(schedule.period) }} · {{ timeLabel(schedule.start_time) }}—{{ timeLabel(schedule.end_time) }} · 剩余 {{ schedule.remaining_count }}</option>
          </select>
        </label>
        <label>时间段
          <select v-model="form.slot_id" :disabled="!form.schedule_id || slotsLoading">
            <option value="">{{ slotsLoading ? '正在加载时间段…' : '不指定时间段' }}</option>
            <option v-for="slot in slots" :key="slot.id" :value="String(slot.id)">{{ timeLabel(slot.start_time) }}—{{ timeLabel(slot.end_time) }}</option>
          </select>
        </label>
        <label class="wide">备注<textarea v-model="form.remark" rows="2"></textarea></label>
        <div v-if="notice" class="notice success">{{ notice }}</div>
        <div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div>
        <button class="primary wide" type="submit" :disabled="saving"><CalendarPlus :size="16" />{{ saving ? '办理中' : '完成现场挂号' }}</button>
      </form>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page{max-width:900px}.page header{margin-bottom:22px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.panel{padding:18px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.search{display:flex;gap:8px}.search input{flex:1;min-height:40px;padding:0 10px;border:1px solid var(--border-strong);border-radius:5px}.search button,.primary{min-height:40px;padding:0 13px;display:inline-flex;align-items:center;gap:6px;color:#fff;background:var(--primary);border:0;border-radius:5px;cursor:pointer}.search button:disabled,.primary:disabled{opacity:.55;cursor:not-allowed}.patients{margin-top:12px;display:flex;flex-wrap:wrap;gap:7px}.patients button{min-height:34px;padding:0 9px;display:inline-flex;align-items:center;gap:5px;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;cursor:pointer}.patients button.active{border-color:var(--primary)}.form{margin-top:16px;display:grid;grid-template-columns:repeat(2,1fr);gap:13px}.form label{display:grid;gap:6px;color:var(--ink);font-size:12px;font-weight:650}.form input,.form select,.form textarea{min-height:40px;padding:0 10px;background:var(--surface);border:1px solid var(--border-strong);border-radius:5px}.form select:disabled{color:var(--muted);background:var(--surface-soft);cursor:not-allowed}.form textarea{padding-top:9px}.wide{grid-column:1/-1}.notice{padding:10px;display:flex;gap:6px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}@media(max-width:620px){.form{grid-template-columns:1fr}.wide{grid-column:auto}.search{flex-direction:column}.search button{justify-content:center}}
</style>
