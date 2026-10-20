<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CircleAlert,
  Eye,
  Pencil,
  Plus,
  Search,
  UserRound,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { getAdminPatient, getAdminUsers } from '@/api/admin'
import { getAdminAppointments } from '@/api/adminAppointment'
import { ApiError } from '@/api/http'
import type {
  AdminUserSummary,
  AppointmentRecord,
  PatientProfile,
} from '@/types/user'

interface PatientAppointmentSummary {
  total: number
  completed: number
  latest: AppointmentRecord | null
}

const users = ref<AdminUserSummary[]>([])
const details = ref<Record<number, PatientProfile | null>>({})
const appointments = ref<AppointmentRecord[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = 12
const loading = ref(true)
const detailLoading = ref(false)
const errorMessage = ref('')

const patients = computed(() => users.value.filter((item) => item.user_type === 1))

const appointmentSummary = computed(() => {
  const result = new Map<number, PatientAppointmentSummary>()

  appointments.value.forEach((item) => {
    if (!item.patient_id) {
      return
    }

    const current = result.get(item.patient_id) || {
      total: 0,
      completed: 0,
      latest: null,
    }
    current.total += 1

    if (item.status === 5) {
      current.completed += 1
    }

    const currentTime = current.latest
      ? `${current.latest.appointment_date || ''}${current.latest.created_at || ''}`
      : ''
    const candidateTime = `${item.appointment_date || ''}${item.created_at || ''}`

    if (!current.latest || candidateTime > currentTime) {
      current.latest = item
    }

    result.set(item.patient_id, current)
  })

  return result
})

const filteredPatients = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()

  if (!term) {
    return patients.value
  }

  return patients.value.filter((item) => {
    const detail = item.patient_id ? details.value[item.patient_id] : null

    return [
      item.display_name,
      item.username,
      detail?.real_name,
      detail?.phone,
      detail?.id_card,
    ].some((value) =>
      String(value || '')
        .toLocaleLowerCase()
        .includes(term),
    )
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredPatients.value.length / pageSize)),
)

const visiblePatients = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredPatients.value.slice(start, start + pageSize)
})

const patientDetail = (item: AdminUserSummary) =>
  item.patient_id ? details.value[item.patient_id] || null : null

const patientName = (item: AdminUserSummary) =>
  patientDetail(item)?.real_name || item.display_name || item.username

const genderText = (gender: number | undefined) =>
  gender === 1 ? '男' : gender === 2 ? '女' : '未填写'

const statusLabel = (value: number) =>
  ({
    1: '待支付',
    2: '已预约',
    3: '已签到',
    4: '就诊中',
    5: '已完成',
    6: '已取消',
    7: '医生停诊取消',
    8: '已过期',
    9: '已退款',
  })[value] || '处理中'

const patientAppointments = (item: AdminUserSummary) => {
  if (!item.patient_id) {
    return { total: 0, completed: 0, latest: null }
  }

  return appointmentSummary.value.get(item.patient_id) || {
    total: 0,
    completed: 0,
    latest: null,
  }
}

const loadAllDetails = async (patientIds: number[]) => {
  detailLoading.value = true
  const queue = [...patientIds]
  const nextDetails: Record<number, PatientProfile | null> = {}
  const workerCount = Math.min(6, queue.length)

  const workers = Array.from({ length: workerCount }, async () => {
    while (queue.length) {
      const patientId = queue.shift()

      if (!patientId) {
        return
      }

      try {
        nextDetails[patientId] = await getAdminPatient(patientId)
      } catch {
        nextDetails[patientId] = null
      }
    }
  })

  await Promise.all(workers)
  details.value = nextDetails
  detailLoading.value = false
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [userData, appointmentData] = await Promise.all([
      getAdminUsers(),
      getAdminAppointments(),
    ])

    users.value = userData
    appointments.value = appointmentData

    const patientIds = userData
      .filter((item) => item.user_type === 1 && item.patient_id)
      .map((item) => Number(item.patient_id))

    await loadAllDetails(patientIds)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const submitFilter = () => {
  page.value = 1
}

const changePage = (delta: number) => {
  const next = page.value + delta

  if (next < 1 || next > pageCount.value) {
    return
  }

  page.value = next
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header>
        <div>
          <p>人员档案</p>
          <h1>患者管理</h1>
        </div>
        <RouterLink
          class="primary"
          to="/admin/users/create-patient"
        >
          <Plus :size="16" />
          新增患者
        </RouterLink>
      </header>

      <section class="guidance">
        <UserRound :size="17" />
        <span>身份证号、性别和出生日期属于身份档案信息，请按医院规定核对。</span>
      </section>

      <form
        class="filters"
        @submit.prevent="submitFilter"
      >
        <label class="keyword-field">
          <Search :size="16" />
          <input
            v-model="keyword"
            placeholder="输入姓名、手机号或身份证号"
          />
        </label>
        <button type="submit">查询</button>
      </form>

      <div
        v-if="errorMessage"
        class="notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <section class="table-section">
        <div class="table-heading">
          <div>
            <UserRound :size="18" />
            <h2>患者列表</h2>
          </div>
          <span>
            共 {{ filteredPatients.length }} 人
            <template v-if="detailLoading"> · 正在补充资料</template>
          </span>
        </div>

        <div
          v-if="loading"
          class="state"
        >
          正在加载患者资料…
        </div>
        <div
          v-else-if="!visiblePatients.length"
          class="state"
        >
          没有符合条件的患者。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>手机号</th>
                <th>身份证号</th>
                <th>性别</th>
                <th>联系地址</th>
                <th>预约就诊情况</th>
                <th>最近预约</th>
                <th>账户状态</th>
                <th class="action-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in visiblePatients"
                :key="item.user_id"
              >
                <td class="name-cell">{{ patientName(item) }}</td>
                <td>{{ patientDetail(item)?.phone || '未填写' }}</td>
                <td>{{ patientDetail(item)?.id_card || '未填写' }}</td>
                <td>{{ genderText(patientDetail(item)?.gender) }}</td>
                <td class="address-cell">
                  {{ patientDetail(item)?.address || '未填写' }}
                </td>
                <td>
                  <template v-if="patientAppointments(item).total">
                    预约 {{ patientAppointments(item).total }} 次 ·
                    完成 {{ patientAppointments(item).completed }} 次
                  </template>
                  <template v-else>暂无预约</template>
                </td>
                <td>
                  <template v-if="patientAppointments(item).latest">
                    <RouterLink
                      class="appointment-link"
                      :to="`/admin/appointments/${patientAppointments(item).latest?.id}`"
                    >
                      {{ patientAppointments(item).latest?.appointment_date || '日期未填写' }}
                    </RouterLink>
                    <small>
                      {{ statusLabel(patientAppointments(item).latest?.status || 0) }}
                    </small>
                  </template>
                  <template v-else>未预约</template>
                </td>
                <td>
                  <span :class="['status', Number(item.status) === 1 ? 'enabled' : 'disabled']">
                    {{ Number(item.status) === 1 ? '启用' : '停用' }}
                  </span>
                </td>
                <td class="action-column">
                  <div class="row-actions">
                    <RouterLink
                      v-if="item.patient_id"
                      class="edit-link"
                      :to="`/admin/patients/${item.patient_id}/edit`"
                    >
                      <Pencil :size="14" />
                      编辑
                    </RouterLink>
                    <RouterLink
                      v-if="patientAppointments(item).latest"
                      class="icon-link"
                      :to="`/admin/appointments/${patientAppointments(item).latest?.id}`"
                      title="查看最近预约"
                    >
                      <Eye :size="14" />
                    </RouterLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div
        v-if="!loading && filteredPatients.length"
        class="pagination"
      >
        <button
          type="button"
          :disabled="page <= 1"
          @click="changePage(-1)"
        >
          上一页
        </button>
        <span>第 {{ page }} / {{ pageCount }} 页</span>
        <button
          type="button"
          :disabled="page >= pageCount"
          @click="changePage(1)"
        >
          下一页
        </button>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1320px;
}

.page header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.page header p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.primary {
  min-height: 40px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #fff;
  background: var(--primary);
  border-radius: 5px;
  text-decoration: none;
}

.guidance {
  margin-bottom: 16px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: #435b52;
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 13px;
}

.guidance svg {
  flex-shrink: 0;
  color: var(--primary);
}

.filters {
  padding: 14px;
  display: flex;
  gap: 9px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.keyword-field {
  flex: 1;
  min-height: 42px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.keyword-field input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
}

.filters button {
  min-width: 82px;
  padding: 0 16px;
  color: #fff;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  cursor: pointer;
}

.table-section {
  margin-top: 18px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.table-heading {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--border);
}

.table-heading div {
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--primary);
}

.table-heading h2 {
  margin: 0;
  color: var(--ink);
  font-size: 15px;
}

.table-heading > span {
  color: var(--muted);
  font-size: 12px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1240px;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 15px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 13px;
  vertical-align: middle;
}

th {
  color: var(--muted);
  background: #f8faf9;
  font-size: 12px;
  font-weight: 650;
}

tbody tr:last-child td {
  border-bottom: 0;
}

tbody tr:hover {
  background: #fafcfb;
}

.name-cell {
  color: var(--ink);
  font-weight: 700;
}

.address-cell {
  max-width: 210px;
}

.appointment-link {
  display: block;
  color: var(--primary);
  font-weight: 650;
  text-decoration: none;
}

td small {
  margin-top: 3px;
  display: block;
  color: var(--muted);
  font-size: 11px;
}

.status {
  padding: 4px 8px;
  display: inline-flex;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
}

.status.enabled {
  color: #166534;
  background: #dcfce7;
}

.status.disabled {
  color: #92400e;
  background: #fef3c7;
}

.action-column {
  width: 118px;
  text-align: right;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.edit-link,
.icon-link {
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  text-decoration: none;
}

.edit-link {
  padding: 0 9px;
  gap: 5px;
}

.icon-link {
  width: 32px;
}

.state {
  padding: 48px;
  color: var(--muted);
  text-align: center;
}

.notice {
  margin-top: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 7px;
}

.notice.error {
  color: var(--danger);
  background: var(--danger-soft);
}

.pagination {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}

.pagination button {
  min-height: 34px;
  padding: 0 11px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 760px) {
  .page header {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    align-items: stretch;
    flex-direction: column;
  }

  .filters button {
    min-height: 42px;
  }
}
</style>
