<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleAlert, Pencil, Search, Stethoscope } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  getDepartmentManagerDoctors,
  getDepartmentManagerScope,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerDoctor, DepartmentManagerScope } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const doctors = ref<DepartmentManagerDoctor[]>([])
const scope = ref<DepartmentManagerScope | null>(null)
const keyword = ref('')
const loading = ref(true)
const errorMessage = ref('')

const departmentNames = computed(
  () => scope.value?.departments.map((item) => item.name).filter(Boolean).join('、') || '当前负责科室',
)

const statusText = (status: number) => (status === 1 ? '在岗' : '停诊')

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [scopeData, doctorData] = await Promise.all([
      getDepartmentManagerScope(),
      getDepartmentManagerDoctors(keyword.value.trim()),
    ])
    scope.value = scopeData
    doctors.value = doctorData
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室医生加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const search = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    doctors.value = await getDepartmentManagerDoctors(keyword.value.trim())
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室医生加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <header class="portal-heading">
        <div>
          <p>科室人员</p>
          <h1>科室医生</h1>
          <span>{{ departmentNames }}</span>
        </div>
        <span class="portal-chip">{{ doctors.length }} 位医生</span>
      </header>

      <form
        class="filters"
        @submit.prevent="search"
      >
        <label>
          <Search :size="16" />
          <input
            v-model="keyword"
            placeholder="姓名、工号、职称或擅长方向"
          />
        </label>
        <button type="submit">查询</button>
      </form>

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
            <h2>医生列表</h2>
            <p>维护负责科室医生的资料与在岗状态</p>
          </div>
          <Stethoscope :size="18" />
        </div>

        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载医生…
        </div>
        <div
          v-else-if="!doctors.length"
          class="table-empty"
        >
          没有符合条件的医生。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>工号</th>
                <th>所属科室</th>
                <th>职称</th>
                <th>擅长方向</th>
                <th>挂号费</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in doctors"
                :key="item.id"
              >
                <td>{{ item.real_name }}</td>
                <td>{{ item.doctor_no }}</td>
                <td>{{ item.department_name }}</td>
                <td>{{ item.title || '未填写' }}</td>
                <td class="text-cell">{{ item.specialty || '未填写' }}</td>
                <td>¥{{ Number(item.consultation_fee || 0).toFixed(2) }}</td>
                <td>
                  <span
                    class="table-status"
                    :class="{ muted: item.status !== 1 }"
                  >
                    {{ statusText(item.status) }}
                  </span>
                </td>
                <td class="compact-cell">
                  <RouterLink
                    class="table-link"
                    :to="`/department/doctors/${item.id}/edit`"
                  >
                    <Pencil :size="14" />
                    编辑
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
.filters {
  margin-bottom: 16px;
  padding: 13px;
  display: flex;
  gap: 9px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.filters label {
  flex: 1;
  min-height: 40px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.filters input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
}

.filters button {
  min-width: 82px;
  color: #fff;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 6px;
  cursor: pointer;
}

.text-cell {
  max-width: 280px;
}

@media (max-width: 620px) {
  .filters {
    flex-direction: column;
  }

  .filters button {
    min-height: 40px;
  }
}
</style>
