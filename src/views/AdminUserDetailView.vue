<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert, ShieldCheck, Trash2 } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminUser, getAdminUserPermissions, getAdminUserRoles } from '@/api/admin'
import { getAdminRoles, removeAdminRole } from '@/api/admin-extended'
import type { AdminUserSummary } from '@/types/user'

const route = useRoute()
const user = ref<AdminUserSummary | null>(null)
const roles = ref<string[]>([])
const permissions = ref<string[]>([])
const roleCatalog = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const roleLabel = (code: string) => ({ ADMIN: '管理员', PATIENT: '患者', DOCTOR: '医生', REGISTRATION: '挂号员', PHARMACY: '药房人员', DEPARTMENT_MANAGER: '科室管理员' }[code] || code)
const load = async () => {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const [userData, roleData, permissionData, catalog] = await Promise.all([getAdminUser(id), getAdminUserRoles(id), getAdminUserPermissions(id), getAdminRoles()])
    user.value = userData
    roles.value = roleData
    permissions.value = permissionData
    roleCatalog.value = catalog
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '账户详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
const removeRole = async (code: string) => {
  const role = roleCatalog.value.find((entry) => String(entry.role_code) === code)
  if (!role || !user.value || !window.confirm(`确定移除“${roleLabel(code)}”权限吗？`)) return
  saving.value = true
  try {
    await removeAdminRole(user.value.user_id, Number(role.id))
    notice.value = '角色已移除'
    await load()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '角色移除失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
onMounted(load)
</script>
<template>
  <WorkspaceLayout role="admin"><div class="page"><RouterLink class="back" to="/admin/users/accounts"><ArrowLeft :size="16" />返回账户列表</RouterLink><header><p>账号管理</p><h1>账户详情</h1></header><div v-if="loading" class="state">正在加载账户详情…</div><div v-else-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><template v-else-if="user"><div v-if="notice" class="notice success">{{ notice }}</div><section class="summary"><div><span>用户名</span><strong>{{ user.username }}</strong></div><div><span>账户编号</span><strong>{{ user.user_id }}</strong></div><div><span>显示名称</span><strong>{{ user.display_name || user.real_name || '未填写' }}</strong></div><div><span>状态</span><strong>{{ user.status === 1 ? '启用' : '停用' }}</strong></div></section><section class="panel"><h2><ShieldCheck :size="18" />角色</h2><div v-if="!roles.length" class="empty">暂无角色。</div><div v-else class="chips"><span v-for="code in roles" :key="code" class="chip">{{ roleLabel(code) }}<button type="button" :disabled="saving" title="移除角色" @click="removeRole(code)"><Trash2 :size="13" /></button></span></div></section><section class="panel"><h2>权限</h2><div v-if="!permissions.length" class="empty">暂无特别权限。</div><div v-else class="chips"><span v-for="code in permissions" :key="code" class="chip readonly">{{ code }}</span></div></section></template></div></WorkspaceLayout>
</template>
<style scoped>
.page{max-width:900px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page header{margin:28px 0 22px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:8px;overflow:hidden}.summary div{padding:16px;background:var(--surface-strong)}.summary span,.summary strong{display:block}.summary span{color:var(--muted);font-size:12px}.summary strong{margin-top:6px;font-size:14px}.panel{margin-top:16px;padding:20px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.panel h2{display:flex;align-items:center;gap:7px;font-size:17px}.chips{margin-top:14px;display:flex;gap:8px;flex-wrap:wrap}.chip{min-height:32px;padding:0 9px;display:inline-flex;align-items:center;gap:8px;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;font-size:12px}.chip button{display:grid;place-items:center;color:var(--danger);background:none;border:0;cursor:pointer}.chip.readonly{color:var(--ink)}.empty,.state{padding:28px 0;color:var(--muted);text-align:center}.notice{margin-bottom:14px;padding:11px;display:flex;gap:7px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}@media(max-width:760px){.summary{grid-template-columns:repeat(2,1fr)}}@media(max-width:460px){.summary{grid-template-columns:1fr}}
</style>


