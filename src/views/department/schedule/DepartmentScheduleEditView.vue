<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  getDepartmentManagerDoctors,
  getDepartmentManagerSchedule,
  updateDepartmentManagerSchedule,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerDoctor, ScheduleRequest } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const doctors = ref<DepartmentManagerDoctor[]>([])
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const scheduleId = Number(route.params.id)
const form = reactive<ScheduleRequest>({
  doctor_id: null,
  department_id: 0,
  schedule_date: '',
  period: 1,
  start_time: '08:00',
  end_time: '12:00',
  total_count: 20,
  fee: 0,
  remark: '',
})

const selectedDoctor = computed(() =>
  doctors.value.find((item) => item.id === form.doctor_id),
)

onMounted(async () => {
  try {
    const [doctorData, schedule] = await Promise.all([
      getDepartmentManagerDoctors(),
      getDepartmentManagerSchedule(scheduleId),
    ])
    doctors.value = doctorData
    Object.assign(form, {
      doctor_id: schedule.doctor_id,
      department_id: schedule.department_id,
      schedule_date: schedule.schedule_date,
      period: schedule.period,
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
      total_count: schedule.total_count,
      fee: Number(schedule.fee || 0),
      remark: schedule.remark || '',
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})

const selectDoctor = (event: Event) => {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  const id = Number(target.value)
  const doctor = doctors.value.find((item) => item.id === id)
  form.doctor_id = id
  form.department_id = doctor?.department_id || form.department_id
}

const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await updateDepartmentManagerSchedule(scheduleId, form)
    notice.value = '排班已保存'
    setTimeout(() => router.replace('/department/schedules'), 500)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/department/schedules"
      >
        <ArrowLeft :size="16" />
        返回科室排班
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>门诊安排</p>
          <h1>编辑排班</h1>
          <span>已有预约的排班不能修改</span>
        </div>
      </header>

      <div
        v-if="notice"
        class="portal-notice success"
      >
        <Check :size="16" />
        {{ notice }}
      </div>
      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载排班…
      </div>
      <form
        v-else
        class="portal-form"
        @submit.prevent="save"
      >
        <label>
          医生
          <select
            :value="form.doctor_id || ''"
            required
            @change="selectDoctor"
          >
            <option
              v-for="item in doctors"
              :key="item.id"
              :value="item.id"
            >
              {{ item.real_name }} · {{ item.department_name }}
            </option>
          </select>
        </label>
        <label>
          所属科室
          <input
            :value="selectedDoctor?.department_name || ''"
            readonly
          />
        </label>
        <label>
          排班日期
          <input
            v-model="form.schedule_date"
            type="date"
            required
          />
        </label>
        <label>
          时段
          <select v-model.number="form.period">
            <option :value="1">上午</option>
            <option :value="2">下午</option>
            <option :value="3">晚上</option>
          </select>
        </label>
        <label>
          开始时间
          <input
            v-model="form.start_time"
            type="time"
            required
          />
        </label>
        <label>
          结束时间
          <input
            v-model="form.end_time"
            type="time"
            required
          />
        </label>
        <label>
          总号源
          <input
            v-model.number="form.total_count"
            type="number"
            min="1"
            required
          />
        </label>
        <label>
          挂号费
          <input
            v-model.number="form.fee"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
        <label class="portal-wide">
          备注
          <textarea
            v-model="form.remark"
            rows="3"
          ></textarea>
        </label>
        <button
          class="portal-primary portal-wide"
          type="submit"
          :disabled="saving"
        >
          <Save :size="16" />
          {{ saving ? '保存中' : '保存排班' }}
        </button>
      </form>
    </div>
  </WorkspaceLayout>
</template>
