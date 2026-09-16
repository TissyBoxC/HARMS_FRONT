<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Building2, CalendarDays, ClipboardList, CircleAlert, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import type { Department } from '@/types/user'

const departments = ref<Department[]>([])
const loading = ref(true)
const errorMessage = ref('')
onMounted(async () => {
  try {
    departments.value = await getPublicDepartments()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '科室信息暂时无法加载。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="role-page">
    <header class="role-heading">
      <p>患者服务</p>
      <h1>欢迎使用 CLARK</h1>
      <span>先了解科室信息，再安排您的就诊计划。</span>
    </header>
    <section class="quick-grid">
      <RouterLink class="quick-item" to="/patient/profile">
        <UserRound :size="22" />
        <div><strong>个人资料</strong><span>查看和更新联系信息</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/doctors">
        <UserRound :size="22" />
        <div><strong>医生查询</strong><span>了解医生擅长方向</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/schedules">
        <CalendarDays :size="22" />
        <div><strong>预约挂号</strong><span>查看可预约时间</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/appointments">
        <ClipboardList :size="22" />
        <div><strong>我的预约</strong><span>查看预约、签到和取消</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/visits">
        <ClipboardList :size="22" />
        <div><strong>就诊记录</strong><span>查看历史就诊和诊断</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/prescriptions">
        <ClipboardList :size="22" />
        <div><strong>我的处方</strong><span>查看用药信息</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/diagnoses">
        <ClipboardList :size="22" />
        <div><strong>诊断记录</strong><span>查看诊断结果</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/patient/payments">
        <ClipboardList :size="22" />
        <div><strong>我的支付</strong><span>查看支付记录</span></div>
      </RouterLink>
      <RouterLink class="quick-item" to="/notifications">
        <ClipboardList :size="22" />
        <div><strong>我的通知</strong><span>查看服务提醒</span></div>
      </RouterLink>
    </section>
    <section class="department-section">
      <div class="section-heading">
        <div>
          <p>就诊参考</p>
          <h2>科室信息</h2>
        </div>
        <span>{{ departments.length }} 个科室</span>
      </div>
      <div v-if="loading" class="state">正在加载科室信息…</div>
      <div v-else-if="errorMessage" class="notice">
        <CircleAlert :size="16" />{{ errorMessage }}
      </div>
      <div v-else-if="!departments.length" class="state">暂无科室信息。</div>
      <div v-else class="department-list">
        <RouterLink v-for="department in departments" :key="department.id" class="department-item" :to="`/patient/departments/${department.id}`">
          <span class="department-icon"><Building2 :size="20" /></span>
          <div>
            <strong>{{ department.name }}</strong
            ><span>{{ department.location || '医院内' }}<span v-if="department.contact_phone"> · {{ department.contact_phone }}</span></span>
            <p v-if="department.description">{{ department.description }}</p>
          </div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.role-page {
  width: min(100% - 48px, 960px);
  margin: 0 auto;
  padding: 72px 0 110px;
}
.role-heading p,
.section-heading p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 650;
}
.role-heading h1 {
  margin-top: 12px;
  font-family: var(--font-serif);
  font-size: 46px;
  font-weight: 500;
}
.role-heading span {
  display: block;
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
}
.quick-grid {
  margin-top: 42px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.quick-item {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--primary);
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.quick-item:not(.disabled):hover { border-color: var(--primary); background: var(--primary-soft); }
.quick-item div {
  display: grid;
  gap: 5px;
}
.quick-item strong {
  color: var(--ink);
  font-family: var(--font-serif);
  font-size: 17px;
}
.quick-item span {
  color: var(--muted);
  font-size: 12px;
}
.quick-item.disabled {
  opacity: 0.6;
}
.department-section {
  margin-top: 56px;
}
.section-heading {
  padding-bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-strong);
}
.section-heading h2 {
  margin-top: 9px;
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 500;
}
.section-heading > span {
  color: var(--muted);
  font-size: 12px;
}
.department-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 18px;
}
.department-item {
  padding: 18px;
  display: flex;
  gap: 13px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
  text-decoration: none;
  transition: border-color 160ms ease, background-color 160ms ease;
}
.department-item:hover { border-color: var(--primary); background: var(--primary-soft); }
.department-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 6px;
  flex: 0 0 auto;
}
.department-item strong,
.department-item span,
.department-item p {
  display: block;
}
.department-item strong {
  font-family: var(--font-serif);
  font-size: 17px;
}
.department-item span {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}
.department-item p {
  margin-top: 9px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}
.state {
  padding: 42px 20px;
  color: var(--muted);
  text-align: center;
  font-size: 13px;
}
.notice {
  margin-top: 18px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--danger);
  background: var(--danger-soft);
  border-radius: 6px;
  font-size: 13px;
}
@media (max-width: 680px) {
  .role-page {
    width: calc(100% - 28px);
    padding: 48px 0 72px;
  }
  .role-heading h1 {
    font-size: 38px;
  }
  .quick-grid,
  .department-list {
    grid-template-columns: 1fr;
  }
  .department-section {
    margin-top: 42px;
  }
}
</style>
