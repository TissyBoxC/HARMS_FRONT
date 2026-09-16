<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Building2, CircleAlert, Pencil } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminDepartments } from '@/api/department'
import type { Department } from '@/types/user'

const items = ref<Department[]>([])
const loading = ref(true)
const errorMessage = ref('')
onMounted(async () => {
  try { items.value = await getAdminDepartments() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '科室加载失败，请稍后重试。' } finally { loading.value = false }
})
</script>
<template><WorkspaceLayout role="department"><div class="page"><p>科室服务</p><h1>科室工作台</h1><div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载科室…</div><div v-else-if="!items.length" class="state">暂无科室信息。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><span class="icon"><Building2 :size="20" /></span><div><strong>{{ item.name }}</strong><small>{{ item.code }} · {{ item.location || '位置未填写' }}</small></div><RouterLink class="icon-button" :to="`/admin/departments/edit/${item.id}`" title="编辑科室"><Pencil :size="16" /></RouterLink></article></div></div></WorkspaceLayout></template>
<style scoped>.page{max-width:980px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.list{margin-top:26px;display:grid;gap:10px}.list article{padding:16px;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.icon{width:38px;height:38px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border-radius:7px}.list strong,.list small{display:block}.list small{margin-top:4px;color:#64748b;font-size:12px}.icon-button{margin-left:auto;width:34px;height:34px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px}.notice{margin-top:18px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}.state{padding:48px;color:#64748b;text-align:center}</style>
