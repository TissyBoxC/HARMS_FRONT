<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  UserRound,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorAppointments } from '@/api/clinical'
import type { AppointmentRecord } from '@/types/user'

const appointments = ref<AppointmentRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')

const pad = (value: number) => String(value).padStart(2, '0')

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const parseDateValue = (value: string) => {
  const parts = value.split('-')
  const year = Number(parts[0] ?? 0)
  const month = Number(parts[1] ?? 1)
  const day = Number(parts[2] ?? 1)
  return new Date(year, month - 1, day)
}

const addDays = (value: string, offset: number) => {
  const date = parseDateValue(value)
  date.setDate(date.getDate() + offset)
  return formatDateValue(date)
}

const today = formatDateValue(new Date())
const selectedDate = ref(today)
const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const dateOptions = computed(() =>
  Array.from({ length: 29 }, (_, index) => {
    const value = addDays(today, index - 14)
    const offset = index - 14
    const relative =
      offset === 0 ? '今天' : offset === -1 ? '昨天' : offset === 1 ? '明天' : ''
    const weekday = weekdays[parseDateValue(value).getDay()]

    return {
      value,
      label: `${relative ? `${relative} · ` : ''}${value} ${weekday}`,
    }
  }),
)

const filteredAppointments = computed(() =>
  appointments.value.filter(
    (item) =>
      normalizeDate(item.appointment_date) === selectedDate.value &&
      [2, 3, 4, 5].includes(item.status),
  ),
)

const normalizeDate = (value: string | null | undefined) => value?.slice(0, 10) || ''

const statusLabel = (status: number) =>
  ({
    2: '待签到',
    3: '已签到',
    4: '就诊中',
    5: '已完成',
  })[status] || '处理中'

const statusClass = (status: number) =>
  status === 3 || status === 4
    ? 'table-status'
    : status === 2
      ? 'table-status warning'
      : 'table-status muted'

const changeDate = (offset: number) => {
  const index = dateOptions.value.findIndex((item) => item.value === selectedDate.value)
  const target = dateOptions.value[index + offset]

  if (target) {
    selectedDate.value = target.value
  }
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    appointments.value = await getDoctorAppointments()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '接诊列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <header class="portal-heading">
        <div>
          <p>门诊接诊</p>
          <h1>接诊工作台</h1>
          <span>按就诊日期查看预约患者，进入接诊处理后完成签到、就诊记录和处方。</span>
        </div>
      </header>

      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <section class="date-toolbar">
        <CalendarDays :size="18" />
        <button
          class="date-arrow"
          type="button"
          title="前一天"
          @click="changeDate(-1)"
        >
          <ChevronLeft :size="17" />
        </button>
        <label>
          <span>就诊日期</span>
          <select v-model="selectedDate">
            <option
              v-for="item in dateOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </label>
        <button
          class="date-arrow"
          type="button"
          title="后一天"
          @click="changeDate(1)"
        >
          <ChevronRight :size="17" />
        </button>
        <button
          class="portal-secondary"
          type="button"
          :disabled="selectedDate === today"
          @click="selectedDate = today"
        >
          回到今天
        </button>
      </section>

      <section class="table-section">
        <div class="table-section-header">
          <div>
            <h2>预约患者</h2>
            <p>{{ selectedDate }} · 共 {{ filteredAppointments.length }} 人</p>
          </div>
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载预约患者…
        </div>
        <div
          v-else-if="!filteredAppointments.length"
          class="table-empty"
        >
          当前日期暂无需要接诊的患者。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>患者姓名</th>
                <th>就诊日期</th>
                <th>排队号</th>
                <th>科室</th>
                <th>联系电话</th>
                <th>状态</th>
                <th class="compact-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in filteredAppointments"
                :key="item.id"
              >
                <td>
                  <span class="patient-name">
                    <UserRound :size="15" />
                    {{ item.patient_name || '患者' }}
                  </span>
                </td>
                <td>{{ item.appointment_date || '未填写' }}</td>
                <td>{{ item.queue_no || '—' }}</td>
                <td>{{ item.department_name || '未填写' }}</td>
                <td>{{ item.patient_phone || '未填写' }}</td>
                <td>
                  <span :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="compact-cell">
                  <RouterLink
                    class="table-action"
                    :to="`/doctor/workstation/${item.id}`"
                  >
                    接诊处理
                    <ArrowRight :size="14" />
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.date-toolbar {
  margin-bottom: 18px;
  padding: 14px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.date-toolbar > svg {
  align-self: center;
  color: var(--primary);
}

.date-toolbar label {
  flex: 1;
  display: grid;
  gap: 6px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
}

.date-toolbar select {
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  cursor: pointer;
}

.date-arrow {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
}

.patient-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 650;
}

.patient-name svg {
  color: var(--primary);
}

@media (max-width: 680px) {
  .date-toolbar {
    align-items: stretch;
    flex-wrap: wrap;
  }

  .date-toolbar label {
    min-width: calc(100% - 96px);
  }

  .date-toolbar .portal-secondary {
    width: 100%;
  }
}
</style>
