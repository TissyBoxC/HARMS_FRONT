<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  createDepartmentManagerSchedule,
  getDepartmentManagerDoctors,
  getDepartmentManagerScope,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerDoctor, ScheduleRequest } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const router = useRouter()
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const doctors = ref<DepartmentManagerDoctor[]>([])
const saving = ref(false)
const loading = ref(true)
const notice = ref('')
const errorMessage = ref('')
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
    const [scope, doctorData] = await Promise.all([
      getDepartmentManagerScope(),
      getDepartmentManagerDoctors(),
    ])
    doctors.value = doctorData
    form.department_id = scope.department_ids[0] || doctorData[0]?.department_id || 0
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室医生加载失败，请稍后重试。'
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
  form.fee = Number(doctor?.consultation_fee || 0)
}

const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await createDepartmentManagerSchedule(form)
    notice.value = '排班已创建'
    setTimeout(() => router.replace('/department/schedules'), 500)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班创建失败，请稍后重试。'
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
          <h1>新增排班</h1>
          <span>选择负责科室医生后填写出诊安排</span>
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
        正在加载信息…
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
              value=""
              disabled
            >
              请选择医生
            </option>
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
          {{ saving ? '创建中' : '创建排班' }}
        </button>
      </form>
    </div>
  </WorkspaceLayout>
</template>
