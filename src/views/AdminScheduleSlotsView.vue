<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Plus, Trash2 } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createAdminSlot, deleteAdminSlot, getAdminSlots, updateAdminSlot } from '@/api/admin'
import type { Slot } from '@/types/user'

const route = useRoute()
const id = Number(route.params.id)
const items = ref<Slot[]>([])
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const form = reactive({ slot_no: 1, start_time: '08:00', end_time: '08:30' })
const load = async () => { loading.value = true; try { items.value = await getAdminSlots(id) } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '时间段加载失败，请稍后重试。' } finally { loading.value = false } }
const add = async () => { saving.value = true; try { await createAdminSlot(id, form); notice.value = '时间段已添加'; form.slot_no += 1; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '时间段添加失败，请稍后重试。' } finally { saving.value = false } }
const setStatus = async (item: Slot, status: number) => { try { await updateAdminSlot(item.id, status); notice.value = '时间段状态已更新'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '时间段状态更新失败，请稍后重试。' } }
const handleStatusChange = (item: Slot, event: Event) => { const target = event.target; if (target instanceof HTMLSelectElement) void setStatus(item, Number(target.value)) }
const remove = async (item: Slot) => { if (!window.confirm('确定删除这个时间段吗？')) return; try { await deleteAdminSlot(item.id); notice.value = '时间段已删除'; await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '时间段删除失败，请稍后重试。' } }
onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin"><div class="page"><RouterLink class="back" :to="`/admin/schedules/${id}`"><ArrowLeft :size="16" />返回排班详情</RouterLink><header><p>门诊安排</p><h1>时间段管理</h1></header><div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div><div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div><form class="form" @submit.prevent="add"><label>序号<input v-model.number="form.slot_no" type="number" min="1" required /></label><label>开始时间<input v-model="form.start_time" type="time" required /></label><label>结束时间<input v-model="form.end_time" type="time" required /></label><button class="primary" type="submit" :disabled="saving"><Plus :size="16" />{{ saving ? '添加中' : '添加时间段' }}</button></form><div v-if="loading" class="state">正在加载时间段…</div><div v-else-if="!items.length" class="state">暂无时间段。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><div><strong>第 {{ item.slot_no }} 号</strong><small>{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}</small></div><select :value="item.status" @change="handleStatusChange(item, $event)"><option :value="0">可预约</option><option :value="1">已预约</option><option :value="2">已锁定</option></select><button v-if="item.status === 0" class="icon danger" type="button" title="删除时间段" @click="remove(item)"><Trash2 :size="15" /></button></article></div></div></WorkspaceLayout>
</template>

<style scoped>
.page{max-width:860px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.form{padding:18px;display:flex;align-items:end;gap:12px;flex-wrap:wrap;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.form label{display:grid;gap:6px;color:var(--ink);font-size:12px;font-weight:650}.form input,.list select{min-height:40px;padding:0 10px;background:var(--surface);border:1px solid var(--border-strong);border-radius:5px}.primary{min-height:40px;padding:0 12px;display:inline-flex;align-items:center;gap:6px;color:#fff;background:var(--primary);border:0;border-radius:5px;cursor:pointer}.list{margin-top:18px;display:grid;gap:8px}.list article{padding:14px;display:flex;align-items:center;gap:11px;background:var(--surface-strong);border:1px solid var(--border);border-radius:7px}.list strong,.list small{display:block}.list small{margin-top:4px;color:var(--muted);font-size:12px}.list select{margin-left:auto}.icon{width:32px;height:32px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border:1px solid var(--border);border-radius:5px;cursor:pointer}.danger{color:var(--danger);background:var(--danger-soft)}.notice{margin-bottom:14px;padding:11px;display:flex;gap:7px;align-items:center;border-radius:6px}.success{color:#166534;background:#dcfce7}.error{color:var(--danger);background:var(--danger-soft)}.state{padding:42px;color:var(--muted);text-align:center}@media(max-width:620px){.form{display:grid;grid-template-columns:1fr}.primary{justify-content:center}.list article{flex-wrap:wrap}.list select{margin-left:0;width:100%}}
</style>
