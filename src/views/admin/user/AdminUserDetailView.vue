<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Plus, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  assignAdminUserPermission,
  getAdminUser,
  getAdminUserDirectPermissions,
  getAdminUserPermissions,
  getAdminUserRoles,
  removeAdminUserPermission,
} from '@/api/admin'
import { getAdminPermissions, getAdminRoles, removeAdminRole } from '@/api/admin-extended'
import type { AdminUserSummary, DirectPermissionRecord, PermissionCatalogItem } from '@/types/user'

/**
 * 管理员账户详情页面
 *
 * 展示单个账号的基础身份、角色、当前生效权限和直授权限，
 * 并允许管理员为账号添加或移除独立于角色之外的权限。
 */
const route = useRoute()
const user = ref<AdminUserSummary | null>(null)
const roles = ref<string[]>([])
const permissions = ref<string[]>([])
const directPermissions = ref<DirectPermissionRecord[]>([])
const roleCatalog = ref<Record<string, unknown>[]>([])
const permissionCatalog = ref<PermissionCatalogItem[]>([])
const selectedPermissionCode = ref('')
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')

const permissionName = (code: string) =>
  permissionCatalog.value.find((item) => item.permission_code === code)?.permission_name || code

const availablePermissions = computed(() => {
  const directCodes = new Set(directPermissions.value.map((item) => item.permission_code))
  return permissionCatalog.value.filter((item) => !directCodes.has(item.permission_code))
})

const directPermissionNames = computed(() =>
  new Set(directPermissions.value.map((item) => item.permission_code)),
)

// 将后端角色编码转换为面向管理员的名称。
const roleLabel = (code: string) =>
  ({
    ADMIN: '管理员',
    PATIENT: '患者',
    DOCTOR: '医生',
    REGISTRATION: '挂号员',
    PHARMACY: '药房人员',
    DEPARTMENT_MANAGER: '科室管理员',
  })[code] || code

/**
 * 并行加载账户详情、角色、当前权限、直授权限、角色目录和权限目录。
 *
 * 角色目录用于角色编码与角色主键之间的映射，删除角色时必须提交角色 ID。
 */
const load = async () => {
  loading.value = true

  try {
    const id = Number(route.params.id)
    const [
      userData,
      roleData,
      permissionData,
      directPermissionData,
      roleDataCatalog,
      permissionDataCatalog,
    ] = await Promise.all([
      getAdminUser(id),
      getAdminUserRoles(id),
      getAdminUserPermissions(id),
      getAdminUserDirectPermissions(id),
      getAdminRoles(),
      getAdminPermissions(),
    ])

    user.value = userData
    roles.value = roleData
    permissions.value = permissionData
    directPermissions.value = directPermissionData
    roleCatalog.value = roleDataCatalog
    permissionCatalog.value = permissionDataCatalog
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '账户详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// 给当前账号直接授予一个权限，授权结果独立于角色权限。
const grantPermission = async () => {
  if (!user.value || !selectedPermissionCode.value) {
    return
  }

  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await assignAdminUserPermission(user.value.user_id, selectedPermissionCode.value)
    selectedPermissionCode.value = ''
    notice.value = '权限已授予'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限授予失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 仅移除用户直授权限，角色本身携带的权限保持不变。
const revokePermission = async (item: DirectPermissionRecord) => {
  if (!user.value || !window.confirm(`确定移除“${item.permission_name}”直授权限吗？`)) {
    return
  }

  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await removeAdminUserPermission(user.value.user_id, item.permission_id)
    notice.value = '直授权限已移除'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '直授权限移除失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 移除角色前核对角色目录和角色 ID，避免误传错误主键。
const removeRole = async (code: string) => {
  const role = roleCatalog.value.find((entry) => String(entry.role_code) === code)

  if (!role || !user.value || !window.confirm(`确定移除“${roleLabel(code)}”权限吗？`)) {
    return
  }

  saving.value = true

  try {
    await removeAdminRole(user.value.user_id, Number(role.id))
    notice.value = '角色已移除'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色移除失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <RouterLink
        class="back"
        to="/admin/users/accounts"
      >
        <ArrowLeft :size="16" />
        返回账户列表
      </RouterLink>

      <header>
        <p>账号管理</p>
        <h1>账户详情</h1>
      </header>

      <div
        v-if="loading"
        class="state"
      >
        正在加载账户详情…
      </div>
      <div
        v-else-if="errorMessage"
        class="notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <template v-else-if="user">
        <div
          v-if="notice"
          class="notice success"
        >
          {{ notice }}
        </div>

        <section class="summary">
          <div>
            <span>用户名</span>
            <strong>{{ user.username }}</strong>
          </div>
          <div>
            <span>账户编号</span>
            <strong>{{ user.user_id }}</strong>
          </div>
          <div>
            <span>显示名称</span>
            <strong>{{ user.display_name || user.real_name || '未填写' }}</strong>
          </div>
          <div>
            <span>状态</span>
            <strong>{{ user.status === 1 ? '启用' : '停用' }}</strong>
          </div>
          <div>
            <span>所属科室</span>
            <strong>{{ user.department_name || '未分配' }}</strong>
          </div>
        </section>

        <section class="panel">
          <h2>
            <ShieldCheck :size="18" />
            角色
          </h2>
          <div
            v-if="!roles.length"
            class="empty"
          >
            暂无角色。
          </div>
          <div
            v-else
            class="chips"
          >
            <span
              v-for="code in roles"
              :key="code"
              class="chip"
            >
              {{ roleLabel(code) }}
              <button
                type="button"
                :disabled="saving"
                title="移除角色"
                @click="removeRole(code)"
              >
                <Trash2 :size="13" />
              </button>
            </span>
          </div>
        </section>

        <section class="panel">
          <h2>权限</h2>
          <p class="panel-note">
            当前生效权限由角色权限和下方直授权限合并计算。
          </p>
          <div
            v-if="!permissions.length"
            class="empty"
          >
            暂无特别权限。
          </div>
          <div
            v-else
            class="chips"
          >
            <span
              v-for="code in permissions"
              :key="code"
              class="chip readonly"
            >
              {{ permissionName(code) }}
              <small v-if="directPermissionNames.has(code)">直授</small>
            </span>
          </div>
        </section>

        <section class="panel">
          <h2>
            <ShieldCheck :size="18" />
            直授权限
          </h2>
          <p class="panel-note">
            直授权限直接作用于当前账号，不受角色变动影响。移除此处权限不会改变账号已有角色。
          </p>
          <form
            class="permission-form"
            @submit.prevent="grantPermission"
          >
            <select
              v-model="selectedPermissionCode"
              :disabled="saving || !availablePermissions.length"
            >
              <option value="">
                {{ availablePermissions.length ? '选择要授予的权限' : '暂无可授予权限' }}
              </option>
              <option
                v-for="item in availablePermissions"
                :key="item.id"
                :value="item.permission_code"
              >
                {{ item.permission_name }}（{{ item.permission_code }}）
              </option>
            </select>
            <button
              class="grant"
              type="submit"
              :disabled="saving || !selectedPermissionCode"
            >
              <Plus :size="15" />
              授予权限
            </button>
          </form>
          <div
            v-if="!directPermissions.length"
            class="empty"
          >
            该账号暂无直授权限。
          </div>
          <div
            v-else
            class="direct-list"
          >
            <article
              v-for="item in directPermissions"
              :key="item.permission_id"
            >
              <div>
                <strong>{{ item.permission_name }}</strong>
                <small>
                  {{ item.permission_code }} ·
                  {{ item.created_at ? `授予于 ${item.created_at}` : '已授予' }}
                </small>
              </div>
              <button
                type="button"
                :disabled="saving"
                title="移除直授权限"
                @click="revokePermission(item)"
              >
                <Trash2 :size="15" />
              </button>
            </article>
          </div>
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 900px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--primary);
  font-size: 13px;
  text-decoration: none;
}

.page header {
  margin: 28px 0 22px;
}

.page header p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.summary div {
  padding: 16px;
  background: var(--surface-strong);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color: var(--muted);
  font-size: 12px;
}

.summary strong {
  margin-top: 6px;
  font-size: 14px;
}

.panel {
  margin-top: 16px;
  padding: 20px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.panel h2 {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 17px;
}

.panel-note {
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.chips {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  min-height: 32px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  font-size: 12px;
}

.chip button {
  display: grid;
  place-items: center;
  color: var(--danger);
  background: none;
  border: 0;
  cursor: pointer;
}

.chip.readonly {
  color: var(--ink);
}

.chip small {
  padding: 2px 5px;
  color: #166534;
  background: #dcfce7;
  border-radius: 3px;
  font-size: 10px;
}

.permission-form {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}

.permission-form select {
  flex: 1;
  min-height: 38px;
  padding: 0 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.grant {
  min-height: 38px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #fff;
  background: var(--primary);
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.grant:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.direct-list {
  margin-top: 14px;
  display: grid;
  gap: 7px;
}

.direct-list article {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.direct-list strong,
.direct-list small {
  display: block;
}

.direct-list small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 12px;
}

.direct-list button {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--danger);
  background: var(--danger-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.empty,
.state {
  padding: 28px 0;
  color: var(--muted);
  text-align: center;
}

.notice {
  margin-bottom: 14px;
  padding: 11px;
  display: flex;
  gap: 7px;
  align-items: center;
  border-radius: 6px;
}

.success {
  color: #166534;
  background: #dcfce7;
}

.error {
  color: var(--danger);
  background: var(--danger-soft);
}

@media (max-width: 760px) {
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .permission-form {
    flex-direction: column;
  }
}

@media (max-width: 460px) {
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>
