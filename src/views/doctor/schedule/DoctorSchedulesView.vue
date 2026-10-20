<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  ArrowLeft,
  CircleAlert,
  Eye,
  FilePlus2,
  Pencil,
  Trash2,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import { getDoctorSchedules } from '@/api/doctor'
import { deleteDoctorScheduleRequest } from '@/api/scheduleApproval'
import type { Department, Schedule } from '@/types/user'

/**
 * 医生正式排班查看页面
 *
 * 使用表格展示审核通过后已经生效的正式排班。
 */
const items = ref<Schedule[]>([])
const loading = ref(true)
const savingId = ref<number | null>(null)
const errorMessage = ref('')
const notice = ref('')
const departmentNames = ref<Record<number, string>>({})

const departmentName = (item: Schedule) =>
  item.department_name || departmentNames.value[item.department_id] || `科室 ${item.department_id}`

const periodLabel = (value: number) =>
  (({ 1: '上午', 2: '下午', 3: '晚上' }) as Record<number, string>)[value] || '其他时段'

const statusLabel = (value: number) =>
  (({ 0: '未开始', 1: '可预约', 2: '停诊', 3: '已结束' }) as Record<number, string>)[value] ||
  '未知状态'

const statusClass = (value: number) =>
  value === 1 ? 'table-status' : value === 2 ? 'table-status warning' : 'table-status muted'

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [scheduleList, departmentList] = await Promise.all([
      getDoctorSchedules(),
      getPublicDepartments(),
    ])
    items.value = scheduleList
    departmentNames.value = Object.fromEntries(
      departmentList.map((department: Department) => [department.id, department.name]),
    )
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const requestDelete = async (item: Schedule) => {
  if (!window.confirm(`确定提交 ${item.schedule_date} 的删除申请吗？`)) {
    return
  }

  savingId.value = item.id
  errorMessage.value = ''
  notice.value = ''

  try {
    await deleteDoctorScheduleRequest(item.id)
    notice.value = '删除申请已提交，等待审核'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '删除申请提交失败，请稍后重试。'
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/doctor/home"
      >
        <ArrowLeft :size="16" />
        返回医生首页
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>门诊安排</p>
          <h1>我的排班</h1>
          <span>这里展示审核通过并已生效的正式排班。</span>
        </div>
        <RouterLink
          class="portal-primary"
          to="/doctor/schedule-requests/create"
        >
          <FilePlus2 :size="16" />
          提交排班申请
        </RouterLink>
      </header>

      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <div
        v-if="notice"
        class="portal-notice success"
      >
        {{ notice }}
      </div>

      <section class="table-section">
        <div class="table-section-header">
          <div>
            <h2>正式排班</h2>
            <p>共 {{ items.length }} 条记录</p>
          </div>
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载排班…
        </div>
        <div
          v-else-if="!items.length"
          class="table-empty"
        >
          暂无正式排班。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>日期</th>
                <th>科室</th>
                <th>时段</th>
                <th>门诊时间</th>
                <th>号源</th>
                <th>挂号费</th>
                <th>状态</th>
                <th class="compact-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
              >
                <td>{{ item.schedule_date }}</td>
                <td>{{ departmentName(item) }}</td>
                <td>{{ periodLabel(item.period) }}</td>
                <td>{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}</td>
                <td>{{ item.booked_count }}/{{ item.total_count }}</td>
                <td>¥{{ Number(item.fee || 0).toFixed(2) }}</td>
                <td>
                  <span :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td class="compact-cell">
                  <div class="table-actions">
                    <RouterLink
                      class="table-action"
                      :to="`/doctor/schedules/${item.id}/slots`"
                      title="查看时间段"
                    >
                      <Eye :size="14" />
                      时间段
                    </RouterLink>
                    <RouterLink
                      class="table-action"
                      :to="`/doctor/schedule-requests/create?type=2&schedule_id=${item.id}`"
                      title="申请修改"
                    >
                      <Pencil :size="14" />
                      修改
                    </RouterLink>
                    <button
                      class="table-action danger-action"
                      type="button"
                      :disabled="savingId === item.id"
                      @click="requestDelete(item)"
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
.danger-action {
  color: var(--danger);
  background: var(--danger-soft);
}

.danger-action:disabled,
.table-action:disabled {
  opacity: 0.55;
  cursor: wait;
}
</style>
