<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CalendarDays, CircleAlert, Eye, Plus, Square, Trash2 } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { deleteAdminSchedule, getAdminSchedules } from '@/api/admin'
import { stopAdminSchedule } from '@/api/admin-extended'
import type { Schedule } from '@/types/user'
const items = ref<Schedule[]>([]); const loading = ref(true); const errorMessage = ref(''); const notice = ref('')
const periodLabel = (value:number) => ({1:'上午',2:'下午',3:'晚上'}[value] || '其他')
const statusLabel = (value:number) => ({0:'未开始',1:'可预约',2:'停诊',3:'已结束'}[value] || '未知')
const load = async () => { loading.value = true; try { items.value = await getAdminSchedules() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '排班加载失败，请稍后重试。' } finally { loading.value = false } }
const stop = async (id:number) => { if (!window.confirm('确定停诊并取消相关预约吗？')) return; try { await stopAdminSchedule(id); notice.value = '排班已停诊'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '停诊失败，请稍后重试。' } }
const remove = async (id:number) => { if (!window.confirm('确定删除这条排班吗？')) return; try { await deleteAdminSchedule(id); notice.value = '排班已删除'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '排班删除失败，请稍后重试。' } }
onMounted(load)
</script>
<template>
  <WorkspaceLayout role="admin"><div class="page"><header><div><p>门诊安排</p><h1>全部排班</h1></div><RouterLink class="primary" to="/admin/schedules/create"><Plus :size="16" />新增排班</RouterLink></header><div v-if="notice" class="notice success">{{ notice }}</div><div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-if="loading" class="state">正在加载排班…</div><div v-else-if="!items.length" class="state">暂无排班。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><span class="icon"><CalendarDays :size="19" /></span><div><strong>{{ item.schedule_date }} · {{ periodLabel(item.period) }}</strong><small>医生 {{ item.doctor_id }} · 科室 {{ item.department_id }} · {{ item.start_time.slice(0,5) }}—{{ item.end_time.slice(0,5) }}</small><p>号源 {{ item.booked_count }}/{{ item.total_count }} · ¥{{ Number(item.fee).toFixed(2) }} · {{ statusLabel(item.status) }}</p></div><div class="actions"><RouterLink class="icon-button" :to="`/admin/schedules/${item.id}`" title="查看排班详情"><Eye :size="15" /></RouterLink><button v-if="item.status===1" class="icon-button warning" type="button" title="停诊" @click="stop(item.id)"><Square :size="15" /></button><button v-if="item.status!==1" class="icon-button danger" type="button" title="删除排班" @click="remove(item.id)"><Trash2 :size="15" /></button></div></article></div></div></WorkspaceLayout>
</template>
<style scoped>
.page{max-width:1000px}.page header{display:flex;justify-content:space-between;align-items:end;margin-bottom:22px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.primary{min-height:40px;padding:0 13px;display:inline-flex;align-items:center;gap:7px;color:#fff;background:var(--primary);border-radius:5px;text-decoration:none}.list{display:grid;gap:9px}.list article{padding:16px;display:flex;align-items:flex-start;gap:12px;background:var(--surface-strong);border:1px solid var(--border);border-radius:7px}.icon{width:36px;height:36px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:5px}.list strong,.list small,.list p{display:block}.list small{margin-top:4px;color:var(--muted);font-size:12px}.list p{margin-top:7px;color:var(--muted);font-size:13px}.actions{margin-left:auto;display:flex;gap:7px}.icon-button{width:34px;height:34px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;cursor:pointer}.warning{color:#92400e;background:#fef3c7}.danger{color:var(--danger);background:var(--danger-soft)}.notice{margin-bottom:14px;padding:11px;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}.state{padding:45px;color:var(--muted);text-align:center}@media(max-width:620px){.page header{align-items:flex-start;gap:12px;flex-direction:column}.list article{flex-wrap:wrap}.actions{width:100%;margin-left:48px}}
</style>
