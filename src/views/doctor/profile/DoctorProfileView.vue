<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save, ShieldCheck } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorProfile, updateDoctorProfile } from '@/api/doctor'

/**
 * 医生个人资料页面
 *
 * 用于查询和修改医生的姓名、职称、擅长方向、简介、头像及默认挂号费。
 * 医生工号等身份字段由后台维护，不在该页面修改。
 */
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const profile = ref<{
  department_name?: string | null
  doctor_no: string
  status: number
} | null>(null)

// 医生可编辑资料表单。
const form = reactive({
  real_name: '',
  title: '',
  specialty: '',
  introduction: '',
  avatar_url: '',
  consultation_fee: 0,
})

// 加载当前登录医生的资料并回填表单。
onMounted(async () => {
  try {
    const profileData = await getDoctorProfile()
    profile.value = profileData

    Object.assign(form, {
      real_name: profileData.real_name,
      title: profileData.title || '',
      specialty: profileData.specialty || '',
      introduction: profileData.introduction || '',
      avatar_url: profileData.avatar_url || '',
      consultation_fee: Number(profileData.consultation_fee || 0),
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '个人资料加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})

// 保存医生资料，成功后保留当前表单内容供继续查看。
const save = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await updateDoctorProfile(form)
    notice.value = '个人资料已保存'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/doctor/home"
      >
        <ArrowLeft :size="16" />
        返回医生首页
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>执业资料</p>
          <h1>个人资料</h1>
          <span>维护姓名、职称、专业方向、简介和默认挂号费。</span>
        </div>
      </header>

      <div
        v-if="loading"
        class="portal-state"
      >
        正在加载资料…
      </div>
      <template v-else>
        <section
          v-if="profile"
          class="portal-summary"
        >
          <div>
            <span>医生工号</span>
            <strong>{{ profile.doctor_no }}</strong>
          </div>
          <div>
            <span>所属科室</span>
            <strong>{{ profile.department_name || '未分配' }}</strong>
          </div>
          <div>
            <span>执业状态</span>
            <strong>{{ profile.status === 1 ? '正常执业' : '暂停执业' }}</strong>
          </div>
          <div>
            <span>账号资料</span>
            <strong>由医院统一维护</strong>
          </div>
        </section>

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

        <section class="portal-card profile-card">
          <div class="portal-card-heading">
            <div>
              <p>可编辑资料</p>
              <h2>个人简历</h2>
            </div>
            <span class="portal-chip">
              <ShieldCheck :size="13" />
              医院审核资料
            </span>
          </div>
          <form
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
          <label class="portal-wide">
            个人简介
            <textarea
              v-model="form.introduction"
              rows="5"
            ></textarea>
          </label>
          <label class="portal-wide">
            头像地址
            <input v-model="form.avatar_url" />
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
        </section>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.profile-card {
  margin-top: 16px;
}
</style>
