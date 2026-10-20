<script setup lang="ts">
/**
 * 医生工作概览
 *
 * 采用紧凑表格展示医生的只读执业摘要、近期排班和常用入口。
 */
import { computed, onMounted, ref } from 'vue'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Eye,
  FileClock,
  FilePlus2,
  Stethoscope,
  UserRound,
  Users,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorProfile, getDoctorSchedules } from '@/api/doctor'
import type { DoctorProfile, Schedule } from '@/types/user'

const profile = ref<DoctorProfile | null>(null)
const schedules = ref<Schedule[]>([])
const loading = ref(true)
const errorMessage = ref('')

const today = new Date().toISOString().slice(0, 10)
const todaySchedules = computed(() =>
  schedules.value.filter((item) => item.schedule_date === today),
)
const upcomingSchedules = computed(() =>
  [...schedules.value]
    .filter((item) => item.schedule_date >= today)
    .sort((a, b) => a.schedule_date.localeCompare(b.schedule_date))
    .slice(0, 6),
)

const periodLabel = (period: number) =>
  (({ 1: '上午', 2: '下午', 3: '晚上' }) as Record<number, string>)[period] || '其他时段'

const statusLabel = (status: number) =>
  (({ 0: '未开始', 1: '可预约', 2: '停诊', 3: '已结束' }) as Record<number, string>)[status] ||
  '未知状态'

const statusClass = (status: number) =>
  status === 1 ? 'table-status' : status === 2 ? 'table-status warning' : 'table-status muted'

const load = async () => {
  try {
    const [profileData, scheduleData] = await Promise.all([
      getDoctorProfile(),
      getDoctorSchedules(),
    ])
    profile.value = profileData
    schedules.value = scheduleData
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '工作概览加载失败，请稍后重试。'
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
          <p>医生工作台</p>
          <h1>工作概览</h1>
          <span>查看您的执业信息、排班安排和今日门诊概况。</span>
        </div>
        <div class="portal-actions">
          <RouterLink
            class="portal-secondary"
            to="/doctor/profile"
          >
            <UserRound :size="16" />
            修改个人简历
          </RouterLink>
          <RouterLink
            class="portal-primary"
            to="/doctor/schedule-requests/create"
          >
            <FilePlus2 :size="16" />
            提交排班申请
          </RouterLink>
        </div>
      </header>

      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载工作概览…
      </div>

      <template v-else-if="profile">
        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>执业概况</h2>
              <p>当前医生身份与今日门诊摘要</p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>医生姓名</th>
                  <td>{{ profile.real_name }}</td>
                  <th>医生工号</th>
                  <td>{{ profile.doctor_no }}</td>
                </tr>
                <tr>
                  <th>所属科室</th>
                  <td>{{ profile.department_name || '未分配' }}</td>
                  <th>今日排班</th>
                  <td>{{ todaySchedules.length }} 个时段</td>
                </tr>
                <tr>
                  <th>职称</th>
                  <td>{{ profile.title || '未填写' }}</td>
                  <th>执业状态</th>
                  <td>{{ profile.status === 1 ? '正常执业' : '暂停执业' }}</td>
                </tr>
                <tr>
                  <th>擅长方向</th>
                  <td>{{ profile.specialty || '未填写' }}</td>
                  <th>默认挂号费</th>
                  <td>¥{{ Number(profile.consultation_fee || 0).toFixed(2) }}</td>
                </tr>
                <tr>
                  <th>个人简介</th>
                  <td colspan="3">{{ profile.introduction || '暂未填写个人简介。' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>近期排班</h2>
              <p>最近六条已生效的门诊安排</p>
            </div>
            <RouterLink
              class="table-link"
              to="/doctor/schedules"
            >
              查看全部
              <ArrowRight :size="14" />
            </RouterLink>
          </div>
          <div
            v-if="!upcomingSchedules.length"
            class="table-empty"
          >
            暂无近期排班。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>时段</th>
                  <th>时间</th>
                  <th>号源</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in upcomingSchedules"
                  :key="item.id"
                >
                  <td>{{ item.schedule_date }}</td>
                  <td>{{ periodLabel(item.period) }}</td>
                  <td>{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}</td>
                  <td>{{ item.booked_count }}/{{ item.total_count }}</td>
                  <td>
                    <span :class="statusClass(item.status)">
                      {{ statusLabel(item.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>常用工作</h2>
              <p>选择需要处理的门诊业务</p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table work-table">
              <thead>
                <tr>
                  <th>功能</th>
                  <th>用途</th>
                  <th class="compact-cell">入口</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Clock3 :size="15" />
                    预约处理
                  </td>
                  <td>查看预约、签到与就诊状态</td>
                  <td class="compact-cell">
                    <RouterLink
                      class="table-link"
                      to="/doctor/appointments"
                    >
                      进入
                    </RouterLink>
                  </td>
                </tr>
                <tr>
                  <td>
                    <FileClock :size="15" />
                    就诊记录
                  </td>
                  <td>维护主诉、现病史、医嘱和诊断处方</td>
                  <td class="compact-cell">
                    <RouterLink
                      class="table-link"
                      to="/doctor/visits"
                    >
                      进入
                    </RouterLink>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Users :size="15" />
                    我的患者
                  </td>
                  <td>查询患者资料和就诊历史</td>
                  <td class="compact-cell">
                    <RouterLink
                      class="table-link"
                      to="/doctor/patients"
                    >
                      进入
                    </RouterLink>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Stethoscope :size="15" />
                    检查附件
                  </td>
                  <td>按患者查看、上传和删除检查资料</td>
                  <td class="compact-cell">
                    <RouterLink
                      class="table-link"
                      to="/doctor/attachments"
                    >
                      进入
                    </RouterLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>排班变更</th>
                  <td>
                    新增、修改或删除排班需提交申请，由管理员或科室负责人审核后生效。
                  </td>
                  <td class="compact-cell">
                    <RouterLink
                      class="table-link"
                      to="/doctor/schedule-requests/create"
                    >
                      提交申请
                    </RouterLink>
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

<style scoped>
.work-table td:first-child {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 650;
}

.work-table td:first-child svg {
  color: var(--primary);
}

.data-table [colspan='3'] {
  line-height: 1.7;
}

@media (max-width: 640px) {
  .table-section-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 13px 14px;
  }
}
</style>
