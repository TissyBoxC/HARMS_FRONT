<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  Check,
  CircleAlert,
  ClipboardList,
  FilePlus2,
  Play,
  Save,
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  completeVisit,
  createPrescription,
  getDoctorAppointment,
  getDoctorVisits,
  startVisit,
  updateDoctorVisit,
} from '@/api/clinical'
import { checkInAppointment } from '@/api/registration'
import type { AppointmentRecord, VisitRecord } from '@/types/user'

const route = useRoute()
const router = useRouter()
const appointmentId = Number(route.params.id)
const appointment = ref<AppointmentRecord | null>(null)
const visit = ref<VisitRecord | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const savingVisit = ref(false)
const errorMessage = ref('')
const notice = ref('')

const visitForm = reactive({
  chief_complaint: '',
  present_illness: '',
  medical_advice: '',
})

const statusLabel = (status: number) =>
  ({
    1: '待支付',
    2: '待签到',
    3: '已签到',
    4: '就诊中',
    5: '已完成',
    6: '已取消',
    7: '医生停诊取消',
    8: '已过期',
    9: '已退款',
  })[status] || '处理中'

const statusClass = (status: number) =>
  status === 3 || status === 4
    ? 'table-status'
    : status === 2
      ? 'table-status warning'
      : 'table-status muted'

const fillVisitForm = (item: VisitRecord | null) => {
  Object.assign(visitForm, {
    chief_complaint: item?.chief_complaint || '',
    present_illness: item?.present_illness || '',
    medical_advice: item?.medical_advice || '',
  })
}

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [appointmentData, visitData] = await Promise.all([
      getDoctorAppointment(appointmentId),
      getDoctorVisits(),
    ])
    appointment.value = appointmentData
    visit.value =
      visitData.find((item) => item.appointment_id === appointmentData.id) || null
    fillVisitForm(visit.value)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者接诊信息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const runAction = async (type: 'check-in' | 'start' | 'complete') => {
  if (!appointment.value) {
    return
  }

  actionLoading.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    if (type === 'check-in') {
      await checkInAppointment(appointment.value.id)
      notice.value = '签到成功'
    } else if (type === 'start') {
      await startVisit(appointment.value.id)
      notice.value = '已开始就诊'
    } else {
      await completeVisit(appointment.value.id)
      notice.value = '就诊已完成'
    }

    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '操作失败，请稍后重试。'
  } finally {
    actionLoading.value = false
  }
}

const saveVisit = async () => {
  if (!visit.value) {
    return
  }

  savingVisit.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    visit.value = await updateDoctorVisit(visit.value.id, visitForm)
    fillVisitForm(visit.value)
    notice.value = '就诊记录已保存'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '就诊记录保存失败，请稍后重试。'
  } finally {
    savingVisit.value = false
  }
}

const createVisitPrescription = async () => {
  if (!visit.value) {
    return
  }

  actionLoading.value = true
  errorMessage.value = ''

  try {
    const prescription = await createPrescription(visit.value.id)
    await router.push(`/doctor/prescriptions/${prescription.id}`)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方创建失败，请稍后重试。'
  } finally {
    actionLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/doctor/workstation"
      >
        <ArrowLeft :size="16" />
        返回接诊工作台
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>门诊接诊</p>
          <h1>接诊处理</h1>
          <span>完成签到、开始就诊、填写就诊记录并创建处方。</span>
        </div>
      </header>

      <div
        v-if="notice"
        class="portal-notice success"
      >
        <Check :size="16" />
        {{ notice }}
      </div>
      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载接诊信息…
      </div>

      <template v-else-if="appointment">
        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>{{ appointment.patient_name || '患者' }} · 接诊信息</h2>
              <p>
                {{ appointment.appointment_date || '未填写日期' }} ·
                排队号 {{ appointment.queue_no || '—' }} ·
                <span :class="statusClass(appointment.status)">
                  {{ statusLabel(appointment.status) }}
                </span>
              </p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>科室</th>
                  <td>{{ appointment.department_name || '未填写' }}</td>
                  <th>联系电话</th>
                  <td>{{ appointment.patient_phone || '未填写' }}</td>
                </tr>
                <tr>
                  <th>预约编号</th>
                  <td>{{ appointment.appointment_no || '未填写' }}</td>
                  <th>挂号费</th>
                  <td>¥{{ Number(appointment.fee || 0).toFixed(2) }}</td>
                </tr>
                <tr>
                  <th>患者备注</th>
                  <td colspan="3">{{ appointment.remark || '无' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>就诊处理</h2>
              <p>按当前就诊状态完成下一步操作</p>
            </div>
          </div>
          <div class="action-bar">
            <button
              v-if="appointment.status === 2"
              class="portal-primary"
              type="button"
              :disabled="actionLoading"
              @click="runAction('check-in')"
            >
              <ClipboardList :size="16" />
              {{ actionLoading ? '处理中' : '签到' }}
            </button>
            <button
              v-if="appointment.status === 3"
              class="portal-primary"
              type="button"
              :disabled="actionLoading"
              @click="runAction('start')"
            >
              <Play :size="16" />
              {{ actionLoading ? '处理中' : '开始就诊' }}
            </button>
            <button
              v-if="appointment.status === 4"
              class="portal-primary"
              type="button"
              :disabled="actionLoading"
              @click="runAction('complete')"
            >
              <Check :size="16" />
              {{ actionLoading ? '处理中' : '完成就诊' }}
            </button>
            <button
              v-if="visit"
              class="portal-secondary"
              type="button"
              :disabled="actionLoading"
              @click="createVisitPrescription"
            >
              <FilePlus2 :size="16" />
              开处方
            </button>
          </div>

          <div
            v-if="appointment.status === 2"
            class="portal-notice info workflow-notice"
          >
            <CircleAlert :size="16" />
            患者尚未签到，签到后即可开始就诊。
          </div>
        </section>

        <section
          v-if="visit"
          class="table-section"
        >
          <div class="table-section-header">
            <div>
              <h2>就诊记录</h2>
              <p>记录主诉、现病史和医嘱，保存后可继续开处方。</p>
            </div>
          </div>
          <form
            class="portal-form visit-form"
            @submit.prevent="saveVisit"
          >
            <label class="portal-wide">
              主诉
              <textarea
                v-model="visitForm.chief_complaint"
                rows="3"
                maxlength="500"
                :disabled="visit.status === 3"
              ></textarea>
            </label>
            <label class="portal-wide">
              现病史
              <textarea
                v-model="visitForm.present_illness"
                rows="4"
                maxlength="1000"
                :disabled="visit.status === 3"
              ></textarea>
            </label>
            <label class="portal-wide">
              医嘱
              <textarea
                v-model="visitForm.medical_advice"
                rows="3"
                maxlength="1000"
                :disabled="visit.status === 3"
              ></textarea>
            </label>
            <button
              class="portal-primary"
              type="submit"
              :disabled="visit.status === 3 || savingVisit"
            >
              <Save :size="16" />
              {{ savingVisit ? '保存中' : '保存就诊记录' }}
            </button>
          </form>
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.action-bar {
  padding: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.workflow-notice {
  margin: 0 16px 16px;
}

.visit-form {
  padding: 18px;
}

.data-table [colspan='3'] {
  line-height: 1.7;
}
</style>
