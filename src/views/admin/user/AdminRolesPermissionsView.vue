<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Check, CircleAlert, Plus, Trash2, X } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  assignAdminPermission,
  createAdminPermission,
  createAdminRole,
  deleteAdminPermission,
  deleteAdminRole,
  getAdminPermissions,
  getAdminRolePermissions,
  getAdminRoles,
  removeAdminPermission,
  updateAdminPermission,
  updateAdminRole,
} from '@/api/admin-extended'
import type { PermissionCatalogItem } from '@/types/user'

/**
 * 角色与权限管理页面
 *
 * 管理员在此维护角色、权限目录，以及角色与权限之间的关联关系。
 */
const roles = ref<Record<string, unknown>[]>([])
const permissions = ref<PermissionCatalogItem[]>([])
const rolePermissions = ref<Record<string, unknown>[]>([])
const selectedRoleId = ref(0)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')

// 新增角色的表单状态。
const roleForm = reactive({
  role_code: '',
  role_name: '',
  status: 1,
})

// 新增权限的表单状态，默认创建接口类型权限。
const permissionForm = reactive({
  permission_code: '',
  permission_name: '',
  type: 3,
})

const selectedRole = computed(() =>
  roles.value.find((item) => Number(item.id) === selectedRoleId.value),
)

// 读取当前角色已分配的权限；未选择角色时清空列表。
const loadRolePermissions = async () => {
  if (!selectedRoleId.value) {
    rolePermissions.value = []
    return
  }

  try {
    rolePermissions.value = await getAdminRolePermissions(selectedRoleId.value)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色权限加载失败，请稍后重试。'
  }
}

// 并行读取角色和权限目录，并默认选中第一个角色。
const load = async () => {
  try {
    const [roleList, permissionList] = await Promise.all([
      getAdminRoles(),
      getAdminPermissions(),
    ])

    roles.value = roleList
    permissions.value = permissionList

    if (!selectedRoleId.value && roleList[0]) {
      selectedRoleId.value = Number(roleList[0].id)
    }

    await loadRolePermissions()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色权限加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// 创建角色后重新读取目录，确保页面展示服务端最终数据。
const addRole = async () => {
  saving.value = true

  try {
    await createAdminRole(roleForm)
    Object.assign(roleForm, { role_code: '', role_name: '', status: 1 })
    notice.value = '角色已创建'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色创建失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 创建权限后重新读取目录，确保新权限可立即分配。
const addPermission = async () => {
  saving.value = true

  try {
    await createAdminPermission(permissionForm)
    Object.assign(permissionForm, {
      permission_code: '',
      permission_name: '',
      type: 3,
    })
    notice.value = '权限已创建'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限创建失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 角色状态切换后立即保存。
const toggleRole = async (item: Record<string, unknown>) => {
  try {
    await updateAdminRole(Number(item.id), {
      role_name: String(item.role_name),
      status: Number(item.status),
    })
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色更新失败，请稍后重试。'
  }
}

// 权限类型调整后立即保存。
const togglePermission = async (item: Record<string, unknown>) => {
  try {
    await updateAdminPermission(Number(item.id), {
      permission_name: String(item.permission_name),
      type: Number(item.type),
    })
    notice.value = '权限已保存'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限更新失败，请稍后重试。'
  }
}

// 将选择的权限分配给当前角色。
const linkPermission = async (code: string) => {
  if (!selectedRoleId.value || !code) {
    return
  }

  try {
    await assignAdminPermission(selectedRoleId.value, code)
    notice.value = '权限已分配'
    await loadRolePermissions()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限分配失败，请稍后重试。'
  }
}

// 从当前角色移除权限。
const unlinkPermission = async (id: number) => {
  try {
    await removeAdminPermission(selectedRoleId.value, id)
    notice.value = '权限已移除'
    await loadRolePermissions()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限移除失败，请稍后重试。'
  }
}

// 权限选择框是瞬时操作，选中后立即复位，方便连续分配。
const handlePermissionChange = (event: Event) => {
  const target = event.target

  if (target instanceof HTMLSelectElement) {
    const code = target.value
    target.value = ''
    void linkPermission(code)
  }
}

// 删除角色前由管理员确认，避免误操作。
const removeRole = async (id: number) => {
  if (!window.confirm('确定删除该角色吗？')) {
    return
  }

  try {
    await deleteAdminRole(id)
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '角色删除失败，请稍后重试。'
  }
}

// 删除权限前由管理员确认，避免误操作。
const removePermission = async (id: number) => {
  if (!window.confirm('确定删除该权限吗？')) {
    return
  }

  try {
    await deleteAdminPermission(id)
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '权限删除失败，请稍后重试。'
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header>
        <p>权限设置</p>
        <h1>角色与权限</h1>
      </header>

      <div v-if="notice" class="notice success">
        <Check :size="16" />{{ notice }}
      </div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />{{ errorMessage }}
      </div>
      <div v-if="loading" class="state">正在加载权限…</div>

      <template v-else>
        <section class="panel">
          <h2>角色权限分配</h2>
          <div class="assignment">
            <label>
              选择角色
              <select
                v-model.number="selectedRoleId"
                @change="loadRolePermissions"
              >
                <option :value="0" disabled>请选择角色</option>
                <option
                  v-for="item in roles"
                  :key="Number(item.id)"
                  :value="Number(item.id)"
                >
                  {{ item.role_name || item.role_code }}
                </option>
              </select>
            </label>
            <label>
              添加权限
              <select @change="handlePermissionChange">
                <option value="">选择权限</option>
                <option
                  v-for="item in permissions"
                  :key="Number(item.id)"
                  :value="String(item.permission_code)"
                >
                  {{ item.permission_name || item.permission_code }}
                </option>
              </select>
            </label>
          </div>
          <div class="list">
            <article v-for="item in rolePermissions" :key="Number(item.id)">
              <div>
                <strong>{{ item.permission_name || item.permission_code }}</strong>
                <small>{{ item.permission_code }}</small>
              </div>
              <button
                class="icon danger"
                type="button"
                title="移除权限"
                @click="unlinkPermission(Number(item.id))"
              >
                <X :size="15" />
              </button>
            </article>
          </div>
          <p v-if="selectedRole" class="helper">
            当前角色：{{ selectedRole.role_name || selectedRole.role_code }}
          </p>
        </section>

        <section class="panel">
          <h2>新增角色</h2>
          <form @submit.prevent="addRole">
            <input
              v-model="roleForm.role_code"
              required
              placeholder="角色编码"
            />
            <input
              v-model="roleForm.role_name"
              required
              placeholder="角色名称"
            />
            <button class="primary" type="submit" :disabled="saving">
              <Plus :size="15" />创建角色
            </button>
          </form>
          <div class="list">
            <article v-for="item in roles" :key="Number(item.id)">
              <div>
                <strong>{{ item.role_code }}</strong>
                <small>{{ item.role_name }}</small>
              </div>
              <select v-model.number="item.status" @change="toggleRole(item)">
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select>
              <button
                class="icon danger"
                type="button"
                title="删除角色"
                @click="removeRole(Number(item.id))"
              >
                <Trash2 :size="15" />
              </button>
            </article>
          </div>
        </section>

        <section class="panel">
          <h2>新增权限</h2>
          <form @submit.prevent="addPermission">
            <input
              v-model="permissionForm.permission_code"
              required
              placeholder="权限编码"
            />
            <input
              v-model="permissionForm.permission_name"
              required
              placeholder="权限名称"
            />
            <select v-model.number="permissionForm.type">
              <option :value="1">菜单</option>
              <option :value="2">按钮</option>
              <option :value="3">接口</option>
            </select>
            <button class="primary" type="submit" :disabled="saving">
              <Plus :size="15" />创建权限
            </button>
          </form>
          <div class="list">
            <article v-for="item in permissions" :key="Number(item.id)">
              <div>
                <strong>{{ item.permission_code }}</strong>
                <small>{{ item.permission_name }}</small>
              </div>
              <select v-model.number="item.type" @change="togglePermission(item)">
                <option :value="1">菜单</option>
                <option :value="2">按钮</option>
                <option :value="3">接口</option>
              </select>
              <button
                class="icon danger"
                type="button"
                title="删除权限"
                @click="removePermission(Number(item.id))"
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
  max-width: 1000px;
}

.page header {
  margin-bottom: 22px;
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

.panel {
  margin-top: 16px;
  padding: 20px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.panel h2 {
  font-size: 18px;
}

.panel form,
.assignment {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.panel label {
  display: grid;
  gap: 6px;
  min-width: 220px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
}

.panel input,
.panel select {
  min-height: 38px;
  padding: 0 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.panel input {
  flex: 1;
  min-width: 150px;
}

.primary {
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

.list {
  margin-top: 14px;
  display: grid;
  gap: 7px;
}

.list article {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
}

.list strong,
.list small {
  display: block;
}

.list small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 12px;
}

.list select {
  margin-left: auto;
}

.icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.danger {
  color: var(--danger);
  background: var(--danger-soft);
}

.notice {
  margin-bottom: 12px;
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

.state,
.helper {
  padding: 20px 0;
  color: var(--muted);
}

@media (max-width: 620px) {
  .panel label {
    min-width: 100%;
  }

  .panel form,
  .assignment {
    display: grid;
  }

  .primary {
    justify-content: center;
  }
}
</style>
