<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CircleAlert, Eye, FileClock, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorVisits } from '@/api/clinical'
import { useAuth } from '@/stores/auth'
import type { VisitRecord } from '@/types/user'

const { currentUser } = useAuth()
const isAdmin = computed(
  () =>
    currentUser.value?.role_codes.includes('ADMIN') ||
    currentUser.value?.primary_role === 'ADMIN',
)
const items = ref<VisitRecord[]>([])
const loading = ref(true)
const errorMessage = ref('')

const statusLabel = (value: number) =>
  ({ 1: '待就诊', 2: '就诊中', 3: '已完成' })[value] || '处理中'

const statusClass = (value: number) =>
  value === 2 ? 'table-status warning' : value === 3 ? 'table-status muted' : 'table-status'

const load = async () => {
  if (isAdmin.value) {
    loading.value = false
    return
  }

  try {
    items.value = await getDoctorVisits()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '就诊记录加载失败，请稍后重试。'
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
          <p>临床记录</p>
          <h1>就诊记录</h1>
          <span>按患者查看就诊记录，并进入详情维护就诊、诊断和处方。</span>
        </div>
      </header>

      <div
        v-if="isAdmin"
        class="portal-notice info"
      >
        <CircleAlert :size="16" />
        管理员可以浏览医生页面；就诊记录请使用医生账号查看。
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
            <h2>就诊列表</h2>
            <p>共 {{ items.length }} 条记录</p>
          </div>
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载就诊记录…
        </div>
        <div
          v-else-if="!items.length"
          class="table-empty"
        >
          暂无就诊记录。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>患者姓名</th>
                <th>就诊编号</th>
                <th>预约编号</th>
                <th>就诊状态</th>
                <th>签到时间</th>
                <th>开始就诊</th>
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
                    {{ item.patient_name || '患者' }}
                  </span>
                </td>
                <td>{{ item.visit_no }}</td>
                <td>{{ item.appointment_no || '未填写' }}</td>
                <td>
                  <span :class="statusClass(item.status)">
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td>{{ item.check_in_at || '未签到' }}</td>
                <td>{{ item.visit_start_at || '未开始' }}</td>
                <td class="compact-cell">
                  <RouterLink
                    class="table-action"
                    :to="`/doctor/visits/${item.id}`"
                  >
                    <Eye :size="14" />
                    查看详情
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        v-if="!isAdmin && !loading && !items.length"
        class="table-section empty-tip"
      >
        <FileClock :size="18" />
        患者签到后会自动生成就诊记录。
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.patient-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 650;
}

.patient-name svg {
  color: var(--primary);
}

.empty-tip {
  margin-top: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
}

.empty-tip svg {
  color: var(--primary);
}
</style>
