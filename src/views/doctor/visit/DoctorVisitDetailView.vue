<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  CircleAlert,
  FilePlus2,
  Pencil,
  Save,
  Stethoscope,
  Trash2,
} from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  createDiagnosis,
  createPrescription,
  deleteDiagnosis,
  getDiagnoses,
  getDoctorVisit,
  updateDiagnosis,
  updateDoctorVisit,
} from '@/api/clinical'
import type { DiagnosisRecord, VisitRecord } from '@/types/user'

const route = useRoute()
const router = useRouter()
const visitId = Number(route.params.id)
const visit = ref<VisitRecord | null>(null)
const diagnoses = ref<DiagnosisRecord[]>([])
const loading = ref(true)
const savingVisit = ref(false)
const savingDiagnosis = ref(false)
const creatingPrescription = ref(false)
const errorMessage = ref('')
const notice = ref('')
const editingDiagnosisId = ref(0)

const visitForm = reactive({
  chief_complaint: '',
  present_illness: '',
  medical_advice: '',
})

const diagnosisForm = reactive({
  diagnosis_name: '',
  diagnosis_code: '',
  diagnosis_type: 1,
  remark: '',
})

const statusLabel = (value: number) =>
  ({ 1: '待就诊', 2: '就诊中', 3: '已完成' })[value] || '处理中'

const statusClass = (value: number) =>
  value === 2 ? 'table-status warning' : value === 3 ? 'table-status muted' : 'table-status'

const visitEditable = computed(() => visit.value?.status !== 3)

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const [visitData, diagnosisData] = await Promise.all([
      getDoctorVisit(visitId),
      getDiagnoses(visitId, 'doctor'),
    ])
    visit.value = visitData
    diagnoses.value = diagnosisData
    Object.assign(visitForm, {
      chief_complaint: visitData.chief_complaint || '',
      present_illness: visitData.present_illness || '',
      medical_advice: visitData.medical_advice || '',
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '就诊详情加载失败，请稍后重试。'
  } finally {
    loading.value = false
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
    Object.assign(visitForm, {
      chief_complaint: visit.value.chief_complaint || '',
      present_illness: visit.value.present_illness || '',
      medical_advice: visit.value.medical_advice || '',
    })
    notice.value = '就诊记录已保存'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '就诊记录保存失败，请稍后重试。'
  } finally {
    savingVisit.value = false
  }
}

const resetDiagnosis = () => {
  editingDiagnosisId.value = 0
  Object.assign(diagnosisForm, {
    diagnosis_name: '',
    diagnosis_code: '',
    diagnosis_type: 1,
    remark: '',
  })
}

const editDiagnosis = (item: DiagnosisRecord) => {
  editingDiagnosisId.value = item.id
  Object.assign(diagnosisForm, {
    diagnosis_name: item.diagnosis_name,
    diagnosis_code: item.diagnosis_code || '',
    diagnosis_type: item.diagnosis_type,
    remark: item.remark || '',
  })
}

const saveDiagnosis = async () => {
  savingDiagnosis.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    if (editingDiagnosisId.value) {
      await updateDiagnosis(editingDiagnosisId.value, diagnosisForm)
      notice.value = '诊断已更新'
    } else {
      await createDiagnosis(visitId, diagnosisForm)
      notice.value = '诊断已添加'
    }

    resetDiagnosis()
    diagnoses.value = await getDiagnoses(visitId, 'doctor')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '诊断保存失败，请稍后重试。'
  } finally {
    savingDiagnosis.value = false
  }
}

const removeDiagnosis = async (id: number) => {
  if (!window.confirm('确定删除这条诊断吗？')) {
    return
  }

  try {
    await deleteDiagnosis(id)
    notice.value = '诊断已删除'
    diagnoses.value = await getDiagnoses(visitId, 'doctor')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '诊断删除失败，请稍后重试。'
  }
}

const openPrescriptionEditor = async () => {
  if (!visit.value) {
    return
  }

  creatingPrescription.value = true
  errorMessage.value = ''

  try {
    const prescription = await createPrescription(visit.value.id)
    await router.push(`/doctor/prescriptions/${prescription.id}`)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方创建失败，请稍后重试。'
  } finally {
    creatingPrescription.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/doctor/visits"
      >
        <ArrowLeft :size="16" />
        返回就诊记录
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>临床记录</p>
          <h1>就诊详情</h1>
          <span>维护就诊记录、诊断和处方。</span>
        </div>
      </header>

      <div
        v-if="notice"
        class="portal-notice success"
      >
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
        正在加载就诊详情…
      </div>

      <template v-else-if="visit">
        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>{{ visit.patient_name || '患者' }} · 就诊信息</h2>
              <p>{{ visit.visit_no }} · {{ statusLabel(visit.status) }}</p>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <tbody>
                <tr>
                  <th>就诊编号</th>
                  <td>{{ visit.visit_no }}</td>
                  <th>预约编号</th>
                  <td>{{ visit.appointment_no || '未填写' }}</td>
                </tr>
                <tr>
                  <th>签到时间</th>
                  <td>{{ visit.check_in_at || '未签到' }}</td>
                  <th>开始就诊</th>
                  <td>{{ visit.visit_start_at || '未开始' }}</td>
                </tr>
                <tr>
                  <th>就诊状态</th>
                  <td>
                    <span :class="statusClass(visit.status)">
                      {{ statusLabel(visit.status) }}
                    </span>
                  </td>
                  <th>结束就诊</th>
                  <td>{{ visit.visit_end_at || '未结束' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>就诊记录</h2>
              <p>主诉、现病史和医嘱</p>
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
                :disabled="!visitEditable"
              ></textarea>
            </label>
            <label class="portal-wide">
              现病史
              <textarea
                v-model="visitForm.present_illness"
                rows="4"
                maxlength="1000"
                :disabled="!visitEditable"
              ></textarea>
            </label>
            <label class="portal-wide">
              医嘱
              <textarea
                v-model="visitForm.medical_advice"
                rows="3"
                maxlength="1000"
                :disabled="!visitEditable"
              ></textarea>
            </label>
            <button
              class="portal-primary"
              type="submit"
              :disabled="!visitEditable || savingVisit"
            >
              <Save :size="16" />
              {{ savingVisit ? '保存中' : '保存就诊记录' }}
            </button>
          </form>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>诊断管理</h2>
              <p>共 {{ diagnoses.length }} 条诊断</p>
            </div>
            <RouterLink
              class="portal-secondary"
              :to="`/doctor/visits/${visitId}/diagnoses`"
            >
              <Stethoscope :size="16" />
              独立诊断页
            </RouterLink>
          </div>
          <form
            class="portal-form diagnosis-form"
            @submit.prevent="saveDiagnosis"
          >
            <label>
              诊断名称
              <input
                v-model="diagnosisForm.diagnosis_name"
                required
                maxlength="255"
              />
            </label>
            <label>
              疾病编码
              <input
                v-model="diagnosisForm.diagnosis_code"
                maxlength="50"
              />
            </label>
            <label>
              诊断类型
              <select v-model.number="diagnosisForm.diagnosis_type">
                <option :value="1">初步诊断</option>
                <option :value="2">确诊</option>
              </select>
            </label>
            <label>
              备注
              <input
                v-model="diagnosisForm.remark"
                maxlength="500"
              />
            </label>
            <div class="form-actions portal-wide">
              <button
                class="portal-primary"
                type="submit"
                :disabled="savingDiagnosis"
              >
                <Save :size="16" />
                {{ savingDiagnosis ? '保存中' : editingDiagnosisId ? '保存诊断' : '添加诊断' }}
              </button>
              <button
                v-if="editingDiagnosisId"
                class="portal-secondary"
                type="button"
                @click="resetDiagnosis"
              >
                取消编辑
              </button>
            </div>
          </form>
          <div
            v-if="!diagnoses.length"
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
                  <th>类型</th>
                  <th>疾病编码</th>
                  <th>备注</th>
                  <th class="compact-cell">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in diagnoses"
                  :key="item.id"
                >
                  <td>{{ item.diagnosis_name }}</td>
                  <td>{{ item.diagnosis_type === 2 ? '确诊' : '初步诊断' }}</td>
                  <td>{{ item.diagnosis_code || '未填写' }}</td>
                  <td>{{ item.remark || '无' }}</td>
                  <td class="compact-cell">
                    <div class="table-actions">
                      <button
                        class="table-action"
                        type="button"
                        title="编辑诊断"
                        @click="editDiagnosis(item)"
                      >
                        <Pencil :size="14" />
                        编辑
                      </button>
                      <button
                        class="table-action danger-action"
                        type="button"
                        title="删除诊断"
                        @click="removeDiagnosis(item.id)"
                      >
                        <Trash2 :size="14" />
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="table-section">
          <div class="table-section-header">
            <div>
              <h2>处方管理</h2>
              <p>创建处方后继续填写药品明细并提交。</p>
            </div>
            <button
              class="portal-primary"
              type="button"
              :disabled="creatingPrescription"
              @click="openPrescriptionEditor"
            >
              <FilePlus2 :size="16" />
              {{ creatingPrescription ? '正在创建' : '新建处方' }}
            </button>
          </div>
          <div class="prescription-tip">
            处方明细编辑在独立页面完成，保存后会回到当前就诊记录。
          </div>
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.visit-form,
.diagnosis-form {
  padding: 18px;
}

.form-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.data-table .table-section-header > svg {
  color: var(--primary);
}

.prescription-tip {
  padding: 18px;
  color: var(--muted);
  font-size: 13px;
}

.danger-action {
  color: var(--danger);
  background: var(--danger-soft);
}

@media (max-width: 720px) {
  .table-section-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
