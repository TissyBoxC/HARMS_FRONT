<script setup lang="ts">
/**
 * 医生患者详情页
 *
 * 使用紧凑数据表展示患者基本资料，以及预约、就诊、诊断和处方历史。
 */
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorPatient, getDoctorPatientHistory } from '@/api/clinical'
import type { DoctorPatientRecord, PatientHistoryRecord } from '@/types/user'

const route = useRoute()
const patient = ref<DoctorPatientRecord | null>(null)
const history = ref<PatientHistoryRecord | null>(null)
const loading = ref(true)
const errorMessage = ref('')

const genderLabel = (gender: number | null) =>
  gender === 1 ? '男' : gender === 2 ? '女' : '未填写'

const appointmentStatusLabel = (status: number) =>
  (({ 1: '待支付', 2: '已预约', 3: '已签到', 4: '就诊中', 5: '已完成', 6: '已取消', 7: '停诊取消', 8: '已过期', 9: '已退款' }) as Record<number, string>)[status] ||
  '处理中'

const visitStatusLabel = (status: number) =>
  (({ 1: '待就诊', 2: '就诊中', 3: '已完成' }) as Record<number, string>)[status] ||
  '处理中'

const prescriptionStatusLabel = (status: number) =>
  (({ 1: '草稿', 2: '已提交', 3: '已取药' }) as Record<number, string>)[status] ||
  '处理中'

const paymentStatusLabel = (status: number) =>
  (({ 1: '待支付', 2: '已支付', 3: '已退款' }) as Record<number, string>)[status] ||
  '处理中'

const load = async () => {
  try {
    const id = Number(route.params.id)
    const [patientData, historyData] = await Promise.all([
      getDoctorPatient(id),
      getDoctorPatientHistory(id),
    ])
    patient.value = patientData
    history.value = historyData
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者资料加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/doctor/patients"
      >
        <ArrowLeft :size="16" />
        返回我的患者
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>患者服务</p>
          <h1>{{ patient?.real_name || '患者详情' }}</h1>
          <span>查看患者基础资料和本医生处的完整就诊历史。</span>
        </div>
        <RouterLink
          v-if="patient"
          class="portal-secondary"
          :to="`/doctor/attachments?patient_id=${patient.id}`"
        >
          查看检查附件
        </RouterLink>
      </header>

      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载患者资料…
      </div>
      <div
        v-else-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <template v-else-if="patient && history">
        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>基本资料</h2>
              <p>患者身份和联系方式</p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>姓名</th>
                  <td>{{ patient.real_name }}</td>
                  <th>患者编号</th>
                  <td>{{ patient.id }}</td>
                </tr>
                <tr>
                  <th>性别</th>
                  <td>{{ genderLabel(patient.gender) }}</td>
                  <th>出生日期</th>
                  <td>{{ patient.birthday || '未填写' }}</td>
                </tr>
                <tr>
                  <th>联系电话</th>
                  <td>{{ patient.phone || '未填写' }}</td>
                  <th>身份证件</th>
                  <td>{{ patient.id_card || '未填写' }}</td>
                </tr>
                <tr>
                  <th>紧急联系人</th>
                  <td>{{ patient.emergency_contact || '未填写' }}</td>
                  <th>联系人电话</th>
                  <td>{{ patient.emergency_phone || '未填写' }}</td>
                </tr>
                <tr>
                  <th>联系地址</th>
                  <td colspan="3">{{ patient.address || '未填写' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>预约记录</h2>
              <p>共 {{ history.appointments.length }} 条</p>
            </div>
          </div>
          <div
            v-if="!history.appointments.length"
            class="table-empty"
          >
            暂无预约记录。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>预约编号</th>
                  <th>预约日期</th>
                  <th>科室</th>
                  <th>排队号</th>
                  <th>费用</th>
                  <th>状态</th>
                  <th>取消原因</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in history.appointments"
                  :key="item.id"
                >
                  <td>{{ item.appointment_no || item.id }}</td>
                  <td>{{ item.appointment_date || '未填写' }}</td>
                  <td>{{ item.department_name || '未填写' }}</td>
                  <td>{{ item.queue_no ?? '—' }}</td>
                  <td>¥{{ Number(item.fee || 0).toFixed(2) }}</td>
                  <td>{{ appointmentStatusLabel(item.status) }}</td>
                  <td>{{ item.cancel_reason || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>就诊记录</h2>
              <p>共 {{ history.visits.length }} 条</p>
            </div>
          </div>
          <div
            v-if="!history.visits.length"
            class="table-empty"
          >
            暂无就诊记录。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>就诊编号</th>
                  <th>关联预约</th>
                  <th>就诊时间</th>
                  <th>状态</th>
                  <th>主诉</th>
                  <th>现病史</th>
                  <th>医嘱</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in history.visits"
                  :key="item.id"
                >
                  <td>{{ item.visit_no }}</td>
                  <td>{{ item.appointment_no || '—' }}</td>
                  <td>{{ item.visit_start_at || '未开始' }}</td>
                  <td>{{ visitStatusLabel(item.status) }}</td>
                  <td class="text-cell">{{ item.chief_complaint || '未填写' }}</td>
                  <td class="text-cell">{{ item.present_illness || '未填写' }}</td>
                  <td class="text-cell">{{ item.medical_advice || '未填写' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>诊断记录</h2>
              <p>共 {{ history.diagnoses.length }} 条</p>
            </div>
          </div>
          <div
            v-if="!history.diagnoses.length"
            class="table-empty"
          >
            暂无诊断记录。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>诊断名称</th>
                  <th>疾病编码</th>
                  <th>诊断类型</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in history.diagnoses"
                  :key="item.id"
                >
                  <td>{{ item.diagnosis_name }}</td>
                  <td>{{ item.diagnosis_code || '—' }}</td>
                  <td>{{ item.diagnosis_type === 2 ? '确诊' : '初步诊断' }}</td>
                  <td class="text-cell">{{ item.remark || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>处方记录</h2>
              <p>共 {{ history.prescriptions.length }} 条</p>
            </div>
          </div>
          <div
            v-if="!history.prescriptions.length"
            class="table-empty"
          >
            暂无处方记录。
          </div>
          <div
            v-else
            class="table-scroll"
          >
            <table class="data-table">
              <thead>
                <tr>
                  <th>处方编号</th>
                  <th>处方状态</th>
                  <th>支付状态</th>
                  <th>处方金额</th>
                  <th>支付时间</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in history.prescriptions"
                  :key="item.id"
                >
                  <td>{{ item.prescription_no }}</td>
                  <td>{{ prescriptionStatusLabel(item.status) }}</td>
                  <td>{{ paymentStatusLabel(item.payment_status) }}</td>
                  <td>¥{{ Number(item.total_amount || 0).toFixed(2) }}</td>
                  <td>{{ item.paid_at || '未支付' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>
