<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CalendarDays,
  CircleAlert,
  Clock3,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  deleteDepartmentManagerSchedule,
  getDepartmentManagerDoctors,
  getDepartmentManagerSchedules,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerDoctor, Schedule } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const doctors = ref<DepartmentManagerDoctor[]>([])
const schedules = ref<Schedule[]>([])
const doctorId = ref<number | undefined>()
const scheduleDate = ref('')
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')

const doctorName = (id: number) =>
  doctors.value.find((item) => item.id === id)?.real_name || `医生 ${id}`

const periodLabel = (value: number) =>
  ({
    1: '上午',
    2: '下午',
    3: '晚上',
  })[value] || '其他'

const statusLabel = (value: number) =>
  ({
    0: '未开始',
    1: '可预约',
    2: '停诊',
    3: '已结束',
  })[value] || '未知'

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [doctorData, scheduleData] = await Promise.all([
      getDepartmentManagerDoctors(),
      getDepartmentManagerSchedules(doctorId.value, scheduleDate.value || undefined),
    ])
    doctors.value = doctorData
    schedules.value = scheduleData
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室排班加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const search = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    schedules.value = await getDepartmentManagerSchedules(
      doctorId.value,
      scheduleDate.value || undefined,
    )
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室排班加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const remove = async (item: Schedule) => {
  if (!window.confirm(`确定删除 ${item.schedule_date} 的这条排班吗？`)) {
    return
  }

  try {
    await deleteDepartmentManagerSchedule(item.id)
    notice.value = '排班已删除'
    await search()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班删除失败，请稍后重试。'
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <header class="portal-heading">
        <div>
          <p>门诊安排</p>
          <h1>科室排班</h1>
          <span>管理负责科室医生的出诊日期、时段与号源</span>
        </div>
        <RouterLink
          class="portal-primary"
          to="/department/schedules/create"
        >
          <Plus :size="16" />
          新增排班
        </RouterLink>
      </header>

      <form
        class="filters"
        @submit.prevent="search"
      >
        <label>
          <Search :size="16" />
          <select v-model="doctorId">
            <option :value="undefined">全部医生</option>
            <option
              v-for="item in doctors"
              :key="item.id"
              :value="item.id"
            >
              {{ item.real_name }}
            </option>
          </select>
        </label>
        <label>
          排班日期
          <input
            v-model="scheduleDate"
            type="date"
          />
        </label>
        <button type="submit">查询</button>
      </form>

      <div
        v-if="notice"
        class="portal-notice success"
      >
        {{ notice }}
      </div>
      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <section class="table-section">
        <div class="table-section-header">
          <div>
            <h2>排班记录</h2>
            <p>共 {{ schedules.length }} 条</p>
          </div>
          <CalendarDays :size="18" />
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载排班…
        </div>
        <div
          v-else-if="!schedules.length"
          class="table-empty"
        >
          暂无排班记录。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>医生</th>
                <th>时段</th>
                <th>就诊时间</th>
                <th>号源</th>
                <th>挂号费</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in schedules"
                :key="item.id"
              >
                <td>{{ item.schedule_date }}</td>
                <td>{{ doctorName(item.doctor_id) }}</td>
                <td>{{ periodLabel(item.period) }}</td>
                <td>{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}</td>
                <td>{{ item.booked_count }}/{{ item.total_count }}</td>
                <td>¥{{ Number(item.fee || 0).toFixed(2) }}</td>
                <td>
                  <span class="table-status">{{ statusLabel(item.status) }}</span>
                </td>
                <td class="compact-cell">
                  <div class="table-actions">
                    <RouterLink
                      class="table-link"
                      :to="`/department/schedules/${item.id}/slots`"
                    >
                      <Clock3 :size="14" />
                      时间段
                    </RouterLink>
                    <RouterLink
                      class="table-link"
                      :to="`/department/schedules/${item.id}/edit`"
                    >
                      <Pencil :size="14" />
                      编辑
                    </RouterLink>
                    <button
                      class="table-action danger"
                      type="button"
                      @click="remove(item)"
                    >
                      <Trash2 :size="14" />
                      删除
                    </button>
                  </div>
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
.filters {
  margin-bottom: 16px;
  padding: 13px;
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.filters label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
}

.filters label:first-child {
  min-width: 220px;
  padding-left: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.filters select,
.filters input {
  min-height: 40px;
  padding: 0 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.filters label:first-child select {
  width: 100%;
  border: 0;
  outline: 0;
}

.filters button {
  min-width: 82px;
  min-height: 40px;
  color: #fff;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  cursor: pointer;
}

.table-action.danger {
  color: var(--danger);
  background: var(--danger-soft);
}

@media (max-width: 620px) {
  .filters {
    align-items: stretch;
    flex-direction: column;
  }

  .filters label:first-child {
    min-width: 0;
  }
}
</style>
