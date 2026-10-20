<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleAlert, Eye, Search, Users } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDepartmentManagerPatients } from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerPatient } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const patients = ref<DepartmentManagerPatient[]>([])
const keyword = ref('')
const loading = ref(true)
const errorMessage = ref('')

const genderLabel = (gender: number | null) =>
  gender === 1 ? '男' : gender === 2 ? '女' : '未填写'

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    patients.value = await getDepartmentManagerPatients(keyword.value.trim())
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室患者加载失败，请稍后重试。'
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
          <p>就诊患者</p>
          <h1>科室患者</h1>
          <span>仅显示在负责科室产生过就诊记录的患者</span>
        </div>
        <span class="portal-chip">{{ patients.length }} 位患者</span>
      </header>

      <form
        class="filters"
        @submit.prevent="load"
      >
        <label>
          <Search :size="16" />
          <input
            v-model="keyword"
            placeholder="姓名、手机号或患者编号"
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
            <h2>患者列表</h2>
            <p>点击患者查看本科室预约和就诊记录</p>
          </div>
          <Users :size="18" />
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载患者…
        </div>
        <div
          v-else-if="!patients.length"
          class="table-empty"
        >
          没有符合条件的患者。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>患者编号</th>
                <th>姓名</th>
                <th>性别</th>
                <th>出生日期</th>
                <th>联系电话</th>
                <th>紧急联系人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in patients"
                :key="item.id"
              >
                <td>{{ item.id }}</td>
                <td>{{ item.real_name }}</td>
                <td>{{ genderLabel(item.gender) }}</td>
                <td>{{ item.birthday || '未填写' }}</td>
                <td>{{ item.phone || '未填写' }}</td>
                <td>{{ item.emergency_contact || '未填写' }}</td>
                <td class="compact-cell">
                  <RouterLink
                    class="table-link"
                    :to="`/department/patients/${item.id}`"
                  >
                    <Eye :size="14" />
                    查看
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

@media (max-width: 620px) {
  .filters {
    flex-direction: column;
  }

  .filters button {
    min-height: 40px;
  }
}
</style>
