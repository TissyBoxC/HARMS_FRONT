<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getOperationLog } from '@/api/operationLog'
import type { OperationLogRecord } from '@/types/user'
const route=useRoute();const item=ref<OperationLogRecord|null>(null);const loading=ref(true);const errorMessage=ref('')
onMounted(async()=>{try{item.value=await getOperationLog(Number(route.params.id))}catch(error){errorMessage.value=error instanceof ApiError?error.message:'日志详情加载失败，请稍后重试。'}finally{loading.value=false}})
</script>
<template><WorkspaceLayout role="admin"><div class="page"><RouterLink class="back" to="/admin/operation-logs"><ArrowLeft :size="16"/>返回日志列表</RouterLink><header><p>系统记录</p><h1>日志详情</h1></header><div v-if="loading" class="state">正在加载日志…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16"/>{{errorMessage}}</div><section v-else-if="item" class="card"><div><span>操作类型</span><strong>{{item.operation_type}}</strong></div><div><span>目标</span><strong>{{item.target_type}} #{{item.target_id}}</strong></div><div><span>操作人</span><strong>{{item.user_id}}</strong></div><div><span>时间</span><strong>{{item.created_at}}</strong></div><div><span>IP 地址</span><strong>{{item.ip_address||'未记录'}}</strong></div><div class="wide"><span>说明</span><strong>{{item.description}}</strong></div></section></div></WorkspaceLayout></template>
<style scoped>.page{max-width:860px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;text-decoration:none;font-size:13px}.page header{margin:28px 0 24px}.page header p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.card{padding:24px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.card div{display:grid;gap:6px}.card span{color:#64748b;font-size:12px}.card strong{font-size:14px}.wide{grid-column:1/-1}.state{padding:42px;color:#64748b;text-align:center}.notice{padding:12px;display:flex;gap:7px;color:#b91c1c;background:#fee2e2;border-radius:6px}@media(max-width:620px){.card{grid-template-columns:1fr}.wide{grid-column:auto}}
</style>
