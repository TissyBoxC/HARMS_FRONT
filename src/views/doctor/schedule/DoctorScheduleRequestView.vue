<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  FilePlus2,
  Pencil,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorProfile, getDoctorSchedule } from '@/api/doctor'
import {
  cancelDoctorScheduleRequest,
  createDoctorScheduleRequest,
  deleteDoctorScheduleRequest,
  getDoctorScheduleRequests,
  updateDoctorScheduleRequest,
} from '@/api/scheduleApproval'
import type { ScheduleRequestPayload, ScheduleRequestRecord } from '@/types/user'

/**
 * 医生排班申请页面
 *
 * 新增排班、修改排班和删除排班都必须在这里提交申请，审核通过后才生效。
 */
const route = useRoute()
const router = useRouter()
const ownDepartment = ref<{ id: number; name: string } | null>(null)
const requests = ref<ScheduleRequestRecord[]>([])
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const editingScheduleId = ref<number | null>(null)
const requestType = ref(Number(route.query.type) || 1)
const loadedScheduleId = ref<number | null>(null)

const form = reactive<ScheduleRequestPayload>({
  department_id: 0,
  schedule_date: '',
  period: 1,
  start_time: '08:00',
  end_time: '12:00',
  total_count: 20,
  fee: 0,
  remark: '',
})

const requestStatusLabel = (status: number) =>
  ({ 0: '待审核', 1: '已通过', 2: '已驳回', 3: '已取消' })[status] || '未知'

const requestTypeLabel = (type: number) =>
  ({ 1: '新增排班', 2: '修改排班', 3: '删除排班' })[type] || '排班申请'

const periodLabel = (value: number) =>
  ({ 1: '上午', 2: '下午', 3: '晚上' })[value] || '其他时段'

// 表单标题跟随当前操作类型，修改和删除申请仍使用同一份排班字段。
const formTitle = computed(() => {
  if (requestType.value === 2) {
    return '提交修改申请'
  }
  if (requestType.value === 3) {
    return '提交删除申请'
  }
  return '提交新增申请'
})

// 从正式排班页进入修改或删除申请时，按查询参数读取原排班。
const applyRouteTarget = async () => {
  const scheduleId = Number(route.query.schedule_id)
  if (!scheduleId || loadedScheduleId.value === scheduleId) {
    return
  }

  try {
    const detail = await getDoctorSchedule(scheduleId)
    loadedScheduleId.value = scheduleId
    editingScheduleId.value = requestType.value === 2 ? scheduleId : null
    Object.assign(form, {
      department_id: detail.department_id,
      schedule_date: detail.schedule_date,
      period: detail.period,
      start_time: detail.start_time.slice(0, 5),
      end_time: detail.end_time.slice(0, 5),
      total_count: detail.total_count,
      fee: detail.fee,
      remark: detail.remark || '',
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '正式排班详情加载失败，请稍后重试。'
  }
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [profile, requestData] = await Promise.all([
      getDoctorProfile(),
      getDoctorScheduleRequests(),
    ])
    ownDepartment.value = {
      id: profile.department_id,
      name: profile.department_name || '所属科室',
    }
    requests.value = requestData

    form.department_id = profile.department_id
    if (!form.fee) {
      form.fee = Number(profile.consultation_fee || 0)
    }
    await applyRouteTarget()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班申请加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  editingScheduleId.value = null
  requestType.value = 1
  loadedScheduleId.value = null
  Object.assign(form, {
    department_id: form.department_id,
    schedule_date: '',
    period: 1,
    start_time: '08:00',
    end_time: '12:00',
    total_count: 20,
    fee: form.fee,
    remark: '',
  })
  void router.replace('/doctor/schedule-requests/create')
}

// 修改申请先读取正式排班详情，再把现有信息填入申请表单。
const editRequest = async (item: ScheduleRequestRecord) => {
  if (!item.target_schedule_id) {
    return
  }

  try {
    const detail = await getDoctorSchedule(item.target_schedule_id)
    editingScheduleId.value = item.target_schedule_id
    requestType.value = 2
    Object.assign(form, {
      department_id: detail.department_id,
      schedule_date: detail.schedule_date,
      period: detail.period,
      start_time: detail.start_time.slice(0, 5),
      end_time: detail.end_time.slice(0, 5),
      total_count: detail.total_count,
      fee: detail.fee,
      remark: detail.remark || '',
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '正式排班详情加载失败，请稍后重试。'
  }
}

// 根据当前操作类型调用新增或修改申请接口。
const submit = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    if (requestType.value === 3 && loadedScheduleId.value) {
      await deleteDoctorScheduleRequest(loadedScheduleId.value)
      notice.value = '删除申请已提交，等待审核'
    } else if (editingScheduleId.value) {
      await updateDoctorScheduleRequest(editingScheduleId.value, form)
      notice.value = '修改申请已提交，等待审核'
    } else {
      await createDoctorScheduleRequest(form)
      notice.value = '新增申请已提交，等待审核'
    }
    resetForm()
    requests.value = await getDoctorScheduleRequests()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班申请提交失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 删除正式排班也必须走申请，审核通过后由后端删除。
const requestDelete = async (item: ScheduleRequestRecord) => {
  if (!item.target_schedule_id) {
    return
  }
  if (!window.confirm(`确定提交 ${item.schedule_date} 的删除申请吗？`)) {
    return
  }

  try {
    await deleteDoctorScheduleRequest(item.target_schedule_id)
    notice.value = '删除申请已提交，等待审核'
    requests.value = await getDoctorScheduleRequests()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '删除申请提交失败，请稍后重试。'
  }
}

// 只有待审核申请允许取消。
const cancelRequest = async (item: ScheduleRequestRecord) => {
  if (!window.confirm('确定取消这条排班申请吗？')) {
    return
  }

  try {
    await cancelDoctorScheduleRequest(item.id)
    notice.value = '排班申请已取消'
    requests.value = await getDoctorScheduleRequests()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '排班申请取消失败，请稍后重试。'
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink class="portal-back" to="/doctor/schedules">
        <ArrowLeft :size="16" />
        返回我的排班
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>门诊安排</p>
          <h1>排班申请</h1>
          <span>医生提交申请后，需经管理员或科室负责人审核通过才会生效。</span>
        </div>
      </header>

      <div v-if="notice" class="portal-notice success">{{ notice }}</div>
      <div v-if="errorMessage" class="portal-notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <section class="portal-card">
        <div class="panel-heading">
          <h2>{{ formTitle }}</h2>
          <button v-if="editingScheduleId" type="button" @click="resetForm">
            <X :size="15" />
            取消修改
          </button>
        </div>
        <form class="portal-form" @submit.prevent="submit">
          <label>
            科室
            <select
              v-model.number="form.department_id"
              required
              disabled
            >
              <option v-if="ownDepartment" :value="ownDepartment.id">
                {{ ownDepartment.name }}
              </option>
            </select>
          </label>
          <label>
            日期
            <input
              v-model="form.schedule_date"
              type="date"
              required
              :disabled="requestType === 3"
            />
          </label>
          <label>
            时段
            <select v-model.number="form.period" :disabled="requestType === 3">
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
              :disabled="requestType === 3"
            />
          </label>
          <label>
            结束时间
            <input
              v-model="form.end_time"
              type="time"
              required
              :disabled="requestType === 3"
            />
          </label>
          <label>
            号源数
            <input
              v-model.number="form.total_count"
              type="number"
              min="1"
              required
              :disabled="requestType === 3"
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
              :disabled="requestType === 3"
            />
          </label>
          <label class="portal-wide">
            申请说明
            <textarea v-model="form.remark" rows="3" maxlength="255"></textarea>
          </label>
          <p v-if="requestType === 3" class="portal-wide delete-tip">
            提交后将向管理员或科室负责人申请删除该条正式排班。
          </p>
          <button
            class="portal-primary portal-wide"
            type="submit"
            :disabled="saving || (requestType === 3 && !loadedScheduleId)"
          >
            <FilePlus2 :size="16" />
            {{ saving ? '提交中' : requestType === 3 ? '提交删除申请' : '提交申请' }}
          </button>
        </form>
      </section>

      <section class="requests">
        <div class="section-heading">
          <div>
            <p>申请记录</p>
            <h2>我的申请</h2>
          </div>
          <button class="portal-secondary" type="button" @click="load">
            <RefreshCw :size="15" />
            刷新
          </button>
        </div>
        <div v-if="loading" class="portal-state">正在加载申请…</div>
        <div v-else-if="!requests.length" class="portal-state">暂无排班申请。</div>
        <div v-else class="portal-list">
          <article
            v-for="item in requests"
            :key="item.id"
            class="portal-list-item"
          >
            <span class="portal-icon"><CalendarDays :size="18" /></span>
            <div>
              <strong>
                {{ item.schedule_date }} · {{ periodLabel(item.period) }} ·
                {{ requestTypeLabel(item.request_type) }}
              </strong>
              <small>
                {{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }} ·
                {{ item.total_count }} 号源 · ¥{{ Number(item.fee).toFixed(2) }} ·
                {{ requestStatusLabel(item.status) }}
              </small>
              <p v-if="item.review_remark">审核意见：{{ item.review_remark }}</p>
            </div>
            <div v-if="item.status === 0" class="actions">
              <button
                v-if="item.request_type === 2"
                  class="portal-icon-button"
                type="button"
                title="修改申请"
                @click="editRequest(item)"
              >
                <Pencil :size="15" />
              </button>
              <button
                v-if="item.request_type === 1"
                class="portal-icon-button danger"
                type="button"
                title="取消申请"
                @click="cancelRequest(item)"
              >
                <X :size="15" />
              </button>
            </div>
            <button
              v-if="item.status === 1 && item.target_schedule_id"
              class="portal-icon-button danger"
              type="button"
              title="提交删除申请"
              @click="requestDelete(item)"
            >
              <Trash2 :size="15" />
            </button>
          </article>
        </div>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.section-heading p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.panel-heading,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.panel-heading h2,
.section-heading h2 {
  font-size: 19px;
}

.panel-heading button {
  min-height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.portal-form {
  margin-top: 18px;
}

.delete-tip {
  margin: 0;
  color: var(--danger);
  font-size: 13px;
}

.requests {
  margin-top: 28px;
}

.requests .portal-list {
  margin-top: 14px;
}

.requests strong,
.requests small,
.requests p {
  display: block;
}

.requests small,
.requests p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

@media (max-width: 620px) {
  .requests .portal-list-item {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
