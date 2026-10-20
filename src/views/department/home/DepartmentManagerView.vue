<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  Building2,
  CalendarDays,
  CircleAlert,
  Pencil,
  Stethoscope,
  Users,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDepartmentManagerScope } from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { Department } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

/**
 * 科室管理员工作台
 *
 * 展示当前可管理的科室列表，并提供进入科室编辑页面的入口。
 * 页面访问权限由路由和后端权限校验共同控制。
 */
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const items = ref<Department[]>([])
const loading = ref(true)
const errorMessage = ref('')

// 加载科室列表；成功后展示可维护的科室记录。
onMounted(async () => {
  try {
    items.value = (await getDepartmentManagerScope()).departments
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '科室加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="page">
      <p>科室服务</p>
      <h1>科室工作台</h1>
      <div class="entries">
        <RouterLink
          class="schedule-entry"
          to="/department/doctors"
        >
          <Stethoscope :size="18" />
          <div>
            <strong>科室医生</strong>
            <small>查看和修改负责科室医生资料</small>
          </div>
        </RouterLink>
        <RouterLink
          class="schedule-entry"
          to="/department/schedules"
        >
          <CalendarDays :size="18" />
          <div>
            <strong>科室排班</strong>
            <small>管理负责科室医生的出诊安排</small>
          </div>
        </RouterLink>
        <RouterLink
          class="schedule-entry"
          to="/department/patients"
        >
          <Users :size="18" />
          <div>
            <strong>科室患者</strong>
            <small>查询在负责科室就诊过的患者</small>
          </div>
        </RouterLink>
        <RouterLink
          class="schedule-entry"
          to="/department/schedule-requests"
        >
          <CalendarDays :size="18" />
          <div>
            <strong>排班申请处理</strong>
            <small>审核医生提交的新增、修改和删除申请</small>
          </div>
        </RouterLink>
      </div>

      <div
        v-if="errorMessage"
        class="notice"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="state"
      >
        正在加载科室…
      </div>
      <div
        v-else-if="!items.length"
        class="state"
      >
        暂无科室信息。
      </div>
      <div
        v-else
        class="list"
      >
        <article
          v-for="item in items"
          :key="item.id"
        >
          <span class="icon">
            <Building2 :size="20" />
          </span>
          <div>
            <strong>{{ item.name }}</strong>
            <small>{{ item.code }} · {{ item.location || '位置未填写' }}</small>
          </div>
          <RouterLink
            class="icon-button"
            :to="`/department/departments/edit/${item.id}`"
            title="编辑科室"
          >
            <Pencil :size="16" />
          </RouterLink>
        </article>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 980px;
}

.page > p {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.entries {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.schedule-entry {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
}

.schedule-entry strong,
.schedule-entry small {
  display: block;
}

.schedule-entry small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.list {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.list article {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 7px;
}

.list strong,
.list small {
  display: block;
}

.list small {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}

.icon-button {
  margin-left: auto;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
}

.notice {
  margin-top: 18px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #b91c1c;
  background: #fee2e2;
  border-radius: 7px;
}

.state {
  padding: 48px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 720px) {
  .entries {
    grid-template-columns: 1fr;
  }
}
</style>
