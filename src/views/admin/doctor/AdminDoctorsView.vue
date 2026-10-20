<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Pencil,
  Plus,
  Search,
  Stethoscope,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { getAdminDoctor, getAdminUsers } from '@/api/admin'
import { ApiError } from '@/api/http'
import type { AdminUserSummary, DoctorProfile } from '@/types/user'

const users = ref<AdminUserSummary[]>([])
const details = ref<Record<number, DoctorProfile>>({})
const keyword = ref('')
const departmentFilter = ref('')
const page = ref(1)
const pageSize = 12
const loading = ref(true)
const detailLoading = ref(false)
const errorMessage = ref('')
let detailRequestId = 0

const doctors = computed(() => users.value.filter((item) => item.user_type === 2))

const departments = computed(() =>
  Array.from(
    new Set(
      doctors.value
        .map((item) => item.department_name)
        .filter((item): item is string => Boolean(item)),
    ),
  ).sort((left, right) => left.localeCompare(right, 'zh-CN')),
)

const filteredDoctors = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()

  return doctors.value.filter((item) => {
    const matchesDepartment =
      !departmentFilter.value || item.department_name === departmentFilter.value

    if (!matchesDepartment) {
      return false
    }

    if (!term) {
      return true
    }

    return [item.display_name, item.username, item.department_name].some((value) =>
      String(value || '')
        .toLocaleLowerCase()
        .includes(term),
    )
  })
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredDoctors.value.length / pageSize)),
)

const visibleDoctors = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredDoctors.value.slice(start, start + pageSize)
})

const doctorDetail = (item: AdminUserSummary) =>
  item.doctor_id ? details.value[item.doctor_id] : undefined

const doctorName = (item: AdminUserSummary) =>
  doctorDetail(item)?.real_name || item.display_name || item.username

const statusText = (item: AdminUserSummary) => {
  const detail = doctorDetail(item)

  if (!detail) {
    return detailLoading.value ? '读取中…' : '未返回'
  }

  return detail.status === 1 ? '在岗' : '停诊'
}

const loadCurrentDetails = async () => {
  const requestId = ++detailRequestId
  detailLoading.value = true
  const nextDetails: Record<number, DoctorProfile> = {}

  await Promise.all(
    visibleDoctors.value.map(async (item) => {
      if (!item.doctor_id) {
        return
      }

      try {
        nextDetails[item.doctor_id] = await getAdminDoctor(item.doctor_id)
      } catch {}
    }),
  )

  if (requestId === detailRequestId) {
    details.value = nextDetails
    detailLoading.value = false
  }
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    users.value = await getAdminUsers()
    await loadCurrentDetails()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '医生列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const submitFilter = () => {
  page.value = 1
  void loadCurrentDetails()
}

const changePage = (delta: number) => {
  const next = page.value + delta

  if (next < 1 || next > pageCount.value) {
    return
  }

  page.value = next
  void loadCurrentDetails()
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header>
        <div>
          <p>人员档案</p>
          <h1>医生管理</h1>
        </div>
        <RouterLink
          class="primary"
          to="/admin/users/create-doctor"
        >
          <Plus :size="16" />
          新增医生
        </RouterLink>
      </header>

      <section class="guidance">
        <span>停诊或离职前，请先处理该医生未来的排班和已预约患者。</span>
        <div>
          <RouterLink to="/admin/schedules/list">
            <CalendarDays :size="15" />
            查看排班记录
          </RouterLink>
          <RouterLink to="/admin/appointments">
            <ClipboardList :size="15" />
            查看预约
          </RouterLink>
        </div>
      </section>

      <form
        class="filters"
        @submit.prevent="submitFilter"
      >
        <label class="keyword-field">
          <Search :size="16" />
          <input
            v-model="keyword"
            placeholder="输入医生姓名"
          />
        </label>
        <select v-model="departmentFilter">
          <option value="">全部科室</option>
          <option
            v-for="department in departments"
            :key="department"
            :value="department"
          >
            {{ department }}
          </option>
        </select>
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
            <Stethoscope :size="18" />
            <h2>医生列表</h2>
          </div>
          <span>共 {{ filteredDoctors.length }} 人</span>
        </div>

        <div
          v-if="loading"
          class="state"
        >
          正在加载医生资料…
        </div>
        <div
          v-else-if="!visibleDoctors.length"
          class="state"
        >
          没有符合条件的医生。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table>
            <thead>
              <tr>
                <th>姓名</th>
                <th>工号</th>
                <th>所属科室</th>
                <th>职称</th>
                <th>擅长方向</th>
                <th>在岗状态</th>
                <th class="action-column">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in visibleDoctors"
                :key="item.user_id"
              >
                <td class="name-cell">{{ doctorName(item) }}</td>
                <td>{{ doctorDetail(item)?.doctor_no || '未填写' }}</td>
                <td>
                  {{ doctorDetail(item)?.department_name || item.department_name || '未分配' }}
                </td>
                <td>{{ doctorDetail(item)?.title || '未填写' }}</td>
                <td class="specialty-cell">
                  {{ doctorDetail(item)?.specialty || '未填写' }}
                </td>
                <td>
                  <span
                    class="status"
                    :class="{ inactive: doctorDetail(item)?.status === 0 }"
                  >
                    {{ statusText(item) }}
                  </span>
                </td>
                <td class="action-column">
                  <RouterLink
                    v-if="item.doctor_id"
                    class="edit-link"
                    :to="`/admin/doctors/${item.doctor_id}/edit`"
                  >
                    <Pencil :size="14" />
                    编辑
                  </RouterLink>
                  <span v-else>资料缺失</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div
        v-if="!loading && filteredDoctors.length"
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
  max-width: 1180px;
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
  justify-content: space-between;
  gap: 14px;
  color: #435b52;
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 7px;
  font-size: 13px;
}

.guidance div {
  display: flex;
  gap: 14px;
}

.guidance a {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.filters {
  padding: 14px;
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.filters input,
.filters select,
.filters button {
  min-height: 42px;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.filters input,
.filters select {
  padding: 0 11px;
}

.keyword-field {
  flex: 1;
  min-width: 230px;
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
  padding-left: 0;
  border: 0;
  outline: 0;
}

.filters select {
  min-width: 180px;
}

.filters button {
  min-width: 80px;
  padding: 0 16px;
  color: #fff;
  background: var(--primary);
  border-color: var(--primary);
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
  min-width: 940px;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 13px;
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

.specialty-cell {
  max-width: 260px;
}

.status {
  min-width: 58px;
  padding: 4px 8px;
  display: inline-flex;
  justify-content: center;
  color: #166534;
  background: #dcfce7;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 650;
}

.status.inactive {
  color: #92400e;
  background: #fef3c7;
}

.action-column {
  width: 94px;
  text-align: right;
}

.edit-link {
  min-height: 32px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  text-decoration: none;
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
  .page header,
  .guidance {
    align-items: flex-start;
    flex-direction: column;
  }

  .guidance div {
    flex-wrap: wrap;
  }

  .keyword-field,
  .filters select,
  .filters button {
    width: 100%;
  }
}
</style>
