<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  getDepartmentManagerDoctor,
  updateDepartmentManagerDoctor,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { DepartmentManagerDoctor } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const doctor = ref<DepartmentManagerDoctor | null>(null)
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const doctorId = Number(route.params.id)
const form = reactive({
  real_name: '',
  title: '',
  specialty: '',
  introduction: '',
  avatar_url: '',
  consultation_fee: 0,
  status: 1,
})

onMounted(async () => {
  try {
    const detail = await getDepartmentManagerDoctor(doctorId)
    doctor.value = detail
    Object.assign(form, {
      real_name: detail.real_name,
      title: detail.title || '',
      specialty: detail.specialty || '',
      introduction: detail.introduction || '',
      avatar_url: detail.avatar_url || '',
      consultation_fee: Number(detail.consultation_fee || 0),
      status: detail.status,
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '医生资料加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})

const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await updateDepartmentManagerDoctor(doctorId, form)
    notice.value = '医生资料已保存'
    setTimeout(() => router.replace('/department/doctors'), 500)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '医生资料保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/department/doctors"
      >
        <ArrowLeft :size="16" />
        返回科室医生
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>科室人员</p>
          <h1>编辑医生资料</h1>
          <span v-if="doctor">{{ doctor.department_name }} · {{ doctor.doctor_no }}</span>
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
        正在加载医生资料…
      </div>
      <form
        v-else
        class="portal-form"
        @submit.prevent="save"
      >
        <label>
          姓名
          <input
            v-model="form.real_name"
            required
          />
        </label>
        <label>
          职称
          <input v-model="form.title" />
        </label>
        <label>
          擅长方向
          <input v-model="form.specialty" />
        </label>
        <label>
          挂号费
          <input
            v-model.number="form.consultation_fee"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
        <label>
          在岗状态
          <select v-model.number="form.status">
            <option :value="1">在岗</option>
            <option :value="0">停诊</option>
          </select>
        </label>
        <label>
          头像地址
          <input v-model="form.avatar_url" />
        </label>
        <label class="portal-wide">
          个人简介
          <textarea
            v-model="form.introduction"
            rows="5"
          ></textarea>
        </label>
        <button
          class="portal-primary portal-wide"
          type="submit"
          :disabled="saving"
        >
          <Save :size="16" />
          {{ saving ? '保存中' : '保存资料' }}
        </button>
      </form>
    </div>
  </WorkspaceLayout>
</template>
