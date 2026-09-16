<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { CalendarDays, Check, CircleAlert, Pencil, Plus, Save, Trash2, X } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { RouterLink, useRoute } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import {
  createDoctorSchedule,
  createDoctorSlot,
  deleteDoctorSchedule,
  getDoctorProfile,
  getDoctorSchedules,
  getDoctorSchedule,
  getDoctorSlots,
  updateDoctorProfile,
  updateDoctorSchedule,
  updateDoctorSlotStatus,
  stopDoctorSchedule,
  updateDoctorSlot,
  deleteDoctorSlot,
} from '@/api/doctor'
import type { Department, DoctorProfile, Schedule, ScheduleRequest, Slot } from '@/types/user'
import { useAuth } from '@/stores/auth'

const profile = ref<DoctorProfile | null>(null)
const route = useRoute()
const departments = ref<Department[]>([])
const schedules = ref<Schedule[]>([])
const slots = ref<Record<number, Slot[]>>({})
const activePanel = ref<'profile' | 'schedules'>(route.path.endsWith('schedules') ? 'schedules' : 'profile')
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const { currentUser } = useAuth()
const isAdmin = computed(() => currentUser.value?.role_codes.includes('ADMIN') || currentUser.value?.primary_role === 'ADMIN')
const editingScheduleId = ref<number | null>(null)
const form = reactive({
  real_name: '',
  title: '',
  specialty: '',
  introduction: '',
  avatar_url: '',
  consultation_fee: 0,
})
const scheduleForm = reactive<ScheduleRequest>({
  department_id: 0,
  schedule_date: '',
  period: 1,
  start_time: '08:00',
  end_time: '12:00',
  total_count: 20,
  fee: 0,
  remark: '',
})
const slotForm = reactive({ slot_no: 1, start_time: '08:00', end_time: '08:30' })
const slotScheduleId = ref<number | null>(null)
const editingSlotId = ref<number | null>(null)
const slotEditForm = reactive({ slot_no: 1, start_time: '08:00', end_time: '08:30' })
const periodLabel = (period: number) =>
  (({ 1: '上午', 2: '下午', 3: '晚上' }) as Record<number, string>)[period] || '其他时段'
const statusLabel = (status: number) =>
  status === 0 ? '可预约' : status === 1 ? '已预约' : '已锁定'
const visibleSchedules = computed(() => schedules.value)
watch(
  () => route.path,
  (path) => {
    activePanel.value = path.endsWith('schedules') ? 'schedules' : 'profile'
  },
)
const clearMessage = () => {
  notice.value = ''
  errorMessage.value = ''
}
const showError = (error: unknown, fallback: string) => {
  errorMessage.value = error instanceof ApiError ? error.message : fallback
}
const loadData = async () => {
  try {
    const [profileData, departmentData, scheduleData] = await Promise.all([
      getDoctorProfile(),
      getPublicDepartments(),
      getDoctorSchedules(),
    ])
    profile.value = profileData
    departments.value = departmentData
    schedules.value = scheduleData
    Object.assign(form, {
      real_name: profileData.real_name,
      title: profileData.title || '',
      specialty: profileData.specialty || '',
      introduction: profileData.introduction || '',
      avatar_url: profileData.avatar_url || '',
      consultation_fee: Number(profileData.consultation_fee),
    })
    if (!scheduleForm.department_id) scheduleForm.department_id = profileData.department_id
  } catch (error) {
    showError(error, '信息加载失败，请稍后重试。')
  } finally {
    loading.value = false
  }
}
const saveProfile = async () => {
  clearMessage()
  saving.value = true
  try {
    profile.value = await updateDoctorProfile(form)
    notice.value = '个人简历已保存'
  } catch (error) {
    showError(error, '保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const resetScheduleForm = () => {
  editingScheduleId.value = null
  Object.assign(scheduleForm, {
    department_id: profile.value?.department_id || departments.value[0]?.id || 0,
    schedule_date: '',
    period: 1,
    start_time: '08:00',
    end_time: '12:00',
    total_count: 20,
    fee: Number(profile.value?.consultation_fee || 0),
    remark: '',
  })
}
const editSchedule = async (schedule: Schedule) => {
  clearMessage()
  editingScheduleId.value = schedule.id
  try {
    const detail = await getDoctorSchedule(schedule.id)
    Object.assign(scheduleForm, { department_id: detail.department_id, schedule_date: detail.schedule_date, period: detail.period, start_time: detail.start_time.slice(0, 5), end_time: detail.end_time.slice(0, 5), total_count: detail.total_count, fee: detail.fee, remark: detail.remark || '' })
  } catch (error) {
    editingScheduleId.value = null
    showError(error, '排班详情加载失败，请稍后重试。')
  }
  activePanel.value = 'schedules'
}
const saveSchedule = async () => {
  clearMessage()
  saving.value = true
  try {
    if (!scheduleForm.department_id || !scheduleForm.schedule_date)
      throw new Error('请填写科室和排班日期。')
    const wasEditing = Boolean(editingScheduleId.value)
    if (editingScheduleId.value) await updateDoctorSchedule(editingScheduleId.value, scheduleForm)
    else await createDoctorSchedule(scheduleForm)
    schedules.value = await getDoctorSchedules()
    notice.value = wasEditing ? '排班已更新' : '排班已创建'
    resetScheduleForm()
  } catch (error) {
    showError(error, error instanceof Error ? error.message : '排班保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const removeSchedule = async (id: number) => {
  if (!window.confirm('确定删除这条排班吗？')) return
  clearMessage()
  try {
    await deleteDoctorSchedule(id)
    schedules.value = schedules.value.filter((item) => item.id !== id)
    delete slots.value[id]
    notice.value = '排班已删除'
  } catch (error) {
    showError(error, '删除失败，请稍后重试。')
  }
}
const openSlots = async (scheduleId: number) => {
  slotScheduleId.value = slotScheduleId.value === scheduleId ? null : scheduleId
  if (slotScheduleId.value && !slots.value[scheduleId]) {
    try {
      slots.value[scheduleId] = await getDoctorSlots(scheduleId)
    } catch (error) {
      showError(error, '时间段加载失败，请稍后重试。')
    }
  }
}
const addSlot = async () => {
  if (!slotScheduleId.value) return
  clearMessage()
  try {
    const slot = await createDoctorSlot(slotScheduleId.value, slotForm)
    slots.value[slotScheduleId.value] = [...(slots.value[slotScheduleId.value] || []), slot]
    notice.value = '时间段已添加'
    slotForm.slot_no += 1
  } catch (error) {
    showError(error, '时间段添加失败，请稍后重试。')
  }
}
const toggleSlot = async (slot: Slot) => {
  if (slot.status === 1) return
  try {
    const nextStatus = slot.status === 0 ? 2 : 0
    await updateDoctorSlotStatus(slot.id, nextStatus)
    slot.status = nextStatus
  } catch (error) {
    showError(error, '状态更新失败，请稍后重试。')
  }
}
const stopSchedule = async (id: number) => {
  if (!window.confirm('确定停止这场门诊吗？')) return
  try { await stopDoctorSchedule(id); schedules.value = await getDoctorSchedules(); notice.value = '排班已停诊' } catch (error) { showError(error, '停诊失败，请稍后重试。') }
}
const editSlot = (slot: Slot) => { editingSlotId.value = slot.id; Object.assign(slotEditForm, { slot_no: slot.slot_no, start_time: slot.start_time.slice(0, 5), end_time: slot.end_time.slice(0, 5) }) }
const saveSlot = async (scheduleId: number) => { if (!editingSlotId.value) return; try { const updated = await updateDoctorSlot(editingSlotId.value, slotEditForm); slots.value[scheduleId] = (slots.value[scheduleId] || []).map((item) => item.id === updated.id ? updated : item); editingSlotId.value = null; notice.value = '时间段已更新' } catch (error) { showError(error, '时间段更新失败，请稍后重试。') } }
const removeSlot = async (scheduleId: number, slotId: number) => { if (!window.confirm('确定删除这个时间段吗？')) return; try { await deleteDoctorSlot(slotId); slots.value[scheduleId] = (slots.value[scheduleId] || []).filter((item) => item.id !== slotId); notice.value = '时间段已删除' } catch (error) { showError(error, '时间段删除失败，请稍后重试。') } }
onMounted(() => {
  if (isAdmin.value) {
    loading.value = false
    return
  }
  void loadData()
})
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="page-heading">
      <div>
        <p>医生服务</p>
        <h1>{{ activePanel === 'profile' ? '个人简历' : '我的排班' }}</h1>
        <span>维护您的执业资料和门诊安排。</span>
      </div>
      <div class="tabs">
        <button
          :class="{ active: activePanel === 'profile' }"
          type="button"
          @click="activePanel = 'profile'"
        >
          个人简历</button
        ><button
          :class="{ active: activePanel === 'schedules' }"
          type="button"
          @click="activePanel = 'schedules'"
        >
          我的排班
        </button>
      </div>
    </div>
    <div v-if="loading" class="state">正在加载信息…</div>
    <template v-else-if="isAdmin">
      <div class="notice info"><CircleAlert :size="16" />管理员可以浏览医生端页面；医生资料和排班请在管理工作台中维护。</div>
      <RouterLink class="back-link" to="/admin/home">返回管理工作台</RouterLink>
    </template>
    <template v-else>
      <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />{{ errorMessage }}
      </div>
      <section v-if="activePanel === 'profile'" class="card">
        <div class="card-heading">
          <div>
            <p>资料信息</p>
            <h2>个人简历</h2>
          </div>
          <span class="chip">{{ profile?.status === 1 ? '正常执业' : '暂停执业' }}</span>
        </div>
        <form class="form-grid" @submit.prevent="saveProfile">
          <label>姓名<input v-model="form.real_name" required maxlength="50" /></label
          ><label
            >职称<input v-model="form.title" maxlength="50" placeholder="例如：主任医师" /></label
          ><label
            >擅长方向<input
              v-model="form.specialty"
              maxlength="500"
              placeholder="例如：心血管疾病" /></label
          ><label
            >头像地址<input v-model="form.avatar_url" maxlength="500" placeholder="可选" /></label
          ><label class="wide"
            >个人简介<textarea
              v-model="form.introduction"
              rows="5"
              placeholder="介绍您的专业经验和诊疗方向"
            ></textarea></label
          ><label
            >默认挂号费<input
              v-model.number="form.consultation_fee"
              type="number"
              min="0"
              step="0.01"
              required
          /></label>
          <div class="readonly">
            <span>医生工号</span><strong>{{ profile?.doctor_no }}</strong>
          </div>
          <button class="primary wide" type="submit" :disabled="saving">
            <Save :size="16" />{{ saving ? '保存中' : '保存个人简历' }}
          </button>
        </form>
      </section>
      <section v-else class="stack">
        <div class="card">
          <div class="card-heading">
            <div>
              <p>门诊安排</p>
              <h2>{{ editingScheduleId ? '修改排班' : '新增排班' }}</h2>
            </div>
            <button
              v-if="editingScheduleId"
              class="icon-button"
              type="button"
              title="取消编辑"
              @click="resetScheduleForm"
            >
              <X :size="17" />
            </button>
          </div>
          <form class="form-grid" @submit.prevent="saveSchedule">
            <label
              >科室<select v-model.number="scheduleForm.department_id" required>
                <option
                  v-for="department in departments"
                  :key="department.id"
                  :value="department.id"
                >
                  {{ department.name }}
                </option>
              </select></label
            ><label>日期<input v-model="scheduleForm.schedule_date" type="date" required /></label
            ><label
              >时段<select v-model.number="scheduleForm.period">
                <option :value="1">上午</option>
                <option :value="2">下午</option>
                <option :value="3">晚上</option>
              </select></label
            ><label>开始时间<input v-model="scheduleForm.start_time" type="time" required /></label
            ><label>结束时间<input v-model="scheduleForm.end_time" type="time" required /></label
            ><label
              >号源数<input
                v-model.number="scheduleForm.total_count"
                type="number"
                min="1"
                required /></label
            ><label
              >挂号费<input
                v-model.number="scheduleForm.fee"
                type="number"
                min="0"
                step="0.01"
                required /></label
            ><label class="wide"
              >备注<textarea
                v-model="scheduleForm.remark"
                rows="3"
                placeholder="可选"
              ></textarea></label
            ><button class="primary wide" type="submit" :disabled="saving">
              <Save :size="16" />{{
                saving ? '保存中' : editingScheduleId ? '保存修改' : '创建排班'
              }}
            </button>
          </form>
        </div>
        <div class="card">
          <div class="card-heading">
            <div>
              <p>已安排门诊</p>
              <h2>排班列表</h2>
            </div>
            <span class="chip">{{ visibleSchedules.length }} 条</span>
          </div>
          <div v-if="!visibleSchedules.length" class="state">还没有排班安排。</div>
          <div v-else class="schedule-list">
            <article v-for="schedule in visibleSchedules" :key="schedule.id" class="schedule-block">
              <div class="schedule-row">
                <div>
                  <strong>{{ schedule.schedule_date }}</strong
                  ><span
                    >{{ periodLabel(schedule.period) }} · {{ schedule.start_time.slice(0, 5) }}—{{
                      schedule.end_time.slice(0, 5)
                    }}
                    · {{ schedule.booked_count }}/{{ schedule.total_count }} 号源</span
                  >
                </div>
                <div class="row-actions">
                  <button
                    class="icon-button"
                    type="button"
                    title="时间段"
                    @click="openSlots(schedule.id)"
                  >
                    <CalendarDays :size="16" /></button
                  ><button
                    class="icon-button"
                    type="button"
                    title="编辑"
                    @click="editSchedule(schedule)"
                  >
                    <Pencil :size="16" /></button
                  ><button v-if="schedule.status === 1" class="icon-button warning" type="button" title="停诊" @click="stopSchedule(schedule.id)"><CircleAlert :size="16" /></button
                  ><button
                    class="icon-button danger"
                    type="button"
                    title="删除"
                    @click="removeSchedule(schedule.id)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              <div v-if="slotScheduleId === schedule.id" class="slot-panel">
                <div class="slot-add">
                  <input
                    v-model.number="slotForm.slot_no"
                    type="number"
                    min="1"
                    placeholder="序号"
                  /><input v-model="slotForm.start_time" type="time" /><input
                    v-model="slotForm.end_time"
                    type="time"
                  /><button class="small-button" type="button" @click="addSlot">
                    <Plus :size="15" />添加时间段
                  </button>
                </div>
                <div v-if="!(slots[schedule.id] || []).length" class="slot-empty">暂无时间段</div>
                <div v-for="slot in slots[schedule.id]" :key="slot.id" class="slot-row">
                  <template v-if="editingSlotId === slot.id"><input v-model.number="slotEditForm.slot_no" type="number" min="1"/><input v-model="slotEditForm.start_time" type="time"/><input v-model="slotEditForm.end_time" type="time"/><button class="small-button" type="button" @click="saveSlot(schedule.id)"><Save :size="14"/>保存</button><button class="small-button" type="button" @click="editingSlotId = null">取消</button></template><template v-else><span
                    >第 {{ slot.slot_no }} 号 · {{ slot.start_time.slice(0, 5) }}—{{
                      slot.end_time.slice(0, 5)
                    }}</span
                  ><button
                    class="status-button"
                    :class="{ off: slot.status !== 0, booked: slot.status === 1 }"
                    type="button"
                    :disabled="slot.status === 1"
                    :title="slot.status === 1 ? '已预约时间段不能手动停用' : '切换时间段状态'"
                    @click="toggleSlot(slot)"
                  >
                    {{ statusLabel(slot.status) }}
                  </button><button v-if="slot.status === 0" class="icon-button" type="button" title="编辑时间段" @click="editSlot(slot)"><Pencil :size="14"/></button><button v-if="slot.status === 0" class="icon-button danger" type="button" title="删除时间段" @click="removeSlot(schedule.id, slot.id)"><Trash2 :size="14"/></button></template>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </template>
  </WorkspaceLayout>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 26px;
}
.page-heading p,
.card-heading p {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}
.page-heading h1 {
  margin-top: 8px;
  font-size: 30px;
}
.page-heading span {
  display: block;
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
}
.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: #e8eef5;
  border-radius: 8px;
}
.tabs button {
  min-height: 36px;
  padding: 0 14px;
  color: #64748b;
  background: transparent;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.tabs button.active {
  color: #1e293b;
  background: #fff;
  box-shadow: 0 1px 3px #0f172a1a;
  font-weight: 650;
}
.stack {
  display: grid;
  gap: 18px;
}
.card {
  padding: 26px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  box-shadow: 0 1px 3px #0f172a0a;
}
.card-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.card-heading h2 {
  margin-top: 7px;
  font-size: 19px;
}
.chip {
  padding: 5px 9px;
  color: #2563eb;
  background: #eff6ff;
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}
.form-grid label {
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}
.form-grid input,
.form-grid textarea,
.form-grid select {
  width: 100%;
  min-height: 42px;
  padding: 0 11px;
  color: #1e293b;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
  font-size: 13px;
}
.form-grid textarea {
  padding-top: 10px;
  resize: vertical;
}
.wide {
  grid-column: 1/-1;
}
.readonly {
  min-height: 42px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #64748b;
  background: #f1f5f9;
  border-radius: 6px;
  font-size: 12px;
}
.readonly strong {
  color: #1e293b;
}
.primary {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #fff;
  background: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
}
.primary:disabled {
  opacity: 0.6;
  cursor: wait;
}
.schedule-list {
  display: grid;
  gap: 10px;
}
.schedule-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
}
.schedule-row {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.schedule-row strong,
.schedule-row span {
  display: block;
}
.schedule-row strong {
  font-size: 15px;
}
.schedule-row div span {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}
.row-actions {
  display: flex;
  gap: 5px;
}
.icon-button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: #64748b;
  background: #fff;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
  cursor: pointer;
}
.icon-button:hover {
  color: #2563eb;
  border-color: #93c5fd;
}
.icon-button.danger:hover {
  color: #b91c1c;
  border-color: #fca5a5;
}
.slot-panel {
  padding: 14px 16px;
  border-top: 1px solid #e2e8f0;
  background: #fff;
}
.slot-add {
  display: grid;
  grid-template-columns: 80px 1fr 1fr auto;
  gap: 8px;
}
.slot-add input {
  min-height: 34px;
  padding: 0 8px;
  border: 1px solid #dbe3ec;
  border-radius: 5px;
  font-size: 12px;
}
.small-button,
.status-button {
  min-height: 34px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid #dbe3ec;
  border-radius: 5px;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
}
.slot-row {
  padding-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
  font-size: 12px;
}
.status-button {
  color: #166534;
  background: #dcfce7;
  border-color: #bbf7d0;
}
.status-button.off {
  color: #64748b;
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.status-button.booked {
  color: #92400e;
  background: #fef3c7;
  border-color: #fde68a;
  cursor: not-allowed;
}
.status-button:disabled {
  opacity: 1;
}
.notice {
  margin-bottom: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 7px;
  font-size: 13px;
}
.notice.success {
  color: #166534;
  background: #dcfce7;
}
.notice.error {
  color: #b91c1c;
  background: #fee2e2;
}
.notice.info { color: #1e4f80; background: #e4f0fb; }
.back-link { color: #2563eb; font-size: 13px; font-weight: 650; text-decoration: none; }
.state,
.slot-empty {
  padding: 36px 20px;
  color: #64748b;
  text-align: center;
  font-size: 13px;
}
@media (max-width: 620px) {
  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .page-heading h1 {
    font-size: 26px;
  }
  .tabs {
    width: 100%;
  }
  .tabs button {
    flex: 1;
  }
  .card {
    padding: 18px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .wide {
    grid-column: auto;
  }
  .schedule-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }
  .row-actions {
    width: 100%;
  }
  .row-actions .icon-button {
    flex: 1;
  }
  .slot-add {
    grid-template-columns: 1fr 1fr;
  }
  .slot-add .small-button {
    grid-column: 1/-1;
  }
}
</style>
