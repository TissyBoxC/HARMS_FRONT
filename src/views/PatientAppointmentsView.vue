<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CalendarDays, CircleAlert, Eye, LogIn, XCircle } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { cancelPatientAppointment, checkInPatientAppointment, getPatientAppointmentsPage } from '@/api/appointment'
import { useAuth } from '@/stores/auth'
import type { AppointmentRecord } from '@/types/user'

const items = ref<AppointmentRecord[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 20
const loading = ref(true)
const errorMessage = ref('')
const actionId = ref(0)
const { currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.role_codes.includes('ADMIN') || currentUser.value?.primary_role === 'ADMIN')
const statusLabel = (value: number) => ({ 1: '待支付', 2: '已预约', 3: '已签到', 4: '就诊中', 5: '已完成', 6: '已取消', 7: '医生停诊取消', 8: '已过期', 9: '已退款' }[value] || '处理中')
const load = async () => { loading.value = true; errorMessage.value = ''; try { const result = await getPatientAppointmentsPage(page.value, pageSize)
    items.value = result.items
    total.value = result.total } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '预约加载失败，请稍后重试。' } finally { loading.value = false } }
const act = async (id: number, type: 'check-in' | 'cancel') => { actionId.value = id; errorMessage.value = ''; try { if (type === 'check-in') await checkInPatientAppointment(id); else await cancelPatientAppointment(id); await load() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '操作失败，请稍后重试。' } finally { actionId.value = 0 } }
const pageCount = () => Math.max(1, Math.ceil(total.value / pageSize))
const changePage = (delta: number) => { const next = page.value + delta; if (next < 1 || next > pageCount()) return; page.value = next; void load() }
onMounted(() => { if (isAdmin.value) loading.value = false; else void load() })
</script>

<template>
  <div class="page">
    <p>就诊安排</p><h1>我的预约</h1>
    <div v-if="isAdmin" class="notice info"><CircleAlert :size="16" />管理员可以浏览患者页面；预约记录请在管理工作台的“预约查询”中查看。</div>
    <template v-else>
      <div v-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div>
      <div v-if="loading" class="state">正在加载预约…</div>
      <div v-else-if="!items.length" class="state">暂无预约记录。</div>
      <div v-else class="list">
        <article v-for="item in items" :key="item.id">
          <div class="main"><span class="icon"><CalendarDays :size="18" /></span><div><strong>{{ item.doctor_name || `预约 ${item.id}` }}</strong><small>{{ item.department_name || '门诊' }} · {{ item.appointment_date || '未填写日期' }} · {{ statusLabel(item.status) }}</small></div></div>
          <div class="actions"><RouterLink class="icon-button" :to="`/patient/appointments/${item.id}`" title="查看详情"><Eye :size="16" /></RouterLink><button v-if="item.status === 2" class="icon-button" type="button" :disabled="actionId === item.id" title="签到" @click="act(item.id, 'check-in')"><LogIn :size="16" /></button><button v-if="item.status === 1 || item.status === 2" class="icon-button danger" type="button" :disabled="actionId === item.id" title="取消预约" @click="act(item.id, 'cancel')"><XCircle :size="16" /></button></div>
        </article>
      </div>
      <div v-if="!loading && items.length" class="pagination"><button type="button" :disabled="page<=1" @click="changePage(-1)">上一页</button><span>第 {{ page }} / {{ pageCount() }} 页，共 {{ total }} 条</span><button type="button" :disabled="page>=pageCount()" @click="changePage(1)">下一页</button></div>
    </template>
  </div>
</template>

<style scoped>
.page{width:min(100% - 48px,980px);margin:0 auto;padding:72px 0 110px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.list{margin-top:28px;display:grid;gap:10px}.list article{padding:16px;display:flex;align-items:center;justify-content:space-between;gap:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.main{display:flex;align-items:center;gap:12px}.icon{width:36px;height:36px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border-radius:7px}.main strong,.main small{display:block}.main small{margin-top:5px;color:#64748b;font-size:12px}.actions{display:flex;gap:6px}.icon-button{width:34px;height:34px;display:grid;place-items:center;color:#2563eb;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px}.danger{color:#b91c1c;background:#fee2e2;border-color:#fecaca}.pagination{margin-top:18px;display:flex;justify-content:center;align-items:center;gap:12px;color:#64748b;font-size:12px}.pagination button{min-height:34px;padding:0 10px;background:#fff;border:1px solid #dbe3ec;border-radius:5px;cursor:pointer}.pagination button:disabled{opacity:.5}.state{padding:48px;color:#64748b;text-align:center}.notice{margin-top:18px;padding:12px;display:flex;gap:8px;align-items:center;color:#b91c1c;background:#fee2e2;border-radius:7px}.notice.info{color:#1e4f80;background:#e4f0fb}@media(max-width:620px){.list article{align-items:flex-start;flex-direction:column;width:100%}.actions{width:100%}.icon-button{flex:1}}
</style>




