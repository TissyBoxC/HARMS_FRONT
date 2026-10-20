<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileClock,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Package,
  Plus,
  RotateCcw,
  Settings2,
  Stethoscope,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

/**
 * 工作台布局
 *
 * 根据当前用户角色提供统一的导航、移动端抽屉、顶栏和退出入口。
 * 各业务页面只需要通过插槽传入主体内容，不需要重复处理布局与登录态展示。
 */
const props = defineProps<{
  role: 'patient' | 'doctor' | 'admin' | 'registration' | 'department' | 'pharmacy'
}>()

const router = useRouter()
const { currentUser, departmentManageAccess, scheduleReviewAccess, signOut } = useAuth()

const isOpen = ref(false)
const navElement = ref<HTMLElement | null>(null)

const hasPermission = (permission: string) =>
  currentUser.value?.primary_role === 'ADMIN' ||
  currentUser.value?.role_codes.includes('ADMIN') ||
  currentUser.value?.permission_codes?.includes(permission) ||
  currentUser.value?.role_codes.includes(permission)

const canManageDepartments = computed(
  () => departmentManageAccess.value || hasPermission('DEPARTMENT_MANAGE'),
)
const canReviewScheduleRequests = computed(
  () =>
    scheduleReviewAccess.value ||
    canManageDepartments.value ||
    hasPermission('SCHEDULE_REQUEST_REVIEW'),
)

const navScrollKey = computed(() => `clark-workspace-nav-scroll:${props.role}`)

const readNavScrollTop = () => {
  try {
    return Number(window.sessionStorage.getItem(navScrollKey.value)) || 0
  } catch {
    return 0
  }
}

const saveNavScrollTop = () => {
  if (!navElement.value) {
    return
  }

  try {
    window.sessionStorage.setItem(navScrollKey.value, String(navElement.value.scrollTop))
  } catch {
    // 浏览器禁用会话存储时保持页面功能不受影响。
  }
}

onMounted(async () => {
  await nextTick()

  if (navElement.value) {
    navElement.value.scrollTop = readNavScrollTop()
  }
})

onBeforeUnmount(saveNavScrollTop)

/**
 * 当前角色的导航菜单。
 *
 * 患者、医生、挂号员、药房和科室角色使用各自的业务入口；
 * 管理员额外保留跨角色页面入口，便于统一查看和维护业务数据。
 */
const links = computed(() => {
  if (props.role === 'patient') {
    return [
        { to: '/patient/home', label: '患者首页', icon: LayoutDashboard },
        { to: '/patient/profile', label: '个人资料', icon: UserCog },
        { to: '/patient/appointments', label: '我的预约', icon: ClipboardList },
        { to: '/patient/visits', label: '就诊记录', icon: FileClock },
        { to: '/patient/prescriptions', label: '我的处方', icon: Pill },
        { to: '/patient/diagnoses', label: '诊断记录', icon: Stethoscope },
        { to: '/patient/payments', label: '我的支付', icon: RotateCcw },
        { to: '/patient/attachments', label: '检查附件', icon: FileClock },
        { to: '/notifications', label: '我的通知', icon: Bell },
      ]
  }

  if (props.role === 'doctor') {
    const doctorLinks = [
      { to: '/doctor/home', label: '工作概览', icon: LayoutDashboard },
      { to: '/doctor/workstation', label: '接诊工作台', icon: Stethoscope },
      { to: '/doctor/profile', label: '个人简历', icon: UserCog },
      { to: '/doctor/schedules', label: '我的排班', icon: CalendarDays },
      { to: '/doctor/schedule-requests/create', label: '排班申请', icon: Plus },
    ]

    if (canReviewScheduleRequests.value) {
      doctorLinks.push({
        to: '/doctor/schedule-requests/review',
        label: '排班申请处理',
        icon: Settings2,
      })
    }

    if (canManageDepartments.value) {
      doctorLinks.push(
        { to: '/department/doctors', label: '科室医生', icon: Stethoscope },
        { to: '/department/schedules', label: '科室排班', icon: CalendarDays },
        { to: '/department/patients', label: '科室患者', icon: Users },
      )
    }

    doctorLinks.push(
      { to: '/doctor/appointments', label: '预约处理', icon: ClipboardList },
      { to: '/doctor/visits', label: '就诊记录', icon: FileClock },
      { to: '/doctor/patients', label: '我的患者', icon: Users },
      { to: '/doctor/attachments', label: '检查附件', icon: FileClock },
    )

    return doctorLinks
  }

  if (props.role === 'registration') {
    return [
            { to: '/registration/home', label: '工作概览', icon: LayoutDashboard },
            { to: '/registration/appointments', label: '预约处理', icon: ClipboardList },
            { to: '/registration/queue', label: '候诊队列', icon: Users },
            { to: '/registration/patients', label: '患者检索', icon: UserCog },
            { to: '/registration/desk', label: '现场挂号', icon: Plus },
          ]
  }

  if (props.role === 'pharmacy') {
    return [
              { to: '/pharmacy/home', label: '工作概览', icon: LayoutDashboard },
              { to: '/pharmacy/medicines', label: '药品库存', icon: Package },
              { to: '/pharmacy/prescriptions', label: '处方取药', icon: Pill },
            ]
  }

  if (props.role === 'department') {
    const departmentLinks = [
      { to: '/department/home', label: '科室工作台', icon: Building2 },
    ]

    if (canReviewScheduleRequests.value) {
      departmentLinks.push({
        to: '/department/schedule-requests',
        label: '排班申请处理',
        icon: CalendarDays,
      })
    }

    if (canManageDepartments.value) {
      departmentLinks.push(
        { to: '/department/doctors', label: '科室医生', icon: Stethoscope },
        { to: '/department/schedules', label: '科室排班', icon: CalendarDays },
        { to: '/department/patients', label: '科室患者', icon: Users },
      )
    }

    return departmentLinks
  }

  return [
                { to: '/admin/home', label: '管理概览', icon: LayoutDashboard },
                { to: '/admin/users/accounts', label: '账户列表', icon: Users },
                { to: '/admin/roles-permissions', label: '角色权限', icon: Settings2 },
                { to: '/admin/departments', label: '科室列表', icon: Building2 },
                { to: '/admin/departments/create', label: '新增科室', icon: Plus },
                { to: '/admin/schedules/list', label: '排班记录', icon: ClipboardList },
                { to: '/admin/schedules/create', label: '新增排班', icon: CalendarDays },
                { to: '/admin/schedule-requests', label: '排班申请处理', icon: Settings2 },
                { to: '/admin/appointments', label: '预约查询', icon: ClipboardList },
                { to: '/admin/payments', label: '支付记录', icon: RotateCcw },
                { to: '/admin/payments/refund', label: '退款处理', icon: RotateCcw },
                { to: '/admin/operation-logs', label: '操作日志', icon: FileClock },
                { to: '/admin/announcements', label: '公告管理', icon: Bell },
                { to: '/admin/notification-outbox', label: '通知队列', icon: Bell },
                { to: '/admin/attachments', label: '医疗附件', icon: FileClock },
                { to: '/admin/data-consistency', label: '数据一致性', icon: Wrench },
                { to: '/admin/metrics', label: '系统指标', icon: Activity },
                { to: '/admin/config', label: '系统参数', icon: Settings2 },
                { to: '/admin/health', label: '系统状态', icon: Activity },
              ]
})

// 顶栏和品牌区显示的角色名称，用于让用户明确当前工作台身份。
const title = computed(() =>
  props.role === 'patient'
    ? '患者服务'
    : props.role === 'doctor'
      ? '医生工作台'
      : props.role === 'registration'
        ? '挂号工作台'
        : props.role === 'pharmacy'
          ? '药房工作台'
          : props.role === 'department'
            ? '科室工作台'
            : '管理工作台',
)

// 侧栏底部显示的用户角色说明，避免仅显示账号名造成身份混淆。
const roleLabel = computed(() =>
  props.role === 'patient'
    ? '患者'
    : props.role === 'doctor'
      ? '医生'
      : props.role === 'registration'
        ? '挂号员'
        : props.role === 'pharmacy'
          ? '药房人员'
          : props.role === 'department'
            ? '科室管理员'
            : '管理员',
)

/**
 * 退出当前登录账号。
 *
 * 清理本地会话状态后回到统一登录入口，防止继续显示上一用户的工作台信息。
 */
const handleLogout = async () => {
  await signOut()
  await router.replace('/login')
}
</script>

<template>
  <div class="workspace-layout">
    <button
      class="workspace-overlay"
      :class="{ visible: isOpen }"
      type="button"
      aria-label="关闭导航"
      @click="isOpen = false"
    ></button>

    <aside
      class="workspace-sidebar"
      :class="{ open: isOpen }"
    >
      <div class="workspace-brand">
        <span class="workspace-brand-mark">
          <Stethoscope
            v-if="role === 'doctor'"
            :size="20"
          />
          <Pill
            v-else-if="role === 'pharmacy'"
            :size="20"
          />
          <Settings2
            v-else
            :size="20"
          />
        </span>
        <div>
          <strong>CLARK</strong>
          <small>{{ title }}</small>
        </div>
        <button
          class="sidebar-close"
          type="button"
          aria-label="关闭导航"
          @click="isOpen = false"
        >
          <X :size="18" />
        </button>
      </div>

      <nav
        ref="navElement"
        class="workspace-nav"
        :aria-label="`${title}导航`"
        @scroll.passive="saveNavScrollTop"
      >
        <RouterLink
          class="workspace-nav-item workspace-home-link"
          to="/"
          @click="isOpen = false"
        >
          <House
            :size="18"
            :stroke-width="1.8"
          />
          <span>CLARK 首页</span>
        </RouterLink>

        <template v-if="role === 'admin'">
          <RouterLink
            class="workspace-nav-item"
            to="/admin/home"
            @click="isOpen = false"
          >
            <LayoutDashboard
              :size="18"
              :stroke-width="1.8"
            />
            <span>管理概览</span>
          </RouterLink>

          <details
            class="workspace-nav-group"
            open
          >
            <summary class="workspace-nav-item">
              <Stethoscope
                :size="18"
                :stroke-width="1.8"
              />
              <span>人员管理</span>
              <ChevronDown
                class="nav-chevron"
                :size="16"
              />
            </summary>
            <RouterLink
              class="workspace-nav-subitem"
              to="/admin/doctors"
              @click="isOpen = false"
            >
              <Stethoscope
                :size="16"
                :stroke-width="1.8"
              />
              <span>医生管理</span>
            </RouterLink>
            <RouterLink
              class="workspace-nav-subitem"
              to="/admin/patients"
              @click="isOpen = false"
            >
              <Users
                :size="16"
                :stroke-width="1.8"
              />
              <span>患者管理</span>
            </RouterLink>
          </details>

          <details
            class="workspace-nav-group"
            open
          >
            <summary class="workspace-nav-item">
              <Users
                :size="18"
                :stroke-width="1.8"
              />
              <span>账户管理</span>
              <ChevronDown
                class="nav-chevron"
                :size="16"
              />
            </summary>
            <RouterLink
              class="workspace-nav-subitem"
              to="/admin/users/accounts"
              @click="isOpen = false"
            >
              <Users
                :size="16"
                :stroke-width="1.8"
              />
              <span>账户列表</span>
            </RouterLink>
            <RouterLink
              v-for="link in [
                { to: '/admin/users/create-patient', label: '新增患者账户', icon: UserCog },
                { to: '/admin/users/create-doctor', label: '新增医生账户', icon: Stethoscope },
                {
                  to: '/admin/users/create-registration',
                  label: '新增挂号员账户',
                  icon: ClipboardList,
                },
                { to: '/admin/users/create-pharmacy', label: '新增药房账户', icon: Pill },
                { to: '/admin/roles-permissions', label: '角色权限', icon: Settings2 },
              ]"
              :key="link.to"
              class="workspace-nav-subitem"
              :to="link.to"
              @click="isOpen = false"
            >
              <component
                :is="link.icon"
                :size="16"
                :stroke-width="1.8"
              />
              <span>{{ link.label }}</span>
            </RouterLink>
          </details>

          <details
            class="workspace-nav-group"
            open
          >
            <summary class="workspace-nav-item">
              <Building2
                :size="18"
                :stroke-width="1.8"
              />
              <span>科室管理</span>
              <ChevronDown
                class="nav-chevron"
                :size="16"
              />
            </summary>
            <RouterLink
              v-for="link in [
                { to: '/admin/departments', label: '科室列表', icon: Building2 },
                { to: '/admin/departments/create', label: '新增科室', icon: Plus },
                { to: '/department/doctors', label: '科室医生', icon: Stethoscope },
                { to: '/department/schedules', label: '科室排班', icon: CalendarDays },
                { to: '/department/patients', label: '科室患者', icon: Users },
              ]"
              :key="link.to"
              class="workspace-nav-subitem"
              :to="link.to"
              @click="isOpen = false"
            >
              <component
                :is="link.icon"
                :size="16"
                :stroke-width="1.8"
              />
              <span>{{ link.label }}</span>
            </RouterLink>
          </details>

          <details
            class="workspace-nav-group"
            open
          >
            <summary class="workspace-nav-item">
              <ClipboardList
                :size="18"
                :stroke-width="1.8"
              />
              <span>排班管理</span>
              <ChevronDown
                class="nav-chevron"
                :size="16"
              />
            </summary>
            <RouterLink
              v-for="link in [
                { to: '/admin/schedules/list', label: '排班记录', icon: ClipboardList },
                { to: '/admin/schedules/create', label: '新增排班', icon: CalendarDays },
                {
                  to: '/admin/schedule-requests',
                  label: '排班申请处理',
                  icon: Settings2,
                },
              ]"
              :key="link.to"
              class="workspace-nav-subitem"
              :to="link.to"
              @click="isOpen = false"
            >
              <component
                :is="link.icon"
                :size="16"
                :stroke-width="1.8"
              />
              <span>{{ link.label }}</span>
            </RouterLink>
          </details>

          <RouterLink
            class="workspace-nav-item"
            to="/admin/appointments"
            @click="isOpen = false"
          >
            <ClipboardList
              :size="18"
              :stroke-width="1.8"
            />
            <span>预约查询</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/payments"
            @click="isOpen = false"
          >
            <RotateCcw
              :size="18"
              :stroke-width="1.8"
            />
            <span>支付记录</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/payments/refund"
            @click="isOpen = false"
          >
            <RotateCcw
              :size="18"
              :stroke-width="1.8"
            />
            <span>退款处理</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/operation-logs"
            @click="isOpen = false"
          >
            <FileClock
              :size="18"
              :stroke-width="1.8"
            />
            <span>操作日志</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/announcements"
            @click="isOpen = false"
          >
            <Bell
              :size="18"
              :stroke-width="1.8"
            />
            <span>公告管理</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/notification-outbox"
            @click="isOpen = false"
          >
            <Bell
              :size="18"
              :stroke-width="1.8"
            />
            <span>通知队列</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/attachments"
            @click="isOpen = false"
          >
            <FileClock
              :size="18"
              :stroke-width="1.8"
            />
            <span>医疗附件</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/data-consistency"
            @click="isOpen = false"
          >
            <Wrench
              :size="18"
              :stroke-width="1.8"
            />
            <span>数据一致性</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/metrics"
            @click="isOpen = false"
          >
            <Activity
              :size="18"
              :stroke-width="1.8"
            />
            <span>系统指标</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/config"
            @click="isOpen = false"
          >
            <Settings2
              :size="18"
              :stroke-width="1.8"
            />
            <span>系统参数</span>
          </RouterLink>
          <RouterLink
            class="workspace-nav-item"
            to="/admin/health"
            @click="isOpen = false"
          >
            <Activity
              :size="18"
              :stroke-width="1.8"
            />
            <span>系统状态</span>
          </RouterLink>

          <details
            class="workspace-nav-group"
            open
          >
            <summary class="workspace-nav-item">
              <LayoutDashboard
                :size="18"
                :stroke-width="1.8"
              />
              <span>业务页面</span>
              <ChevronDown
                class="nav-chevron"
                :size="16"
              />
            </summary>
            <RouterLink
              class="workspace-nav-subitem"
              to="/patient/home"
              @click="isOpen = false"
            >
              <Users
                :size="16"
                :stroke-width="1.8"
              />
              <span>患者页面</span>
            </RouterLink>
            <RouterLink
              class="workspace-nav-subitem"
              to="/doctor/home"
              @click="isOpen = false"
            >
              <Stethoscope
                :size="16"
                :stroke-width="1.8"
              />
              <span>医生页面</span>
            </RouterLink>
            <RouterLink
              class="workspace-nav-subitem"
              to="/registration/home"
              @click="isOpen = false"
            >
              <ClipboardList
                :size="16"
                :stroke-width="1.8"
              />
              <span>挂号员页面</span>
            </RouterLink>
          </details>
        </template>

        <template v-else-if="role === 'patient' || role === 'pharmacy'">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            class="workspace-nav-item"
            :to="link.to"
            @click="isOpen = false"
          >
            <component
              :is="link.icon"
              :size="18"
              :stroke-width="1.8"
            />
            <span>{{ link.label }}</span>
          </RouterLink>
        </template>

        <template v-else>
          <RouterLink
            v-for="link in links"
            :key="link.to"
            class="workspace-nav-item"
            :to="link.to"
            @click="isOpen = false"
          >
            <component
              :is="link.icon"
              :size="18"
              :stroke-width="1.8"
            />
            <span>{{ link.label }}</span>
          </RouterLink>
        </template>
      </nav>

      <div class="workspace-sidebar-footer">
        <div class="workspace-user">
          <span>{{ (currentUser?.display_name || currentUser?.username || '用户').slice(0, 1) }}</span>
          <div>
            <strong>{{ currentUser?.display_name || currentUser?.username }}</strong>
            <small>{{ roleLabel }}</small>
          </div>
        </div>
        <button
          class="workspace-logout"
          type="button"
          @click="handleLogout"
        >
          <LogOut :size="17" />
          退出登录
        </button>
      </div>
    </aside>

    <div class="workspace-main">
      <header class="workspace-topbar">
        <button
          class="workspace-menu"
          type="button"
          aria-label="打开导航"
          @click="isOpen = true"
        >
          <Menu :size="21" />
        </button>
        <span>{{ title }}</span>
        <span class="workspace-topbar-spacer"></span>
      </header>
      <main class="workspace-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.workspace-layout {
  min-height: 100vh;
  color: #17212b;
  background: #f5f7fa;
}

.workspace-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: 256px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  transition: transform 0.2s ease;
}

.workspace-brand {
  min-height: 78px;
  flex-shrink: 0;
  padding: 18px 18px 18px 22px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid #edf1f5;
}

.workspace-brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #1e293b;
  border-radius: 8px;
}

.workspace-brand strong {
  display: block;
  font-size: 17px;
  letter-spacing: 0.04em;
}

.workspace-brand small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 11px;
}

.sidebar-close,
.workspace-menu {
  display: none;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
}

.workspace-nav {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 22px 14px;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.workspace-nav::-webkit-scrollbar {
  width: 6px;
}

.workspace-nav::-webkit-scrollbar-track {
  background: transparent;
}

.workspace-nav::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.workspace-nav-item {
  min-height: 44px;
  margin-bottom: 6px;
  padding: 0 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;
}

.workspace-nav-item:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.workspace-nav-item.router-link-active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
  box-shadow: inset 3px 0 #2563eb;
}

.workspace-nav-group {
  margin-bottom: 6px;
}

.workspace-nav-group summary {
  list-style: none;
}

.workspace-nav-group summary::-webkit-details-marker {
  display: none;
}

.workspace-nav-group summary .nav-chevron {
  margin-left: auto;
  transition: transform 0.18s ease;
}

.workspace-nav-group[open] summary .nav-chevron {
  transform: rotate(180deg);
}

.workspace-nav-subitem {
  min-height: 38px;
  margin: 2px 0 2px 28px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  border-radius: 6px;
  text-decoration: none;
  font-size: 12px;
}

.workspace-nav-subitem:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.workspace-nav-subitem.router-link-active {
  color: #2563eb;
  background: #eff6ff;
  font-weight: 600;
}

.workspace-sidebar-footer {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid #edf1f5;
}

.workspace-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.workspace-user > span {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: #1e293b;
  background: #e2e8f0;
  border-radius: 50%;
  font-weight: 700;
}

.workspace-user strong,
.workspace-user small {
  display: block;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.workspace-user strong {
  font-size: 12px;
}

.workspace-user small {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 11px;
}

.workspace-logout {
  width: 100%;
  min-height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  cursor: pointer;
  font-size: 12px;
}

.workspace-logout:hover {
  color: #1e293b;
  background: #f1f5f9;
}

.workspace-main {
  min-height: 100vh;
  margin-left: 256px;
}

.workspace-topbar {
  display: none;
}

.workspace-content {
  max-width: 1360px;
  margin: 0 auto;
  padding: 36px 40px 64px;
}

.workspace-overlay {
  display: none;
}

@media (max-width: 1024px) {
  .workspace-sidebar {
    transform: translateX(-100%);
    box-shadow: 12px 0 28px rgba(15, 23, 42, 0.12);
  }

  .workspace-sidebar.open {
    transform: translateX(0);
  }

  .workspace-main {
    margin-left: 0;
  }

  .workspace-topbar {
    height: 64px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    color: #334155;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    font-size: 14px;
    font-weight: 650;
  }

  .workspace-menu {
    display: inline-grid;
    place-items: center;
  }

  .workspace-topbar-spacer {
    flex: 1;
  }

  .sidebar-close {
    display: inline-grid;
    place-items: center;
    margin-left: auto;
  }

  .workspace-overlay {
    position: fixed;
    inset: 0;
    z-index: 35;
    display: block;
    opacity: 0;
    visibility: hidden;
    background: rgba(15, 23, 42, 0.35);
    border: 0;
    transition:
      opacity 0.2s ease,
      visibility 0.2s ease;
  }

  .workspace-overlay.visible {
    opacity: 1;
    visibility: visible;
  }

  .workspace-content {
    padding: 26px 20px 48px;
  }
}

@media (max-width: 560px) {
  .workspace-content {
    padding: 22px 14px 40px;
  }
}
</style>
