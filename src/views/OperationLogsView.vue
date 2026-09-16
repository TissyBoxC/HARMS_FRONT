<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { CircleAlert, Eye, Search } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getOperationLogs } from '@/api/operationLog'
import type { OperationLogRecord } from '@/types/user'

const items = ref<OperationLogRecord[]>([])
const loading = ref(false)
const errorMessage = ref('')
const form = reactive({ user_id: '', operation_type: '', target_type: '', target_id: '', start_time: '', end_time: '', limit: 100 })
const load = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    items.value = await getOperationLogs({ user_id: form.user_id ? Number(form.user_id) : undefined, operation_type: form.operation_type, target_type: form.target_type, target_id: form.target_id ? Number(form.target_id) : undefined, start_time: form.start_time || undefined, end_time: form.end_time || undefined, limit: Number(form.limit) })
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '日志加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin"><div class="page"><p>系统记录</p><h1>操作日志</h1><form class="filters" @submit.prevent="load"><input v-model="form.user_id" inputmode="numeric" placeholder="操作人编号" /><input v-model="form.operation_type" placeholder="操作类型" /><input v-model="form.target_type" placeholder="目标类型" /><input v-model="form.target_id" inputmode="numeric" placeholder="目标编号" /><input v-model="form.start_time" type="datetime-local" aria-label="开始时间" /><input v-model="form.end_time" type="datetime-local" aria-label="结束时间" /><select v-model.number="form.limit"><option :value="50">50 条</option><option :value="100">100 条</option><option :value="500">500 条</option></select><button type="submit"><Search :size="16" />查询</button></form><div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载日志…</div><div v-else-if="!items.length" class="state">暂无符合条件的日志。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><div><strong>{{ item.operation_type }}</strong><small>{{ item.target_type }} #{{ item.target_id }} · 操作人 {{ item.user_id }}</small></div><time>{{ item.created_at }}</time><RouterLink class="icon-button" :to="`/admin/operation-logs/${item.id}`" title="查看详情"><Eye :size="16" /></RouterLink><p>{{ item.description }}</p></article></div></div></WorkspaceLayout>
</template>

<style scoped>
.page{max-width:1100px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.filters{margin-top:26px;display:grid;grid-template-columns:repeat(4,1fr) auto;gap:9px}.filters input,.filters select{min-height:40px;padding:0 10px;background:#fff;border:1px solid #dbe3ec;border-radius:6px}.filters button{min-height:40px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center;gap:6px;color:#fff;background:#2563eb;border:0;border-radius:6px;cursor:pointer}.list{margin-top:22px;display:grid;gap:8px}.list article{padding:14px 16px;display:grid;grid-template-columns:1fr auto auto;gap:5px 14px;align-items:center;background:#fff;border:1px solid #e2e8f0;border-radius:7px}.list strong,.list small,.list p{display:block}.list small{margin-top:4px;color:#64748b;font-size:12px}.list time{color:#64748b;font-size:12px}.list p{grid-column:1/-1;color:#475569;font-size:13px}.icon-button{width:34px;height:34px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px}.state{padding:48px;color:#64748b;text-align:center}.notice{margin-top:18px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}@media(max-width:820px){.filters{grid-template-columns:repeat(2,1fr)}.filters button{grid-column:1/-1}}@media(max-width:560px){.filters{grid-template-columns:1fr}.list article{grid-template-columns:1fr auto}.list time{grid-column:1/-1;grid-row:2}.list p{grid-row:3}.icon-button{grid-column:2;grid-row:1}}
</style>
