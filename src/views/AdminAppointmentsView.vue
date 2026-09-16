<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CircleAlert, Eye } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminAppointmentsPage } from '@/api/adminAppointment'
import type { AppointmentRecord } from '@/types/user'
const items = ref<AppointmentRecord[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 20
const loading = ref(true)
const errorMessage = ref('')
const statusLabel = (value: number) => ({ 1: '待支付', 2: '已预约', 3: '已签到', 4: '就诊中', 5: '已完成', 6: '已取消', 7: '医生停诊取消', 8: '已过期', 9: '已退款' }[value] || '处理中')
const pageCount = () => Math.max(1, Math.ceil(total.value / pageSize))
const changePage = (delta: number) => { const next = page.value + delta; if (next < 1 || next > pageCount()) return; page.value = next; void load() }
const load = async () => { try { const result = await getAdminAppointmentsPage(page.value, pageSize); items.value = result.items; total.value = result.total } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '预约加载失败，请稍后重试。' } finally { loading.value = false } }
onMounted(load)
</script>
<template><WorkspaceLayout role="admin"><div class="page"><p>业务查询</p><h1>全部预约</h1><div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载预约…</div><div v-else-if="!items.length" class="state">暂无预约记录。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><div><strong>{{ item.appointment_no || `预约 ${item.id}` }}</strong><small>{{ item.patient_name || '患者' }} · {{ item.doctor_name || '医生' }} · {{ item.appointment_date || '未填写日期' }} · {{ statusLabel(item.status) }}</small></div><RouterLink class="icon-button" :to="`/admin/appointments/${item.id}`" title="查看详情"><Eye :size="16" /></RouterLink></article></div><div v-if="!loading && items.length" class="pagination"><button type="button" :disabled="page<=1" @click="changePage(-1)">上一页</button><span>第 {{ page }} / {{ pageCount() }} 页，共 {{ total }} 条</span><button type="button" :disabled="page>=pageCount()" @click="changePage(1)">下一页</button></div></div></WorkspaceLayout></template>
<style scoped>.page{max-width:1100px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.list{margin-top:28px;display:grid;gap:10px}.list article{padding:16px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.list strong,.list small{display:block}.list small{margin-top:5px;color:#64748b;font-size:12px}.icon-button{width:34px;height:34px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px}.pagination{margin-top:18px;display:flex;justify-content:center;align-items:center;gap:12px;color:#64748b;font-size:12px}.pagination button{min-height:34px;padding:0 10px;background:#fff;border:1px solid #dbe3ec;border-radius:5px;cursor:pointer}.pagination button:disabled{opacity:.5}.state{padding:48px;color:#64748b;text-align:center}.notice{margin-top:18px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}</style>


