<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Building2, CircleAlert, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { deleteDepartment, getAdminDepartments } from '@/api/department'
import type { Department } from '@/types/user'
const items = ref<Department[]>([])
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const load = async () => { loading.value = true; try { items.value = await getAdminDepartments() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '科室加载失败，请稍后重试。' } finally { loading.value = false } }
const remove = async (id: number) => { if (!window.confirm('确定停用这个科室吗？')) return; try { await deleteDepartment(id); notice.value = '科室已停用'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '科室停用失败，请稍后重试。' } }
onMounted(load)
</script>
<template>
  <WorkspaceLayout role="admin"><div class="page"><header><div><p>组织管理</p><h1>科室管理</h1></div><RouterLink class="primary" to="/admin/departments/create"><Plus :size="16" />新增科室</RouterLink></header><div v-if="notice" class="notice success">{{ notice }}</div><div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载科室…</div><div v-else-if="!items.length" class="state">暂无科室。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><span class="icon"><Building2 :size="19" /></span><div><strong>{{ item.name }}</strong><small>{{ item.code }} · {{ item.location || '位置未填写' }} · {{ item.status === 1 ? '启用' : '停用' }}</small><p v-if="item.description">{{ item.description }}</p></div><div class="actions"><RouterLink class="icon-button" :to="`/admin/departments/edit/${item.id}`" title="编辑科室"><Pencil :size="15" /></RouterLink><button class="icon-button danger" type="button" title="停用科室" @click="remove(item.id)"><Trash2 :size="15" /></button></div></article></div></div></WorkspaceLayout>
</template>
<style scoped>
.page{max-width:980px}.page header{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.primary{min-height:40px;padding:0 13px;display:inline-flex;align-items:center;gap:7px;color:#fff;background:var(--primary);border-radius:5px;text-decoration:none}.list{display:grid;gap:9px}.list article{padding:16px;display:flex;align-items:flex-start;gap:12px;background:var(--surface-strong);border:1px solid var(--border);border-radius:7px}.icon{width:36px;height:36px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:5px}.list strong,.list small,.list p{display:block}.list small{margin-top:4px;color:var(--muted);font-size:12px}.list p{margin-top:7px;color:var(--muted);font-size:13px}.actions{margin-left:auto;display:flex;gap:7px}.icon-button{width:34px;height:34px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px}.danger{color:var(--danger);background:var(--danger-soft);cursor:pointer}.notice{margin-bottom:14px;padding:11px;display:flex;gap:7px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}.state{padding:45px;color:var(--muted);text-align:center}@media(max-width:620px){.page header{align-items:flex-start;gap:12px;flex-direction:column}.list article{flex-wrap:wrap}.actions{width:100%;margin-left:48px}}
</style>
