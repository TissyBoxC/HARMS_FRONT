<script setup lang="ts">
/**
 * 医生患者列表页
 *
 * 支持按姓名或手机号查询当前医生接诊过的患者，并以结构化表格展示资料。
 */
import { onMounted, ref } from 'vue'
import { CircleAlert, Eye, Search, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorPatients } from '@/api/clinical'
import type { DoctorPatientRecord } from '@/types/user'

const keyword = ref('')
const items = ref<DoctorPatientRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')

const genderLabel = (gender: number | null) =>
  gender === 1 ? '男' : gender === 2 ? '女' : '未填写'

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    items.value = await getDoctorPatients(keyword.value)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者列表加载失败，请稍后重试。'
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
          <p>患者服务</p>
          <h1>我的患者</h1>
          <span>查询本人接诊过的患者，并查看预约、就诊和诊断记录。</span>
        </div>
      </header>

      <section class="search-table">
        <form
          class="search"
          @submit.prevent="load"
        >
          <input
            v-model="keyword"
            placeholder="输入患者姓名或手机号"
          />
          <button
            class="portal-primary"
            type="submit"
          >
            <Search :size="16" />
            查询
          </button>
        </form>
      </section>

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
            <h2>接诊患者</h2>
            <p>共 {{ items.length }} 人</p>
          </div>
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载患者…
        </div>
        <div
          v-else-if="!items.length"
          class="table-empty"
        >
          暂无相关患者。
        </div>
        <div v-else class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>患者姓名</th>
                <th>患者编号</th>
                <th>性别</th>
                <th>出生日期</th>
                <th>联系电话</th>
                <th>地址</th>
                <th class="compact-cell">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in items"
                :key="item.id"
              >
                <td>
                  <span class="patient-name">
                    <UserRound :size="15" />
                    {{ item.real_name }}
                  </span>
                </td>
                <td>{{ item.id }}</td>
                <td>{{ genderLabel(item.gender) }}</td>
                <td>{{ item.birthday || '未填写' }}</td>
                <td>{{ item.phone || '未填写' }}</td>
                <td class="address">{{ item.address || '未填写' }}</td>
                <td class="compact-cell">
                  <RouterLink
                    class="table-action"
                    :to="`/doctor/patients/${item.id}`"
                    title="查看患者"
                  >
                    <Eye :size="15" />
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
.search-table {
  margin-bottom: 18px;
  padding: 14px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.search {
  display: flex;
  gap: 8px;
}

.search input {
  flex: 1;
  min-height: 42px;
  padding: 0 11px;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
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

.address {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 620px) {
  .search {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
