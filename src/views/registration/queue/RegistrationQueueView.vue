<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Check, CircleAlert, PhoneCall, Search, UserX, Users } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import { getRegistrationAppointments } from '@/api/registration'
import { callRegistrationQueue, markRegistrationNoShow } from '@/api/registration-extended'
import { useAuth } from '@/stores/auth'
import type { AppointmentRecord, Department } from '@/types/user'

/**
 * 挂号候诊队列页面
 *
 * 展示全部已挂号但未就诊的预约，支持按医生和科室筛选，
 * 并对已签到患者执行呼叫、过号和重新排队。
 */
const { currentUser } = useAuth()
const isAdmin = computed(
  () =>
    currentUser.value?.role_codes.includes('ADMIN') ||
    currentUser.value?.primary_role === 'ADMIN',
)
const items = ref<AppointmentRecord[]>([])
const departments = ref<Department[]>([])
const keyword = ref('')
const doctorFilter = ref('')
const departmentFilter = ref('')
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const actionId = ref(0)

const statusLabel = (status: number) =>
  status === 1
    ? '待支付'
    : status === 2
      ? '待签到'
      : status === 3
        ? '已签到'
        : status === 4
          ? '就诊中'
          : '处理中'

const departmentName = (id: number | null) =>
  departments.value.find((item) => item.id === id)?.name || '未返回科室'

const checkInTime = (item: AppointmentRecord) =>
  item.status === 3 ? item.check_in_at || item.updated_at || '时间未返回' : '尚未签到'

const doctorOptions = computed(() =>
  Array.from(
    new Map(
      items.value
        .filter((item) => item.doctor_id && item.doctor_name)
        .map((item) => [item.doctor_id as number, item.doctor_name as string]),
    ).entries(),
  )
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')),
)

const filteredItems = computed(() => {
  const search = keyword.value.trim().toLowerCase()

  return items.value.filter((item) => {
    const matchesKeyword =
      !search ||
      [item.patient_name, item.patient_phone, item.appointment_no, item.doctor_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    const matchesDoctor = !doctorFilter.value || String(item.doctor_id) === doctorFilter.value
    const matchesDepartment =
      !departmentFilter.value || String(item.department_id) === departmentFilter.value

    return matchesKeyword && matchesDoctor && matchesDepartment
  })
})

// 默认读取全部已挂号但尚未完成就诊的预约。
const load = async () => {
  if (isAdmin.value) {
    loading.value = false
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const [appointments, departmentList] = await Promise.all([
      getRegistrationAppointments(),
      getPublicDepartments(),
    ])
    items.value = appointments.filter((item) => [2, 3].includes(item.status))
    departments.value = departmentList
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '候诊队列加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const resetFilters = () => {
  keyword.value = ''
  doctorFilter.value = ''
  departmentFilter.value = ''
}

// 根据操作类型调用呼叫、过号或重排接口。
const act = async (id: number, type: 'call' | 'no-show') => {
  actionId.value = id
  errorMessage.value = ''

  try {
    if (type === 'call') {
      await callRegistrationQueue(id)
    }

    if (type === 'no-show') {
      await markRegistrationNoShow(id)
    }

    notice.value = type === 'call' ? '已呼叫患者' : '已标记过号'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '队列操作失败，请稍后重试。'
  } finally {
    actionId.value = 0
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="registration">
    <div class="page">
      <header>
        <p>挂号服务</p>
        <h1>候诊队列</h1>
      </header>
      <div v-if="isAdmin" class="notice info">
        <CircleAlert :size="16" />
        管理员可以浏览挂号员页面；候诊操作请使用挂号员账号。
      </div>
      <template v-else>
        <div v-if="notice" class="notice success">
          <Check :size="16" />
          {{ notice }}
        </div>
        <div v-if="errorMessage" class="notice error">
          <CircleAlert :size="16" />
          {{ errorMessage }}
        </div>

        <section class="filters">
          <label class="search">
            <Search :size="16" />
            <input
              v-model="keyword"
              placeholder="患者姓名、电话或预约单号"
              autocomplete="off"
            />
          </label>
          <select v-model="doctorFilter">
            <option value="">全部医生</option>
            <option v-for="doctor in doctorOptions" :key="doctor.id" :value="String(doctor.id)">
              {{ doctor.name }}
            </option>
          </select>
          <select v-model="departmentFilter">
            <option value="">全部科室</option>
            <option
              v-for="department in departments"
              :key="department.id"
              :value="String(department.id)"
            >
              {{ department.name }}
            </option>
          </select>
          <button type="button" class="secondary" @click="resetFilters">重置</button>
        </section>

        <div class="summary">
          <Users :size="17" />
          共 {{ filteredItems.length }} 条待签到或已签到患者，默认显示全部挂号但未就诊患者。
        </div>

        <div v-if="loading" class="state">正在加载队列…</div>
        <div v-else-if="!filteredItems.length" class="state">当前没有符合条件的未就诊患者。</div>
        <div v-else class="queue">
          <article v-for="item in filteredItems" :key="item.id">
            <span class="number">{{ item.queue_no || '—' }}</span>
            <div class="patient">
              <strong>{{ item.patient_name || '未返回患者' }}</strong>
              <small>{{ item.patient_phone || '未填写电话' }}</small>
            </div>
            <div class="detail">
              <strong>{{ item.doctor_name || '未返回医生' }}</strong>
              <small>{{ departmentName(item.department_id) }}</small>
            </div>
            <div class="detail">
              <strong>{{ item.appointment_date || '未填写日期' }}</strong>
              <small>队列号 {{ item.queue_no || '—' }}</small>
            </div>
            <div class="detail">
              <strong>{{ checkInTime(item) }}</strong>
              <small>签到时间</small>
            </div>
            <span class="status" :class="`status-${item.status}`">
              {{ statusLabel(item.status) }}
            </span>
            <div class="actions">
              <template v-if="item.status === 3">
                <button
                  type="button"
                  :disabled="actionId === item.id"
                  @click="act(item.id, 'call')"
                >
                  <PhoneCall :size="14" />
                  呼叫
                </button>
                <button
                  type="button"
                  :disabled="actionId === item.id"
                  @click="act(item.id, 'no-show')"
                >
                  <UserX :size="14" />
                  过号
                </button>
              </template>
            </div>
          </article>
        </div>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1180px;
}

header p {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

header h1 {
  margin-top: 8px;
  font-size: 30px;
}

.filters {
  margin-top: 24px;
  padding: 15px;
  display: grid;
  grid-template-columns: minmax(220px, 1.5fr) repeat(2, minmax(150px, 0.8fr)) auto;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.filters input,
.filters select,
.filters button {
  min-height: 40px;
  padding: 0 11px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
}

.filters .search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 11px;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
}

.filters .search input {
  width: 100%;
  padding: 0;
  background: transparent;
  border: 0;
  outline: 0;
}

.filters button {
  cursor: pointer;
}

.summary {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 12px;
}

.queue {
  margin-top: 12px;
  display: grid;
  gap: 9px;
}

.queue article {
  padding: 15px 17px;
  display: grid;
  grid-template-columns:
    42px minmax(120px, 1fr) minmax(130px, 1fr) minmax(110px, 0.8fr)
    minmax(130px, 0.9fr) 70px auto;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}

.number {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #2563eb;
  background: #dbeafe;
  border-radius: 50%;
  font-weight: 700;
}

.patient strong,
.patient small,
.detail strong,
.detail small {
  display: block;
}

.patient small,
.detail small {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.status {
  padding: 5px 8px;
  color: #92400e;
  background: #fef3c7;
  border-radius: 5px;
  font-size: 12px;
  text-align: center;
}

.status-3 {
  color: #166534;
  background: #dcfce7;
}

.status-4 {
  color: #1e40af;
  background: #dbeafe;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.actions button {
  min-height: 32px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 5px;
  cursor: pointer;
}

.state {
  padding: 48px;
  color: #64748b;
  text-align: center;
}

.notice {
  margin-top: 18px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  border-radius: 6px;
  font-size: 13px;
}

.notice.success {
  color: #166534;
  background: #dcfce7;
}

.notice.error {
  color: #b91c1c;
  background: #fee2e2;
}

.notice.info {
  color: #1e4f80;
  background: #e4f0fb;
}

@media (max-width: 900px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .queue article {
    grid-template-columns: 42px 1fr 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}

@media (max-width: 620px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .queue article {
    grid-template-columns: 38px 1fr;
  }

  .detail,
  .status,
  .actions {
    grid-column: 2;
  }
}
</style>
