<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ClipboardList, CircleAlert, Eye } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPatientVisits } from '@/api/clinical'
import { useAuth } from '@/stores/auth'
import type { VisitRecord } from '@/types/user'
const { currentUser } = useAuth(); const isAdmin = computed(() => currentUser.value?.role_codes.includes('ADMIN') || currentUser.value?.primary_role === 'ADMIN'); const items = ref<VisitRecord[]>([]); const loading = ref(true); const errorMessage = ref('')
const statusLabel = (value: number) => ({ 1: '待就诊', 2: '就诊中', 3: '已完成' }[value] || '处理中')
onMounted(async () => { if (isAdmin.value) { loading.value = false; return } try { items.value = await getPatientVisits() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '就诊记录加载失败，请稍后重试。' } finally { loading.value = false } })
</script>
<template><div class="page"><p>就诊记录</p><h1>我的就诊</h1><div v-if="isAdmin" class="notice info"><CircleAlert :size="16" />管理员可以浏览患者页面；就诊记录请由患者账号查看。</div><template v-else><div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载记录…</div><div v-else-if="!items.length" class="state">暂无就诊记录。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><span class="icon"><ClipboardList :size="18" /></span><div><strong>{{ item.visit_no }}</strong><small>{{ item.appointment_no || `预约 ${item.appointment_id}` }} · {{ item.doctor_name || '医生' }} · {{ statusLabel(item.status) }}</small></div><RouterLink class="icon-button" :to="`/patient/visits/${item.id}`" title="查看详情"><Eye :size="16" /></RouterLink></article></div></template></div></template>
<style scoped>.page{width:min(100% - 48px,980px);margin:0 auto;padding:72px 0 110px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.list{margin-top:28px;display:grid;gap:10px}.list article{padding:16px;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.icon{width:36px;height:36px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border-radius:7px}.list strong,.list small{display:block}.list small{margin-top:5px;color:#64748b;font-size:12px}.icon-button{margin-left:auto;width:34px;height:34px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px}.state{padding:48px;color:#64748b;text-align:center}.notice{margin-top:18px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}.notice.info{color:#1e4f80;background:#e4f0fb}</style>
