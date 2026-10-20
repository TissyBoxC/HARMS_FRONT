<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  RefreshCw,
  X,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { useAuth } from '@/stores/auth'
import {
  approveScheduleRequest,
  getScheduleRequests,
  rejectScheduleRequest,
} from '@/api/scheduleApproval'
import type { ScheduleRequestRecord } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

/**
 * 排班申请处理页面
 *
 * 管理员、科室管理账号和排班审核账号按状态查询医生排班申请，并执行通过或驳回操作。
 * 可见范围由后端按管理范围和所属科室范围过滤。
 */
const { currentUser } = useAuth()
const items = ref<ScheduleRequestRecord[]>([])
const loading = ref(true)
const savingId = ref<number | null>(null)
const status = ref(0)
const notice = ref('')
const errorMessage = ref('')

const activeRole = computed(() => resolveWorkspaceRole(currentUser.value))

const workbenchPath = computed(() =>
  activeRole.value === 'admin'
    ? '/admin/home'
    : activeRole.value === 'doctor'
      ? '/doctor/home'
      : '/department/home',
)

const statusLabel = (value: number) =>
  ({ 0: '待审核', 1: '已通过', 2: '已驳回', 3: '已取消' })[value] || '未知'

const typeLabel = (value: number) =>
  ({ 1: '新增排班', 2: '修改排班', 3: '删除排班' })[value] || '排班申请'

const periodLabel = (value: number) =>
  ({ 1: '上午', 2: '下午', 3: '晚上' })[value] || '其他时段'

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    items.value = await getScheduleRequests(status.value)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班申请加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const approve = async (item: ScheduleRequestRecord) => {
  const reviewRemark = window.prompt('可填写审核意见，留空表示直接通过。') || undefined
  savingId.value = item.id
  notice.value = ''

  try {
    await approveScheduleRequest(item.id, reviewRemark)
    notice.value = '排班申请已通过'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '审核失败，请稍后重试。'
  } finally {
    savingId.value = null
  }
}

const reject = async (item: ScheduleRequestRecord) => {
  const reviewRemark = window.prompt('请输入驳回原因。')?.trim()
  if (!reviewRemark) {
    return
  }

  savingId.value = item.id
  notice.value = ''

  try {
    await rejectScheduleRequest(item.id, reviewRemark)
    notice.value = '排班申请已驳回'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '驳回失败，请稍后重试。'
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout :role="activeRole">
    <div class="page">
      <RouterLink
        class="back"
        :to="workbenchPath"
      >
        <ArrowLeft :size="16" />
        返回工作台
      </RouterLink>

      <header>
        <p>门诊安排</p>
        <h1>排班申请处理</h1>
        <span>审核本人管理范围内的医生新增、修改和删除排班申请。</span>
      </header>

      <div v-if="notice" class="notice success">
        <Check :size="16" />
        {{ notice }}
      </div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <div class="toolbar">
        <select v-model.number="status" @change="load">
          <option :value="0">待审核</option>
          <option :value="1">已通过</option>
          <option :value="2">已驳回</option>
          <option :value="3">已取消</option>
        </select>
        <button class="secondary" type="button" @click="load">
          <RefreshCw :size="15" />
          刷新
        </button>
      </div>

      <div v-if="loading" class="state">正在加载申请…</div>
      <div v-else-if="!items.length" class="state">当前没有排班申请。</div>
      <div v-else class="list">
        <article v-for="item in items" :key="item.id">
          <span class="icon"><CalendarDays :size="18" /></span>
          <div>
            <strong>
              {{ item.doctor_name || `医生 ${item.doctor_id}` }} ·
              {{ typeLabel(item.request_type) }}
            </strong>
            <small>
              {{ item.department_name || `科室 ${item.department_id}` }} ·
              {{ item.schedule_date }} · {{ periodLabel(item.period) }} ·
              {{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}
            </small>
            <small>
              {{ item.total_count }} 号源 · ¥{{ Number(item.fee).toFixed(2) }} ·
              {{ statusLabel(item.status) }}
            </small>
            <p v-if="item.remark">申请备注：{{ item.remark }}</p>
            <p v-if="item.review_remark">审核意见：{{ item.review_remark }}</p>
          </div>
          <div v-if="item.status === 0" class="actions">
            <button
              class="approve"
              type="button"
              :disabled="savingId === item.id"
              @click="approve(item)"
            >
              <Check :size="15" />
              通过
            </button>
            <button
              class="reject"
              type="button"
              :disabled="savingId === item.id"
              @click="reject(item)"
            >
              <X :size="15" />
              驳回
            </button>
          </div>
        </article>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1080px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--primary);
  font-size: 13px;
  text-decoration: none;
}

.page > header {
  margin: 28px 0 24px;
}

.page > header p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page > header h1 {
  margin-top: 8px;
  font-size: 30px;
}

.page > header span {
  display: block;
  margin-top: 8px;
  color: var(--muted);
  font-size: 13px;
}

.toolbar {
  display: flex;
  gap: 9px;
}

.toolbar select,
.secondary {
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 5px;
}

.secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  background: var(--primary-soft);
  cursor: pointer;
}

.list {
  margin-top: 18px;
  display: grid;
  gap: 9px;
}

.list article {
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 6px;
}

.list strong,
.list small,
.list p {
  display: block;
}

.list small,
.list p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 7px;
}

.approve,
.reject {
  min-height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.approve {
  color: #166534;
  background: #dcfce7;
}

.reject {
  color: var(--danger);
  background: var(--danger-soft);
}

.notice {
  margin-bottom: 14px;
  padding: 11px;
  display: flex;
  align-items: center;
  gap: 7px;
  border-radius: 6px;
}

.success {
  color: #166534;
  background: #dcfce7;
}

.error {
  color: var(--danger);
  background: var(--danger-soft);
}

.state {
  padding: 42px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 700px) {
  .list article {
    flex-wrap: wrap;
  }

  .actions {
    width: 100%;
    margin-left: 48px;
  }
}
</style>
