<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createDepartment, deleteDepartment, getAdminDepartments } from '@/api/department'
import { getPublicDoctor } from '@/api/public-medical'
import {
  createAdminDoctor,
  createAdminPatient,
  createAdminSchedule,
  createAdminSlot,
  deleteAdminSlot,
  deleteAdminSchedule,
  getAdminSchedules,
  getAdminSchedule,
  getAdminUserRoles,
  getAdminUserPermissions,
  getAdminUsers,
  getAdminSlots,
  resetAdminUserPassword,
  setDepartmentManager,
  updateAdminSchedule,
  updateAdminSlotStatus,
  updateAdminUserStatus,
} from '@/api/admin'
import { stopAdminSchedule, updateAdminScheduleStatus } from '@/api/admin-extended'
import type { AdminUserSummary, Department, Schedule, ScheduleRequest, Slot } from '@/types/user'

type AccountRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'REGISTRATION' | 'PHARMACY'
type AccountFilter = 'all' | 'doctor' | 'patient' | 'registration' | 'pharmacy'
type AccountRecord = {
  userId: number
  username: string
  role: AccountRole
  permissions: string[]
  patientId: number | null
  doctorId: number | null
  status: number
}

const route = useRoute()
const router = useRouter()
const panel = computed(() => String(route.path).split('/').pop() || 'home')
const adminSubpanel = computed(() => {
  if (route.path.endsWith('/accounts') || route.path === '/admin/users') return 'accounts'
  if (route.path.endsWith('/create-patient')) return 'create-patient'
  if (route.path.endsWith('/create-doctor')) return 'create-doctor'
  if (route.path.endsWith('/permissions')) return 'permissions'
  if (route.path.endsWith('/departments/create')) return 'department-create'
  if (route.path.endsWith('/schedules/create')) return 'schedule-create'
  if (route.path.endsWith('/schedules/list')) return 'schedule-list'
  return panel.value
})
const departments = ref<Department[]>([])
const schedules = ref<Schedule[]>([])
const slots = ref<Record<number, Slot[]>>({})
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const accountErrorMessage = ref('')
const editingScheduleId = ref<number | null>(null)
const userAction = reactive({ userId: '', status: 1, password: '', manager: true })
const accountFilter = ref<AccountFilter>('all')
const accountRecords = ref<AccountRecord[]>([])
const permissionForm = reactive({ userId: '', role: 'DOCTOR' as AccountRole, departmentManager: false })
const departmentForm = reactive({
  parent_id: null as number | null,
  name: '',
  code: '',
  description: '',
  location: '',
  contact_phone: '',
  sort_no: 0,
  status: 1,
})
const patientForm = reactive({
  username: '',
  password: '',
  real_name: '',
  id_card: '',
  gender: 0,
  birthday: '',
  phone: '',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
})
const doctorForm = reactive({
  username: '',
  password: '',
  department_id: 0,
  doctor_no: '',
  real_name: '',
  title: '',
  specialty: '',
  introduction: '',
  avatar_url: '',
  consultation_fee: 0,
})
const scheduleForm = reactive<ScheduleRequest>({
  doctor_id: null,
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
const filteredAccounts = computed(() =>
  accountRecords.value.filter((account) => {
    if (accountFilter.value === 'doctor') return account.role === 'DOCTOR'
    if (accountFilter.value === 'patient') return account.role === 'PATIENT'
    if (accountFilter.value === 'registration') return account.role === 'REGISTRATION'
    if (accountFilter.value === 'pharmacy') return account.role === 'PHARMACY'
    return true
  }),
)
const permissionRows = computed(() => [
  { code: 'PATIENT_MANAGE', label: '患者资料管理', enabled: permissionForm.role === 'ADMIN' || selectedPermissions.value.includes('PATIENT_MANAGE') },
  { code: 'DOCTOR_MANAGE', label: '医生资料管理', enabled: permissionForm.role === 'ADMIN' || selectedPermissions.value.includes('DOCTOR_MANAGE') },
  { code: 'SCHEDULE_SELF_MANAGE', label: '本人排班管理', enabled: permissionForm.role === 'ADMIN' || selectedPermissions.value.includes('SCHEDULE_SELF_MANAGE') },
  { code: 'SCHEDULE_ALL_MANAGE', label: '全部排班管理', enabled: permissionForm.role === 'ADMIN' || selectedPermissions.value.includes('SCHEDULE_ALL_MANAGE') },
  { code: 'DEPARTMENT_MANAGE', label: '科室管理', enabled: permissionForm.role === 'ADMIN' || permissionForm.departmentManager || selectedPermissions.value.includes('DEPARTMENT_MANAGE') },
])
const selectedPermissions = computed(() => accountRecords.value.find((account) => account.userId === Number(permissionForm.userId))?.permissions || [])
const doctorAccounts = computed(() => accountRecords.value.filter((account) => account.role === 'DOCTOR' && account.doctorId))
const permissionLabel = (code: string) => ({
  PATIENT_MANAGE: '患者资料管理',
  DOCTOR_MANAGE: '医生资料管理',
  SCHEDULE_SELF_MANAGE: '本人排班管理',
  SCHEDULE_ALL_MANAGE: '全部排班管理',
  DEPARTMENT_MANAGE: '科室管理',
}[code] || code)
const accountRoleLabel = (role: AccountRole) => role === 'DOCTOR' ? '医生' : role === 'ADMIN' ? '管理员' : role === 'REGISTRATION' ? '挂号员' : role === 'PHARMACY' ? '药房人员' : '患者'
const clearMessage = () => {
  notice.value = ''
  errorMessage.value = ''
}
const showError = (error: unknown, fallback: string) => {
  errorMessage.value = error instanceof ApiError ? error.message : fallback
}
const slotStatusLabel = (status: number) =>
  status === 0 ? '可预约' : status === 1 ? '已预约' : '已锁定'
const roleFromCodes = (codes: string[], userType?: number): AccountRole => codes.includes('DOCTOR') ? 'DOCTOR' : codes.includes('ADMIN') ? 'ADMIN' : codes.includes('REGISTRATION') ? 'REGISTRATION' : codes.includes('PHARMACY') ? 'PHARMACY' : userType === 2 ? 'DOCTOR' : userType === 3 ? 'ADMIN' : userType === 4 ? 'REGISTRATION' : userType === 5 ? 'PHARMACY' : 'PATIENT'
const roleFromUser = (user: AdminUserSummary): AccountRole => roleFromCodes(user.role_codes, user.user_type)
const applyAccounts = (users: AdminUserSummary[]) => {
  accountRecords.value = users.map((user) => ({ userId: user.user_id, username: user.username, role: roleFromUser(user), permissions: user.permission_codes || [], patientId: user.patient_id, doctorId: user.doctor_id, status: user.status }))
}
const refreshAccounts = async () => {
  accountErrorMessage.value = ''
  try {
    applyAccounts(await getAdminUsers())
  } catch (error) {
    accountRecords.value = []
    accountErrorMessage.value = error instanceof ApiError && error.status === 404
      ? '账户列表暂时无法加载，请确认服务已提供账户查询功能后重试。'
      : error instanceof ApiError ? error.message : '账户列表暂时无法加载，请稍后重试。'
  }
}
const loadData = async () => {
  const shouldLoadAccounts = ['accounts', 'create-patient', 'create-doctor', 'permissions', 'schedule-create'].includes(adminSubpanel.value)
  const [departmentResult, scheduleResult, userResult] = await Promise.allSettled([
    getAdminDepartments(),
    getAdminSchedules(),
    shouldLoadAccounts ? getAdminUsers() : Promise.resolve<AdminUserSummary[]>([]),
  ])
  if (departmentResult.status === 'fulfilled') {
    departments.value = departmentResult.value
    if (!doctorForm.department_id) doctorForm.department_id = departmentResult.value[0]?.id || 0
    if (!scheduleForm.department_id) scheduleForm.department_id = departmentResult.value[0]?.id || 0
  } else {
    showError(departmentResult.reason, '科室信息加载失败，请稍后重试。')
  }
  if (scheduleResult.status === 'fulfilled') {
    schedules.value = scheduleResult.value
  } else if (!errorMessage.value) {
    showError(scheduleResult.reason, '排班信息加载失败，请稍后重试。')
  }
  if (!shouldLoadAccounts) {
    accountRecords.value = []
  } else if (userResult.status === 'fulfilled') {
    applyAccounts(userResult.value)
  } else {
    accountRecords.value = []
    accountErrorMessage.value = userResult.reason instanceof ApiError && userResult.reason.status === 404
      ? '账户列表暂时无法加载，请确认服务已提供账户查询功能后重试。'
      : userResult.reason instanceof ApiError ? userResult.reason.message : '账户列表暂时无法加载，请稍后重试。'
  }
  loading.value = false
}
const submitPatient = async () => {
  clearMessage()
  saving.value = true
  try {
    await createAdminPatient({ ...patientForm, birthday: patientForm.birthday || null })
    await refreshAccounts()
    notice.value = '患者账号已创建'
    Object.keys(patientForm).forEach(
      (key) => ((patientForm as Record<string, unknown>)[key] = key === 'gender' ? 0 : ''),
    )
  } catch (error) {
    showError(error, '患者账号创建失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const submitDoctor = async () => {
  clearMessage()
  saving.value = true
  try {
    await createAdminDoctor(doctorForm)
    await refreshAccounts()
    notice.value = '医生账号已创建'
    doctorForm.username = ''
    doctorForm.password = ''
    doctorForm.doctor_no = ''
    doctorForm.real_name = ''
  } catch (error) {
    showError(error, '医生账号创建失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const submitUserAction = async (action: 'status' | 'password' | 'manager') => {
  clearMessage()
  const id = Number(userAction.userId)
    if (!id) {
      errorMessage.value = '请输入正确的账号编号。'
      return
    }
    if (action === 'password' && !userAction.password.trim()) {
      errorMessage.value = '请输入新密码。'
      return
    }
  saving.value = true
  try {
    if (action === 'status') await updateAdminUserStatus(id, Number(userAction.status))
    if (action === 'password') await resetAdminUserPassword(id, userAction.password)
    if (action === 'manager') await setDepartmentManager(id, userAction.manager)
    await refreshAccounts()
    notice.value = '操作已完成'
    userAction.password = ''
  } catch (error) {
    showError(error, '操作失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const selectAccount = async (account: AccountRecord) => {
  permissionForm.userId = String(account.userId)
  permissionForm.role = account.role
  userAction.userId = String(account.userId)
  userAction.status = account.status
  try {
    const [roles, permissions] = await Promise.all([getAdminUserRoles(account.userId), getAdminUserPermissions(account.userId)])
    account.role = roleFromCodes(roles, account.role === 'DOCTOR' ? 2 : account.role === 'ADMIN' ? 3 : account.role === 'REGISTRATION' ? 4 : account.role === 'PHARMACY' ? 5 : 1)
    account.permissions = permissions
  } catch (error) {
    showError(error, '权限信息加载失败，请稍后重试。')
  }
  permissionForm.departmentManager = account.permissions.includes('DEPARTMENT_MANAGE')
}
const submitPermission = async () => {
  clearMessage()
  const id = Number(permissionForm.userId)
  if (!id) {
    errorMessage.value = '请输入正确的账号编号。'
    return
  }
  saving.value = true
  try {
    await setDepartmentManager(id, permissionForm.departmentManager)
    await refreshAccounts()
    notice.value = '权限已保存'
  } catch (error) {
    showError(error, '权限保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const submitDepartment = async () => {
  clearMessage()
  saving.value = true
  try {
    await createDepartment({ ...departmentForm, parent_id: departmentForm.parent_id || null })
    departments.value = await getAdminDepartments()
    notice.value = '科室已创建'
    Object.assign(departmentForm, {
      parent_id: null,
      name: '',
      code: '',
      description: '',
      location: '',
      contact_phone: '',
      sort_no: 0,
      status: 1,
    })
  } catch (error) {
    showError(error, '科室创建失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const removeDepartment = async (id: number) => {
  if (!window.confirm('确定删除这个科室吗？')) return
  clearMessage()
  try {
    await deleteDepartment(id)
    departments.value = departments.value.filter((item) => item.id !== id)
    notice.value = '科室已删除'
  } catch (error) {
    showError(error, '删除失败，该科室可能仍有关联医生或下级科室。')
  }
}
const submitSchedule = async () => {
  clearMessage()
  saving.value = true
  try {
    if (!scheduleForm.doctor_id) throw new Error('请填写医生编号。')
    if (editingScheduleId.value) await updateAdminSchedule(editingScheduleId.value, scheduleForm)
    else await createAdminSchedule(scheduleForm)
    schedules.value = await getAdminSchedules()
    notice.value = editingScheduleId.value ? '排班已更新' : '排班已创建'
    editingScheduleId.value = null
  } catch (error) {
    showError(error, error instanceof Error ? error.message : '排班保存失败，请稍后重试。')
  } finally {
    saving.value = false
  }
}
const syncScheduleDoctor = async () => {
  if (!scheduleForm.doctor_id) return
  try {
    const doctor = await getPublicDoctor(Number(scheduleForm.doctor_id))
    scheduleForm.department_id = doctor.department_id
  } catch (error) {
    showError(error, '医生所属科室加载失败，请手动选择科室。')
  }
}
const editSchedule = async (item: Schedule) => {
  await router.push({ path: '/admin/schedules/create', query: { edit: String(item.id) } })
}
const loadScheduleForEdit = async (id: number) => {
  clearMessage()
  editingScheduleId.value = id
  try {
    const detail = await getAdminSchedule(id)
    Object.assign(scheduleForm, { doctor_id: detail.doctor_id, department_id: detail.department_id, schedule_date: detail.schedule_date, period: detail.period, start_time: detail.start_time.slice(0, 5), end_time: detail.end_time.slice(0, 5), total_count: detail.total_count, fee: detail.fee, remark: detail.remark || '' })
  } catch (error) {
    editingScheduleId.value = null
    showError(error, '排班详情加载失败，请稍后重试。')
  }
}
const removeSchedule = async (id: number) => {
  if (!window.confirm('确定删除这条排班吗？')) return
  try {
    await deleteAdminSchedule(id)
    schedules.value = schedules.value.filter((item) => item.id !== id)
    notice.value = '排班已删除'
  } catch (error) {
    showError(error, '删除失败，请稍后重试。')
  }
}
const stopSchedule = async (id: number) => {
  if (!window.confirm('确定停止这场门诊吗？')) return
  try { await stopAdminSchedule(id); notice.value = '排班已停诊'; schedules.value = await getAdminSchedules() } catch (error) { showError(error, '停诊失败，请稍后重试。') }
}
const changeScheduleStatus = async (item: Schedule) => {
  try { await updateAdminScheduleStatus(item.id, item.status); notice.value = '排班状态已更新'; schedules.value = await getAdminSchedules() } catch (error) { showError(error, '排班状态更新失败，请稍后重试。') }
}
const openSlots = async (id: number) => {
  slotScheduleId.value = slotScheduleId.value === id ? null : id
  if (slotScheduleId.value && !slots.value[id]) {
    try {
      slots.value[id] = await getAdminSlots(id)
    } catch (error) {
      showError(error, '时间段加载失败，请稍后重试。')
    }
  }
}
const addSlot = async () => {
  if (!slotScheduleId.value) return
  try {
    const slot = await createAdminSlot(slotScheduleId.value, slotForm)
    slots.value[slotScheduleId.value] = [...(slots.value[slotScheduleId.value] || []), slot]
    slotForm.slot_no += 1
    notice.value = '时间段已添加'
  } catch (error) {
    showError(error, '时间段添加失败，请稍后重试。')
  }
}
const removeSlot = async (scheduleId: number, slotId: number) => {
  if (!window.confirm('确定删除这个时间段吗？')) return
  try { await deleteAdminSlot(slotId); slots.value[scheduleId] = (slots.value[scheduleId] || []).filter((slot) => slot.id !== slotId); notice.value = '时间段已删除' } catch (error) { showError(error, '时间段删除失败，请稍后重试。') }
}
const toggleSlot = async (slot: Slot) => {
  if (slot.status === 1) return
  try {
    const nextStatus = slot.status === 0 ? 2 : 0
    await updateAdminSlotStatus(slot.id, nextStatus)
    slot.status = nextStatus
  } catch (error) {
    showError(error, '状态更新失败，请稍后重试。')
  }
}
watch(adminSubpanel, (value, previousValue) => {
  if (value !== previousValue && ['accounts', 'create-patient', 'create-doctor', 'permissions', 'schedule-create'].includes(value)) {
    void refreshAccounts()
  }
})
watch(() => route.query.edit, (value) => {
  if (adminSubpanel.value === 'schedule-create' && value) void loadScheduleForEdit(Number(value))
})
onMounted(async () => {
  await loadData()
  const editId = Number(route.query.edit)
  if (adminSubpanel.value === 'schedule-create' && editId > 0) await loadScheduleForEdit(editId)
})
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page-heading">
      <div>
        <p>系统管理</p>
        <h1>
          {{
            adminSubpanel === 'home'
              ? '管理概览'
              : ['accounts', 'create-patient', 'create-doctor', 'permissions'].includes(adminSubpanel)
                ? '账号管理'
                : ['departments', 'department-create'].includes(adminSubpanel)
                  ? '科室管理'
                  : '排班管理'
          }}
        </h1>
        <span>集中维护账号、科室和门诊安排。</span>
      </div>
    </div>
    <div v-if="loading" class="state">正在加载信息…</div>
    <template v-else
      ><div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />{{ errorMessage }}
      </div>
      <section v-if="panel === 'home'" class="overview-grid">
        <article class="metric">
          <Users :size="20" /><strong>{{ departments.length }}</strong
          ><span>已配置科室</span>
        </article>
        <article class="metric">
          <Building2 :size="20" /><strong>{{ schedules.length }}</strong
          ><span>排班记录</span>
        </article>
        <article class="metric">
          <CalendarDays :size="20" /><strong>{{
            schedules.reduce((sum, item) => sum + item.total_count, 0)
          }}</strong
          ><span>总号源</span>
        </article>
      </section>
      <section v-if="['users', 'accounts', 'create-patient', 'create-doctor', 'permissions'].includes(adminSubpanel)" class="stack">
        <details v-if="adminSubpanel === 'accounts'" class="disclosure" open>
          <summary><span><small>账号总览</small><strong>筛选现有账户</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
            <div v-if="accountErrorMessage" class="notice error account-notice">
              <CircleAlert :size="16" />
              <span>{{ accountErrorMessage }}</span>
              <button class="secondary" type="button" @click="refreshAccounts">重新加载</button>
            </div>
            <div class="filter-tabs" aria-label="账户类型筛选">
              <button type="button" :class="{ active: accountFilter === 'all' }" @click="accountFilter = 'all'">全部账户</button>
              <button type="button" :class="{ active: accountFilter === 'doctor' }" @click="accountFilter = 'doctor'">医生</button>
              <button type="button" :class="{ active: accountFilter === 'patient' }" @click="accountFilter = 'patient'">患者</button>
              <button type="button" :class="{ active: accountFilter === 'registration' }" @click="accountFilter = 'registration'">挂号员</button>
              <button type="button" :class="{ active: accountFilter === 'pharmacy' }" @click="accountFilter = 'pharmacy'">药房</button>
            </div>
            <div v-if="filteredAccounts.length" class="account-list">
              <div v-for="account in filteredAccounts" :key="account.userId" class="account-row" @click="selectAccount(account)">
                <span class="account-avatar">{{ account.role === 'DOCTOR' ? '医' : account.role === 'ADMIN' ? '管' : account.role === 'REGISTRATION' ? '挂' : account.role === 'PHARMACY' ? '药' : '患' }}</span>
                <span><strong>{{ account.username }}</strong><small>账号编号 {{ account.userId }} · {{ accountRoleLabel(account.role) }} · {{ account.status === 1 ? '启用' : '停用' }}</small></span>
                <span class="permission-summary">{{ account.permissions.map(permissionLabel).join('、') || '暂无特别权限' }}</span>
                <span class="account-actions" @click.stop>
                  <RouterLink v-if="account.patientId" class="icon-button" :to="`/admin/patients/${account.patientId}/edit`" title="编辑患者资料"><Pencil :size="15" /></RouterLink>
                  <RouterLink v-if="account.doctorId" class="icon-button" :to="`/admin/doctors/${account.doctorId}/edit`" title="编辑医生资料"><Pencil :size="15" /></RouterLink>
                </span>
              </div>
            </div>
            <div v-else-if="!accountErrorMessage" class="empty">暂无可展示的账户。新建账户后，会出现在这里供筛选和权限维护。</div>
          </div>
        </details>
        <details v-if="adminSubpanel === 'create-patient'" class="disclosure" open>
          <summary><span><small>新建账号</small><strong>患者账号</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
          <form class="form-grid" @submit.prevent="submitPatient">
            <label>用户名<input v-model="patientForm.username" required /></label
            ><label>初始密码<input v-model="patientForm.password" type="password" required /></label
            ><label>姓名<input v-model="patientForm.real_name" required /></label
            ><label>身份证号<input v-model="patientForm.id_card" required /></label
            ><label
              >性别<select v-model.number="patientForm.gender">
                <option :value="0">未说明</option>
                <option :value="1">男</option>
                <option :value="2">女</option>
              </select></label
            ><label>出生日期<input v-model="patientForm.birthday" type="date" /></label
            ><label>联系电话<input v-model="patientForm.phone" required /></label
            ><label>联系地址<input v-model="patientForm.address" /></label
            ><label>紧急联系人<input v-model="patientForm.emergency_contact" /></label
            ><label>紧急电话<input v-model="patientForm.emergency_phone" /></label
            ><button class="primary wide" type="submit" :disabled="saving">
              <Plus :size="16" />创建患者账号
            </button>
          </form>
          </div>
        </details>
        <details v-if="adminSubpanel === 'create-doctor'" class="disclosure" open>
          <summary><span><small>新建账号</small><strong>医生账号</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
          <form class="form-grid" @submit.prevent="submitDoctor">
            <label>用户名<input v-model="doctorForm.username" required /></label
            ><label>初始密码<input v-model="doctorForm.password" type="password" required /></label
            ><label>姓名<input v-model="doctorForm.real_name" required /></label
            ><label>医生工号<input v-model="doctorForm.doctor_no" required /></label
            ><label
              >所属科室<select v-model.number="doctorForm.department_id" required>
                <option v-for="item in departments" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select></label
            ><label>职称<input v-model="doctorForm.title" /></label
            ><label>擅长方向<input v-model="doctorForm.specialty" /></label
            ><label
              >挂号费<input
                v-model.number="doctorForm.consultation_fee"
                type="number"
                min="0"
                step="0.01" /></label
            ><label class="wide"
              >个人简介<textarea v-model="doctorForm.introduction" rows="3"></textarea></label
            ><button class="primary wide" type="submit" :disabled="saving">
              <Plus :size="16" />创建医生账号
            </button>
          </form>
          </div>
        </details>
        <details v-if="adminSubpanel === 'permissions'" class="disclosure" open>
          <summary><span><small>账号维护</small><strong>状态与权限</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
          <div class="form-grid">
            <label
              >账号编号<input
                v-model="userAction.userId"
                inputmode="numeric"
                placeholder="请输入账号编号" /></label
            ><label
              >账号状态<select v-model.number="userAction.status">
                <option :value="1">启用</option>
                <option :value="0">停用</option>
              </select></label
            ><button class="secondary" type="button" @click="submitUserAction('status')">
              更新状态</button
            ><label
              >新密码<input
                v-model="userAction.password"
                type="password"
                placeholder="输入新密码" /></label
            ><button class="secondary" type="button" @click="submitUserAction('password')">
              重置密码</button
            >
          </div>
          <div class="permission-form">
            <div class="permission-heading"><ShieldCheck :size="17" /><strong>账户权限清单</strong></div>
            <label>权限对象类型<select v-model="permissionForm.role"><option value="PATIENT">患者</option><option value="DOCTOR">医生</option><option value="REGISTRATION">挂号员</option><option value="ADMIN">管理员</option></select></label>
            <label>权限账号编号<input v-model="permissionForm.userId" inputmode="numeric" placeholder="请输入账号编号" /></label>
            <label class="checkline"><input v-model="permissionForm.departmentManager" type="checkbox" />科室管理权限</label>
            <button class="secondary" type="button" @click="submitPermission"><Save :size="15" />保存权限</button>
            <div class="permission-list">
              <div v-for="permission in permissionRows" :key="permission.code" class="permission-row">
                <span><strong>{{ permission.label }}</strong><small>{{ permission.code }}</small></span>
                <input type="checkbox" :checked="permission.enabled" disabled />
              </div>
            </div>
            <p class="helper">请选择账户后查看其可用权限。</p>
          </div>
          </div>
        </details>
      </section>
      <section v-if="['departments', 'department-create'].includes(adminSubpanel)" class="stack">
        <details v-if="adminSubpanel === 'department-create'" class="disclosure" open>
          <summary><span><small>科室信息</small><strong>新增科室</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
            <form class="form-grid" @submit.prevent="submitDepartment">
              <label>上级科室编号<input v-model.number="departmentForm.parent_id" type="number" min="1" placeholder="没有上级科室可留空" /></label>
              <label>科室名称<input v-model="departmentForm.name" required maxlength="100" placeholder="例如：心内科" /></label>
              <label>科室编码<input v-model="departmentForm.code" required maxlength="50" placeholder="例如：CARDIOLOGY" /></label>
              <label>所在位置<input v-model="departmentForm.location" maxlength="255" placeholder="例如：门诊楼3层" /></label>
              <label>联系电话<input v-model="departmentForm.contact_phone" maxlength="20" placeholder="请输入科室电话" /></label>
              <label>排序号<input v-model.number="departmentForm.sort_no" type="number" min="0" required /></label>
              <label>状态<select v-model.number="departmentForm.status"><option :value="1">启用</option><option :value="0">停用</option></select></label>
              <label class="wide">科室介绍<textarea v-model="departmentForm.description" rows="4" maxlength="500" placeholder="填写科室服务方向和就诊提示"></textarea></label>
              <button class="primary wide" type="submit" :disabled="saving"><Plus :size="16" />{{ saving ? '创建中' : '创建科室' }}</button>
            </form>
          </div>
        </details>
        <details v-if="adminSubpanel === 'departments'" class="disclosure" open>
          <summary><span><small>科室信息</small><strong>查看科室</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
            <p class="helper">这里显示当前科室；新增科室请进入“新增科室”页面。</p>
          <div class="card-heading">
            <div>
              <p>科室列表</p>
              <h2>全部科室</h2>
            </div>
          </div>
          <div v-if="departments.length" class="list">
            <div v-for="item in departments" :key="item.id" class="list-row department-row">
              <div>
                <strong>{{ item.name }}</strong
                ><span>{{ item.code }} · {{ item.location || '未填写位置' }}</span>
              </div>
              <div class="row-actions">
                <RouterLink class="icon-button" :to="`/admin/departments/edit/${item.id}`" title="编辑科室"><Pencil :size="16" /></RouterLink>
                <button class="icon-button danger" type="button" title="删除科室" @click="removeDepartment(item.id)"><Trash2 :size="16" /></button>
              </div>
            </div>
          </div>
          <div v-else class="empty">暂无科室信息。</div>
          </div>
        </details>
      </section>
      <section v-if="['schedule-create', 'schedule-list'].includes(adminSubpanel)" class="stack">
        <details v-if="adminSubpanel === 'schedule-create'" class="disclosure" open>
          <summary><span><small>门诊安排</small><strong>{{ editingScheduleId ? '修改排班' : '新增排班' }}</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
          <div class="card-heading">
            <div>
              <p>门诊安排</p>
              <h2>{{ editingScheduleId ? '修改排班' : '新增排班' }}</h2>
            </div>
          </div>
          <form class="form-grid" @submit.prevent="submitSchedule">
            <label
              >医生<select v-model.number="scheduleForm.doctor_id" required @change="syncScheduleDoctor">
                <option :value="null" disabled>请选择医生</option>
                <option v-for="account in doctorAccounts" :key="account.doctorId" :value="account.doctorId">
                  {{ account.username }}（编号 {{ account.doctorId }}）
                </option>
              </select></label
            ><label
              >科室<select v-model.number="scheduleForm.department_id" required>
                <option v-for="item in departments" :key="item.id" :value="item.id">
                  {{ item.name }}
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
                step="0.01" /></label
            ><label class="wide"
              >备注<textarea v-model="scheduleForm.remark" rows="3"></textarea></label
            ><button class="primary wide" type="submit" :disabled="saving">
              <Save :size="16" />保存排班
            </button>
          </form>
          </div>
        </details>
        <details v-if="adminSubpanel === 'schedule-list'" class="disclosure" open>
          <summary><span><small>排班记录</small><strong>全部排班</strong></span><ChevronDown :size="18" /></summary>
          <div class="disclosure-body">
          <div class="card-heading">
            <div>
              <p>排班记录</p>
              <h2>全部排班</h2>
            </div>
          </div>
          <div v-if="schedules.length" class="list">
            <article v-for="item in schedules" :key="item.id" class="schedule-item">
              <div class="list-row">
                <div>
                  <strong>{{ item.schedule_date }}</strong
                  ><span
                    >{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }} ·
                    {{ item.booked_count }}/{{ item.total_count }} 号源</span
                  >
                </div>
                <div class="row-actions">
                  <button class="icon-button" type="button" @click="openSlots(item.id)">
                    <CalendarDays :size="16" /></button
                  ><button class="icon-button" type="button" @click="editSchedule(item)">
                    <Pencil :size="16" /></button
                  ><select class="schedule-status" v-model.number="item.status" title="排班状态" @change="changeScheduleStatus(item)">
                    <option :value="0">草稿</option><option :value="1">正常</option><option :value="2">停诊</option><option :value="3">已结束</option>
                  </select><button v-if="item.status === 1" class="icon-button warning" type="button" title="停诊" @click="stopSchedule(item.id)"><CircleAlert :size="16" /></button
                  ><button
                    class="icon-button danger"
                    type="button"
                    @click="removeSchedule(item.id)"
                  >
                    <Trash2 :size="16" />
                  </button>
                </div>
              </div>
              <div v-if="slotScheduleId === item.id" class="slot-panel">
                <div class="slot-add">
                  <input v-model.number="slotForm.slot_no" type="number" min="1" /><input
                    v-model="slotForm.start_time"
                    type="time"
                  /><input v-model="slotForm.end_time" type="time" /><button
                    class="secondary"
                    type="button"
                    @click="addSlot"
                  >
                    <Plus :size="15" />添加时间段
                  </button>
                </div>
                <div v-if="slots[item.id] && !slots[item.id].length" class="empty">暂无可用时间段。</div>
                <div v-for="slot in slots[item.id]" :key="slot.id" class="slot-row">
                  <span
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
                    {{ slotStatusLabel(slot.status) }}
                  </button><button v-if="slot.status === 0" class="slot-delete" type="button" title="删除时间段" @click="removeSlot(item.id, slot.id)"><Trash2 :size="14" /></button>
                </div>
              </div>
            </article>
          </div>
          <div v-else class="empty">暂无排班记录。</div>
          </div>
        </details>
      </section>
    </template>
  </WorkspaceLayout>
</template>

<style scoped>
.page-heading {
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
.stack {
  display: grid;
  gap: 18px;
}
.disclosure {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  box-shadow: 0 1px 3px #0f172a0a;
  overflow: hidden;
}
.disclosure summary {
  min-height: 70px;
  padding: 15px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1e293b;
  cursor: pointer;
  list-style: none;
}
.disclosure summary::-webkit-details-marker { display: none; }
.disclosure summary svg { color: #64748b; transition: transform .18s ease; }
.disclosure[open] summary svg { transform: rotate(180deg); }
.disclosure summary span { display: grid; gap: 4px; }
.disclosure summary small { color: #2563eb; font-size: 11px; font-weight: 700; }
.disclosure summary strong { font-size: 16px; }
.disclosure-body { padding: 0 22px 24px; }
.filter-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
.filter-tabs button { min-height: 34px; padding: 0 13px; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 12px; }
.filter-tabs button.active { color: #2563eb; background: #eff6ff; border-color: #bfdbfe; font-weight: 650; }
.account-list { display: grid; gap: 8px; }
.account-row { width: 100%; padding: 12px; display: grid; grid-template-columns: 36px minmax(140px, 1fr) minmax(160px, 1fr) auto; align-items: center; gap: 12px; color: #1e293b; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 7px; cursor: pointer; }
.account-row:hover { border-color: #93c5fd; background: #eff6ff; }
.account-avatar { width: 32px; height: 32px; display: grid; place-items: center; color: #2563eb; background: #dbeafe; border-radius: 50%; font-size: 12px; font-weight: 700; }
.account-row strong, .account-row small { display: block; }
.account-row small, .permission-summary, .helper, .empty { color: #64748b; font-size: 12px; }
.account-row small { margin-top: 4px; }
.permission-summary { text-align: right; }
.account-actions { display: inline-flex; gap: 6px; }
.permission-form { margin-top: 22px; padding-top: 20px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 18px; border-top: 1px solid #e2e8f0; }
.permission-heading, .permission-list, .permission-form .helper { grid-column: 1 / -1; }
.permission-heading { display: flex; align-items: center; gap: 7px; color: #1e293b; }
.permission-form label { display: grid; gap: 7px; color: #475569; font-size: 12px; font-weight: 600; }
.permission-form input:not([type='checkbox']), .permission-form select { min-height: 40px; padding: 0 10px; background: #f8fafc; border: 1px solid #dbe3ec; border-radius: 6px; }
.permission-list { display: grid; gap: 7px; }
.permission-row { min-height: 44px; padding: 8px 11px; display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.permission-row strong, .permission-row small { display: block; }
.permission-row small { margin-top: 3px; color: #94a3b8; font-size: 11px; }
.permission-row input { width: 16px; height: 16px; }
.empty { padding: 24px; text-align: center; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 7px; }
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.metric,
.card {
  padding: 26px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  box-shadow: 0 1px 3px #0f172a0a;
}
.metric {
  display: grid;
  gap: 12px;
  color: #2563eb;
}
.metric strong {
  color: #1e293b;
  font-size: 30px;
}
.metric span {
  color: #64748b;
  font-size: 12px;
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
.primary,
.secondary {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
}
.primary {
  color: #fff;
  background: #2563eb;
  border: 1px solid #2563eb;
}
.secondary {
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
}
.primary:disabled {
  opacity: 0.6;
}
.list {
  display: grid;
  gap: 8px;
}
.list-row {
  padding: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}
.list-row strong,
.list-row span {
  display: block;
}
.list-row span {
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
.icon-button.danger:hover {
  color: #b91c1c;
  border-color: #fca5a5;
}
.icon-button.warning { color: #92400e; background: #fef3c7; border-color: #fde68a; }
.schedule-status { min-height: 34px; padding: 0 8px; color: #475569; background: #fff; border: 1px solid #dbe3ec; border-radius: 6px; font-size: 12px; }
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
.account-notice {
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
}
.account-notice .secondary {
  min-height: 32px;
  margin-left: auto;
}
.state {
  padding: 48px;
  color: #64748b;
  text-align: center;
}
.checkline {
  display: flex !important;
  align-items: center;
  grid-template-columns: none !important;
  gap: 8px;
}
.checkline input {
  width: 16px !important;
  min-height: 16px !important;
}
.schedule-item {
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  overflow: hidden;
}
.slot-panel {
  padding: 14px;
  border-top: 1px solid #e2e8f0;
}
.slot-add {
  display: grid;
  grid-template-columns: 80px 1fr 1fr auto;
  gap: 8px;
}
.slot-add input {
  min-height: 36px;
  padding: 0 8px;
  border: 1px solid #dbe3ec;
  border-radius: 5px;
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
  min-height: 32px;
  padding: 0 9px;
  color: #166534;
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
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
@media (max-width: 620px) {
  .overview-grid {
    grid-template-columns: 1fr;
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
  .list-row {
    align-items: flex-start;
    flex-direction: column;
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
  .slot-add .secondary {
    grid-column: 1/-1;
  }
  .disclosure summary { padding: 14px 16px; }
  .disclosure-body { padding: 0 16px 18px; }
  .account-row { grid-template-columns: 34px 1fr; }
  .permission-summary { grid-column: 2; text-align: left; }
  .account-actions { grid-column: 2; }
  .permission-form { grid-template-columns: 1fr; }
}
</style>
