<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  ClipboardList,
  HeartPulse,
  House,
  LogIn,
  LogOut,
  UserRound,
} from 'lucide-vue-next'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const { currentUser, isAuthenticated, rolePath, signOut } = useAuth()
const isPatient = computed(() => currentUser.value?.primary_role === 'PATIENT' || currentUser.value?.primary_role === 'ADMIN')
const isWorkspace = computed(
  () => route.path.startsWith('/doctor/') || route.path.startsWith('/admin/') || route.path.startsWith('/registration/') || route.path.startsWith('/pharmacy/') || route.path.startsWith('/department/'),
)

const handleLogout = async () => {
  await signOut()
  await router.replace('/login')
}
</script>

<template>
  <div class="app-shell">
    <header v-if="!isWorkspace" class="site-header">
      <div class="header-inner">
        <RouterLink class="brand" to="/" aria-label="返回 CLARK 首页">
          <span class="brand-mark"><HeartPulse :size="21" :stroke-width="1.8" /></span>
          <span class="brand-copy">
            <strong>CLARK</strong>
            <small>医院预约挂号</small>
          </span>
        </RouterLink>

        <nav class="primary-nav" aria-label="主导航">
          <RouterLink class="nav-item" to="/">
            <House :size="17" :stroke-width="1.7" />
            <span>首页</span>
          </RouterLink>
          <RouterLink class="nav-item" to="/register">
            <UserRound :size="17" :stroke-width="1.7" />
            <span>患者注册</span>
          </RouterLink>
          <RouterLink class="nav-item" :to="isPatient ? '/patient/schedules' : '/login'">
            <CalendarDays :size="17" :stroke-width="1.7" />
            <span>预约挂号</span>
          </RouterLink>
          <RouterLink v-if="isPatient" class="nav-item" to="/patient/appointments">
            <ClipboardList :size="17" :stroke-width="1.7" />
            <span>我的预约</span>
          </RouterLink>
          <button v-else class="nav-item" type="button" disabled title="即将开放">
            <ClipboardList :size="17" :stroke-width="1.7" />
            <span>我的预约</span>
          </button>
        </nav>

        <div class="header-actions">
          <RouterLink v-if="!isAuthenticated" class="header-action header-action-light" to="/login">
            <LogIn :size="16" :stroke-width="1.8" />
            登录
          </RouterLink>
          <RouterLink v-if="!isAuthenticated" class="header-action" to="/register"
            >创建账号</RouterLink
          >
          <span v-if="isAuthenticated" class="user-greeting">{{
            currentUser?.display_name || currentUser?.username
          }}</span>
          <RouterLink v-if="isAuthenticated && currentUser" class="header-action" :to="rolePath(currentUser.primary_role)">
            我的工作台
          </RouterLink>
          <button
            v-if="isAuthenticated"
            class="header-action header-action-light"
            type="button"
            @click="handleLogout"
          >
            <LogOut :size="16" :stroke-width="1.8" />
            退出
          </button>
        </div>
      </div>
    </header>

    <main class="site-main">
      <RouterView />
    </main>

    <footer v-if="!isWorkspace" class="site-footer">
      <p>© 2026 CLARK</p>
      <p>让每一次就诊安排更从容</p>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  background: color-mix(in srgb, var(--surface) 94%, transparent);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(14px);
}

.header-inner {
  width: min(100%, 1440px);
  min-height: 76px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: minmax(210px, 1fr) auto minmax(210px, 1fr);
  align-items: center;
  gap: 28px;
}

.brand {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--ink);
  text-decoration: none;
}

.brand-mark {
  width: 38px;
  height: 38px;
  display: inline-grid;
  place-items: center;
  color: var(--surface);
  background: var(--primary);
  border-radius: 6px;
}

.brand-copy {
  display: grid;
  gap: 1px;
}

.brand-copy strong {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 650;
}

.brand-copy small {
  color: var(--muted);
  font-size: 11px;
}

.primary-nav {
  display: flex;
  align-items: stretch;
  align-self: stretch;
}

.nav-item {
  position: relative;
  min-width: 108px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--muted);
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 13px;
  text-decoration: none;
}

.nav-item.router-link-active {
  color: var(--primary);
  background: var(--primary-soft);
}

.nav-item.router-link-active::after {
  content: '';
  position: absolute;
  right: 16px;
  bottom: -1px;
  left: 16px;
  height: 2px;
  background: var(--primary);
}

.nav-item:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.header-action {
  min-height: 40px;
  padding: 0 18px;
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--surface);
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 5px;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  transition: background-color 180ms ease;
}

.header-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-action-light {
  color: var(--primary);
  background: transparent;
}

.header-action-light:hover {
  color: var(--surface);
  background: var(--primary);
}

.user-greeting {
  max-width: 130px;
  overflow: hidden;
  color: var(--muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-action:hover {
  background: var(--primary-hover);
}

.site-main {
  flex: 1;
}

.site-footer {
  width: min(100% - 48px, 1360px);
  margin: 0 auto;
  padding: 22px 0 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  color: var(--faint);
  border-top: 1px solid var(--border);
  font-size: 12px;
}

@media (max-width: 1040px) {
  .header-inner {
    min-height: 68px;
    padding: 0 24px;
    grid-template-columns: 1fr auto;
  }

  .primary-nav {
    display: none;
  }
}

@media (max-width: 620px) {
  .header-inner {
    padding: 0 18px;
  }

  .brand-copy small {
    display: none;
  }

  .header-action {
    min-height: 38px;
    padding: 0 14px;
  }

  .header-actions {
    gap: 6px;
  }

  .header-action-light {
    padding: 0 10px;
  }

  .user-greeting {
    display: none;
  }

  .site-footer {
    width: calc(100% - 36px);
    flex-direction: column;
    gap: 6px;
  }
}
</style>
