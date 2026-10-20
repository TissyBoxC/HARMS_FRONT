<script setup lang="ts">
/**
 * 检查附件页面
 *
 * 患者查看本人的检查附件；医生和管理员先选择患者，
 * 再查询该患者的上传记录，避免缺少患者范围时向接口发送无效请求。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { CircleAlert, FileText, Trash2, Upload } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  deleteMedicalAttachment,
  getMedicalAttachments,
  uploadMedicalAttachment,
} from '@/api/attachment'
import { getDoctorPatients } from '@/api/clinical'
import { getAdminUsersPage } from '@/api/admin-extended'
import { useAuth } from '@/stores/auth'
import type { DoctorPatientRecord, MedicalAttachment } from '@/types/user'

type PatientOption = {
  id: number
  real_name: string
  phone: string | null
}

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const layoutRole = computed<'doctor' | 'patient' | 'admin'>(() =>
  currentUser.value?.primary_role === 'DOCTOR'
    ? 'doctor'
    : currentUser.value?.primary_role === 'PATIENT'
      ? 'patient'
      : 'admin',
)
const isPatient = computed(() => layoutRole.value === 'patient')
const isDoctor = computed(() => layoutRole.value === 'doctor')
const items = ref<MedicalAttachment[]>([])
const patients = ref<PatientOption[]>([])
const selectedPatientId = ref(Number(route.query.patient_id) || currentUser.value?.patient_id || 0)
const selectedPatientName = ref('')
const loading = ref(false)
const loadingPatients = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const file = ref<File | null>(null)
const attachmentType = ref('MEDICAL_RECORD')
const description = ref('')

const selectedPatientLabel = computed(
  () => selectedPatientName.value || (selectedPatientId.value ? `患者 ${selectedPatientId.value}` : ''),
)

const loadAttachments = async () => {
  if (!selectedPatientId.value) {
    items.value = []
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    items.value = await getMedicalAttachments({ patient_id: selectedPatientId.value })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '附件加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// 医生只加载本人接诊过的患者；管理员加载患者类型账号。
const loadPatientOptions = async () => {
  loadingPatients.value = true
  errorMessage.value = ''

  try {
    if (isDoctor.value) {
      const result = await getDoctorPatients()
      patients.value = (result as DoctorPatientRecord[]).map((item) => ({
        id: item.id,
        real_name: item.real_name,
        phone: item.phone,
      }))
    } else {
      const result = await getAdminUsersPage({
        user_type: 1,
        page: 1,
        page_size: 100,
      })
      const rows = (result.items as Record<string, unknown>[]) || []
      patients.value = rows
        .filter((item) => Number(item.patient_id))
        .map((item) => ({
          id: Number(item.patient_id),
          real_name: String(item.display_name || item.username || '患者'),
          phone: null,
        }))
    }

    const selected = patients.value.find((item) => item.id === selectedPatientId.value)
    selectedPatientName.value = selected?.real_name || ''
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '患者列表加载失败，请稍后重试。'
  } finally {
    loadingPatients.value = false
  }
}

const handlePatientChange = async () => {
  const patient = patients.value.find((item) => item.id === selectedPatientId.value)
  selectedPatientName.value = patient?.real_name || ''
  const query = { ...route.query }

  if (selectedPatientId.value) {
    query.patient_id = String(selectedPatientId.value)
  } else {
    delete query.patient_id
  }

  await router.replace({ query })
  await loadAttachments()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
}

const upload = async () => {
  if (!file.value || !selectedPatientId.value) {
    return
  }

  saving.value = true
  errorMessage.value = ''
  notice.value = ''

  try {
    await uploadMedicalAttachment(
      file.value,
      selectedPatientId.value,
      undefined,
      attachmentType.value,
      description.value || undefined,
    )
    notice.value = '附件已上传'
    file.value = null
    description.value = ''
    await loadAttachments()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '附件上传失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

const remove = async (id: number) => {
  if (!window.confirm('确定删除这份附件吗？')) {
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await deleteMedicalAttachment(id)
    notice.value = '附件已删除'
    await loadAttachments()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '附件删除失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

watch(
  () => route.query.patient_id,
  (value) => {
    const id = Number(value)
    if (id && id !== selectedPatientId.value) {
      selectedPatientId.value = id
      selectedPatientName.value =
        patients.value.find((item) => item.id === id)?.real_name || ''
      void loadAttachments()
    }
  },
)

onMounted(async () => {
  if (isPatient.value) {
    await loadAttachments()
    return
  }

  await loadPatientOptions()

  if (selectedPatientId.value) {
    await loadAttachments()
  }
})
</script>

<template>
  <WorkspaceLayout :role="layoutRole">
    <div class="portal-page">
      <header class="portal-heading">
        <div>
          <p>医疗资料</p>
          <h1>检查附件</h1>
          <span>
            {{
              isPatient
                ? '查看和上传与本人相关的检查、检验和病历资料。'
                : '先选择患者，再查看、上传或删除该患者的检查附件。'
            }}
          </span>
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

      <section
        v-if="!isPatient"
        class="portal-card patient-picker"
      >
        <div class="portal-card-heading">
          <div>
            <p>患者范围</p>
            <h2>选择患者</h2>
          </div>
          <span
            v-if="selectedPatientId"
            class="portal-chip"
          >
            当前：{{ selectedPatientLabel }}
          </span>
        </div>
        <label class="patient-select">
          患者
          <select
            v-model.number="selectedPatientId"
            :disabled="loadingPatients"
            @change="handlePatientChange"
          >
            <option :value="0">
              {{
                loadingPatients
                  ? '正在加载患者…'
                  : patients.length
                    ? '请选择患者'
                    : '暂无可选患者'
              }}
            </option>
            <option
              v-for="patient in patients"
              :key="patient.id"
              :value="patient.id"
            >
              {{ patient.real_name }}{{ patient.phone ? ` · ${patient.phone}` : ` · 患者编号 ${patient.id}` }}
            </option>
          </select>
        </label>
      </section>

      <section
        v-if="isPatient || selectedPatientId"
        class="portal-card upload-card"
      >
        <div class="portal-card-heading">
          <div>
            <p>资料上传</p>
            <h2>上传检查附件</h2>
          </div>
        </div>
        <div class="upload-grid">
          <label>
            文件
            <input
              type="file"
              @change="handleFileChange"
            />
          </label>
          <label>
            资料类型
            <select v-model="attachmentType">
              <option value="MEDICAL_RECORD">病历资料</option>
              <option value="LAB_REPORT">检验报告</option>
              <option value="EXAMINATION">检查报告</option>
              <option value="OTHER">其他资料</option>
            </select>
          </label>
          <label class="wide">
            说明
            <input
              v-model="description"
              maxlength="255"
              placeholder="可填写检查项目或补充说明"
            />
          </label>
          <button
            class="portal-primary wide"
            type="button"
            :disabled="saving || !file || !selectedPatientId"
            @click="upload"
          >
            <Upload :size="16" />
            {{ saving ? '上传中' : '上传附件' }}
          </button>
        </div>
      </section>

      <section
        v-if="isPatient || selectedPatientId"
        class="portal-card attachment-card"
      >
        <div class="portal-card-heading">
          <div>
            <p>附件记录</p>
            <h2>{{ isPatient ? '我的附件' : `${selectedPatientLabel}的附件` }}</h2>
          </div>
          <span class="portal-chip">{{ items.length }} 份</span>
        </div>
        <div
          v-if="loading"
          class="portal-state"
        >
          正在加载附件…
        </div>
        <div
          v-else-if="!items.length"
          class="portal-state"
        >
          暂无附件记录。
        </div>
        <div
          v-else
          class="portal-list"
        >
          <article
            v-for="item in items"
            :key="item.id"
            class="portal-list-item"
          >
            <span class="portal-icon">
              <FileText :size="18" />
            </span>
            <div>
              <strong>{{ item.original_name }}</strong>
              <small>
                {{ item.attachment_type }} ·
                {{ formatFileSize(item.file_size) }} ·
                {{ item.created_at }}
              </small>
              <p v-if="item.description">{{ item.description }}</p>
            </div>
            <button
              class="portal-icon-button danger"
              type="button"
              :disabled="saving"
              title="删除附件"
              @click="remove(item.id)"
            >
              <Trash2 :size="15" />
            </button>
          </article>
        </div>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.patient-picker,
.upload-card {
  margin-bottom: 16px;
}

.patient-select {
  display: grid;
  gap: 7px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
}

.patient-select select {
  width: 100%;
  min-height: 42px;
  padding: 0 11px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.upload-grid label {
  display: grid;
  gap: 7px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
}

.upload-grid input,
.upload-grid select {
  min-height: 42px;
  padding: 0 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.upload-grid .wide {
  grid-column: 1 / -1;
}

.attachment-card .portal-list {
  margin-top: 2px;
}

@media (max-width: 680px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }

  .upload-grid .wide {
    grid-column: auto;
  }
}
</style>
