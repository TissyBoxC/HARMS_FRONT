<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  FileClock,
  UserRound,
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDepartmentManagerPatient } from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerPatientDetail } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const route = useRoute()
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const patient = ref<DepartmentManagerPatientDetail | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const genderLabel = (gender: number | null) =>
  gender === 1 ? '男' : gender === 2 ? '女' : '未填写'

const appointmentStatus = (status: number) =>
  ({
    1: '待支付',
    2: '已预约',
    3: '已签到',
    4: '就诊中',
    5: '已完成',
    6: '已取消',
    7: '已过期',
  })[status] || '未知'

const visitStatus = (status: number) =>
  ({
    1: '待就诊',
    2: '就诊中',
    3: '已完成',
  })[status] || '未知'

onMounted(async () => {
  try {
    patient.value = await getDepartmentManagerPatient(Number(route.params.id))
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者资料加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/department/patients"
      >
        <ArrowLeft :size="16" />
        返回科室患者
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>就诊患者</p>
          <h1>{{ patient?.real_name || '患者详情' }}</h1>
          <span v-if="patient">患者编号 {{ patient.id }}</span>
        </div>
      </header>

      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载患者资料…
      </div>
      <template v-else-if="patient">
        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>基本资料</h2>
              <p>用于核对患者身份与联系方式</p>
            </div>
            <UserRound :size="18" />
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>姓名</th>
                  <td>{{ patient.real_name }}</td>
                  <th>性别</th>
                  <td>{{ genderLabel(patient.gender) }}</td>
                </tr>
                <tr>
                  <th>身份证号</th>
                  <td>{{ patient.id_card }}</td>
                  <th>出生日期</th>
                  <td>{{ patient.birthday || '未填写' }}</td>
                </tr>
                <tr>
                  <th>联系电话</th>
                  <td>{{ patient.phone || '未填写' }}</td>
                  <th>住址</th>
                  <td>{{ patient.address || '未填写' }}</td>
                </tr>
                <tr>
                  <th>紧急联系人</th>
                  <td>{{ patient.emergency_contact || '未填写' }}</td>
                  <th>紧急联系电话</th>
                  <td>{{ patient.emergency_phone || '未填写' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>本科室预约记录</h2>
              <p>共 {{ patient.appointments.length }} 条</p>
            </div>
            <CalendarDays :size="18" />
          </div>
          <div
            v-if="!patient.appointments.length"
            class="table-empty"
          >
            暂无预约记录。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>预约日期</th>
                  <th>科室</th>
                  <th>医生</th>
                  <th>时段</th>
                  <th>排队号</th>
                  <th>费用</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in patient.appointments"
                  :key="item.id"
                >
                  <td>{{ item.appointment_date || '未填写' }}</td>
                  <td>{{ item.department_name || '未填写' }}</td>
                  <td>{{ item.doctor_name || '未填写' }}</td>
                  <td>{{ item.period || '未填写' }}</td>
                  <td>{{ item.queue_no || '未分配' }}</td>
                  <td>¥{{ Number(item.fee || 0).toFixed(2) }}</td>
                  <td>
                    <span class="table-status">{{ appointmentStatus(item.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>本科室就诊记录</h2>
              <p>共 {{ patient.visits.length }} 条</p>
            </div>
            <FileClock :size="18" />
          </div>
          <div
            v-if="!patient.visits.length"
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
                  <th>就诊编号</th>
                  <th>科室</th>
                  <th>医生</th>
                  <th>签到时间</th>
                  <th>开始就诊</th>
                  <th>结束就诊</th>
                  <th>主诉</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in patient.visits"
                  :key="item.id"
                >
                  <td>{{ item.visit_no }}</td>
                  <td>{{ item.department_name || '未填写' }}</td>
                  <td>{{ item.doctor_name || '未填写' }}</td>
                  <td>{{ item.check_in_at || '未签到' }}</td>
                  <td>{{ item.visit_start_at || '未开始' }}</td>
                  <td>{{ item.visit_end_at || '未结束' }}</td>
                  <td class="text-cell">{{ item.chief_complaint || '未填写' }}</td>
                  <td>
                    <span class="table-status">{{ visitStatus(item.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>
