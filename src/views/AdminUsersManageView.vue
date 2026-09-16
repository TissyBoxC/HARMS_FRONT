<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Check, CircleAlert, Eye, RotateCcw, Search, Trash2, UserCog } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { assignAdminRole, deleteAdminUser, getAdminRoles, getAdminUsersPage, restoreAdminUser, updateAdminUser } from '@/api/admin-extended'

const items = ref<Record<string, unknown>[]>([])
const roles = ref<Record<string, unknown>[]>([])
const total = ref(0)
const form = reactive({ keyword: '', user_type: '', status: '', page: 1, page_size: 20 })
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const pageCount = () => Math.max(1, Math.ceil(total.value / form.page_size))
const load = async () => {
  loading.value = true
  try {
    const data = await getAdminUsersPage({ keyword: form.keyword, user_type: form.user_type ? Number(form.user_type) : undefined, status: form.status === '' ? undefined : Number(form.status), page: form.page, page_size: form.page_size })
    items.value = (data.items as Record<string, unknown>[]) || []
    total.value = Number(data.total || 0)
    roles.value = await getAdminRoles()
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '用户列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
const submitFilter = () => { form.page = 1; void load() }
const changePage = (delta: number) => { const next = form.page + delta; if (next < 1 || next > pageCount()) return; form.page = next; void load() }
const save = async (item: Record<string, unknown>) => { try { await updateAdminUser(Number(item.user_id), { username: String(item.username), status: Number(item.status) }); notice.value = '账号信息已保存'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '账号保存失败，请稍后重试。' } }
const remove = async (id: number) => { if (!window.confirm('确定停用该账号吗？')) return; try { await deleteAdminUser(id); notice.value = '账号已停用'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '账号停用失败，请稍后重试。' } }
const restore = async (id: number) => { try { await restoreAdminUser(id); notice.value = '账号已恢复'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '账号恢复失败，请稍后重试。' } }
const role = async (item: Record<string, unknown>) => { const code = String(item.role_code || ''); if (!code) return; try { await assignAdminRole(Number(item.user_id), code); notice.value = '角色已分配'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '角色分配失败，请稍后重试。' } }
onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header><div><p>账号管理</p><h1>账号维护</h1></div><nav class="create-links"><RouterLink to="/admin/users/create-patient">新增患者</RouterLink><RouterLink to="/admin/users/create-doctor">新增医生</RouterLink><RouterLink to="/admin/users/create-registration">新增挂号员</RouterLink><RouterLink to="/admin/users/create-pharmacy">新增药房</RouterLink></nav></header>
      <form class="filters" @submit.prevent="submitFilter"><input v-model="form.keyword" placeholder="用户名或姓名" /><select v-model="form.user_type"><option value="">全部类型</option><option value="1">患者</option><option value="2">医生</option><option value="3">管理员</option><option value="4">挂号员</option><option value="5">药房</option></select><select v-model="form.status"><option value="">全部状态</option><option value="1">启用</option><option value="0">停用</option></select><button type="submit"><Search :size="16" />查询</button></form>
      <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div><div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载账号…</div>
      <div v-else class="list">
        <article v-for="item in items" :key="Number(item.user_id)"><UserCog :size="18" /><RouterLink class="detail-link" :to="'/admin/users/' + item.user_id" title="查看账户详情"><Eye :size="15" /></RouterLink><div class="identity"><input v-model="item.username" /><small>编号 {{ item.user_id }} · {{ item.display_name || '未命名' }}</small></div><RouterLink v-if="Number(item.patient_id)" class="edit-link" :to="`/admin/patients/${item.patient_id}/edit`">患者资料</RouterLink><RouterLink v-if="Number(item.doctor_id)" class="edit-link" :to="`/admin/doctors/${item.doctor_id}/edit`">医生资料</RouterLink><select v-model="item.role_code" @change="role(item)"><option value="">分配角色</option><option v-for="r in roles" :key="Number(r.id)" :value="r.role_code">{{ r.role_name }}</option></select><select v-model.number="item.status"><option :value="1">启用</option><option :value="0">停用</option></select><button class="icon" type="button" title="保存账号" @click="save(item)"><Check :size="15" /></button><button v-if="Number(item.status) === 1" class="icon danger" type="button" title="停用账号" @click="remove(Number(item.user_id))"><Trash2 :size="15" /></button><button v-else class="icon" type="button" title="恢复账号" @click="restore(Number(item.user_id))"><RotateCcw :size="15" /></button></article>
      </div>
      <div v-if="!loading" class="pagination"><button type="button" :disabled="form.page <= 1" @click="changePage(-1)">上一页</button><span>第 {{ form.page }} / {{ pageCount() }} 页，共 {{ total }} 个账户</span><button type="button" :disabled="form.page >= pageCount()" @click="changePage(1)">下一页</button></div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page{max-width:1100px}.page header{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:20px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.create-links{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.create-links a,.edit-link,.detail-link{min-height:34px;padding:0 10px;display:inline-flex;align-items:center;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;text-decoration:none;font-size:12px}.filters{display:flex;gap:8px;flex-wrap:wrap}.filters input,.filters select,.filters button{min-height:40px;padding:0 10px;background:var(--surface-strong);border:1px solid var(--border-strong);border-radius:5px}.filters input{flex:1;min-width:200px}.filters button{display:inline-flex;align-items:center;gap:6px;color:#fff;background:var(--primary);cursor:pointer}.list{margin-top:18px;display:grid;gap:8px}.list article{padding:12px;display:flex;align-items:center;gap:9px;background:var(--surface-strong);border:1px solid var(--border);border-radius:7px}.list article>svg{color:var(--primary)}.identity{flex:1}.identity input{width:100%;min-height:34px;padding:0 8px;border:1px solid var(--border);border-radius:4px}.identity small{display:block;margin-top:4px;color:var(--muted);font-size:12px}.list select{min-height:34px;padding:0 7px;border:1px solid var(--border);border-radius:4px}.icon{width:32px;height:32px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;cursor:pointer}.danger{color:var(--danger);background:var(--danger-soft)}.pagination{margin-top:16px;display:flex;align-items:center;justify-content:center;gap:12px;color:var(--muted);font-size:12px}.pagination button{min-height:34px;padding:0 10px;background:var(--surface-strong);border:1px solid var(--border);border-radius:5px;cursor:pointer}.pagination button:disabled{opacity:.5;cursor:not-allowed}.notice{margin-top:14px;padding:11px;display:flex;gap:7px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}.state{padding:40px;color:var(--muted)}@media(max-width:900px){.page header{align-items:flex-start;flex-direction:column}.create-links{justify-content:flex-start}}@media(max-width:760px){.list article{align-items:stretch;flex-wrap:wrap}.identity{min-width:calc(100% - 30px)}.list select,.edit-link,.detail-link{flex:1}.pagination{flex-wrap:wrap}}
</style>
