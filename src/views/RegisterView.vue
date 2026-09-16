<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ContactRound,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  RotateCcw,
  UserRound,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { registerPatient } from '@/api/user'
import type { RegisterFormErrors, RegisterFormState, RegisterResult } from '@/types/user'
import { createRegisterPayload, validateRegisterForm } from '@/utils/register-validation'

const createInitialForm = (): RegisterFormState => ({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  idCard: '',
  gender: 0,
  birthdayYear: '',
  birthdayMonth: '',
  birthdayDay: '',
  phone: '',
  address: '',
  emergencyContact: '',
  emergencyPhone: '',
  agreement: false,
})

const form = reactive<RegisterFormState>(createInitialForm())
const errors = ref<RegisterFormErrors>({})
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const serverError = ref('')
const result = ref<RegisterResult | null>(null)

const passwordScore = computed(() => {
  if (!form.password) {
    return 0
  }

  return [
    form.password.length >= 8,
    /[A-Za-z]/.test(form.password),
    /\d/.test(form.password),
    /[^A-Za-z0-9]/.test(form.password),
  ].filter(Boolean).length
})

const passwordLevel = computed(
  () => ['待输入', '较弱', '一般', '良好', '很强'][passwordScore.value],
)

const birthdayError = computed(
  () => errors.value.birthdayYear || errors.value.birthdayMonth || errors.value.birthdayDay,
)

const focusFirstInvalidField = async () => {
  await nextTick()
  const firstField = Object.keys(errors.value)[0]

  if (firstField) {
    document.getElementById(firstField)?.focus()
  }
}

const handleSubmit = async () => {
  serverError.value = ''
  errors.value = validateRegisterForm(form)

  if (Object.keys(errors.value).length) {
    await focusFirstInvalidField()
    return
  }

  isSubmitting.value = true

  try {
    result.value = await registerPatient(createRegisterPayload(form))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    serverError.value = error instanceof ApiError ? error.message : '提交失败，请稍后重试。'
  } finally {
    isSubmitting.value = false
  }
}

const handleReset = () => {
  Object.assign(form, createInitialForm())
  errors.value = {}
  serverError.value = ''
  result.value = null
  showPassword.value = false
  showConfirmPassword.value = false
}
</script>

<template>
  <div class="register-page">
    <header class="page-heading">
      <RouterLink to="/">
        <ArrowLeft :size="17" :stroke-width="1.8" />
        返回首页
      </RouterLink>
      <h1>创建患者账号</h1>
      <p>请按有效证件填写信息，方便就诊时核验身份。</p>
    </header>

    <section class="register-panel" aria-labelledby="register-title">
      <div v-if="result" class="success-panel" role="status">
        <span class="success-icon"><CheckCircle2 :size="34" :stroke-width="1.5" /></span>
        <h2 id="register-title">注册成功</h2>
        <p class="success-copy">账号与患者档案已创建，请妥善保存用户名。</p>
        <dl class="result-list">
          <div>
            <dt>登录用户名</dt>
            <dd>{{ result.username }}</dd>
          </div>
          <div>
            <dt>用户编号</dt>
            <dd>{{ result.user_id }}</dd>
          </div>
          <div>
            <dt>患者编号</dt>
            <dd>{{ result.patient_id }}</dd>
          </div>
        </dl>
        <div class="success-actions">
          <RouterLink class="primary-link" to="/">返回首页</RouterLink>
          <button class="secondary-button" type="button" @click="handleReset">
            <RotateCcw :size="17" :stroke-width="1.8" />
            注册另一位患者
          </button>
        </div>
      </div>

      <form v-else novalidate @submit.prevent="handleSubmit">
        <header class="form-header">
          <div>
            <p>患者注册</p>
            <h2 id="register-title">填写患者信息</h2>
          </div>
          <p><span>*</span> 为必填项</p>
        </header>

        <section class="form-section" aria-labelledby="account-heading">
          <div class="section-heading">
            <span><KeyRound :size="18" :stroke-width="1.7" /></span>
            <div>
              <p>第一步</p>
              <h3 id="account-heading">设置账号</h3>
            </div>
          </div>

          <div class="field-grid">
            <div class="field field-wide">
              <label for="username">登录用户名 <span>*</span></label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                maxlength="50"
                autocomplete="username"
                placeholder="4-50 位字母、数字或下划线"
                :aria-invalid="Boolean(errors.username)"
                :aria-describedby="errors.username ? 'username-error' : undefined"
              />
              <p v-if="errors.username" id="username-error" class="field-error">
                {{ errors.username }}
              </p>
            </div>

            <div class="field">
              <label for="password">登录密码 <span>*</span></label>
              <div class="password-input">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  maxlength="64"
                  autocomplete="new-password"
                  placeholder="至少 8 个字符"
                  :aria-invalid="Boolean(errors.password)"
                  :aria-describedby="errors.password ? 'password-error' : 'password-strength'"
                />
                <button
                  type="button"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                  :title="showPassword ? '隐藏密码' : '显示密码'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" :size="18" :stroke-width="1.7" />
                  <Eye v-else :size="18" :stroke-width="1.7" />
                </button>
              </div>
              <div id="password-strength" class="password-strength">
                <span><i :style="{ width: `${passwordScore * 25}%` }"></i></span>
                <small>密码强度：{{ passwordLevel }}</small>
              </div>
              <p v-if="errors.password" id="password-error" class="field-error">
                {{ errors.password }}
              </p>
            </div>

            <div class="field">
              <label for="confirmPassword">确认密码 <span>*</span></label>
              <div class="password-input">
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="再次输入登录密码"
                  :aria-invalid="Boolean(errors.confirmPassword)"
                  :aria-describedby="errors.confirmPassword ? 'confirm-password-error' : undefined"
                />
                <button
                  type="button"
                  :aria-label="showConfirmPassword ? '隐藏确认密码' : '显示确认密码'"
                  :title="showConfirmPassword ? '隐藏确认密码' : '显示确认密码'"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <EyeOff v-if="showConfirmPassword" :size="18" :stroke-width="1.7" />
                  <Eye v-else :size="18" :stroke-width="1.7" />
                </button>
              </div>
              <p v-if="errors.confirmPassword" id="confirm-password-error" class="field-error">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>
        </section>

        <section class="form-section" aria-labelledby="identity-heading">
          <div class="section-heading">
            <span><UserRound :size="18" :stroke-width="1.7" /></span>
            <div>
              <p>第二步</p>
              <h3 id="identity-heading">填写身份信息</h3>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label for="realName">真实姓名 <span>*</span></label>
              <input
                id="realName"
                v-model="form.realName"
                type="text"
                maxlength="50"
                autocomplete="name"
                placeholder="请与身份证件保持一致"
                :aria-invalid="Boolean(errors.realName)"
                :aria-describedby="errors.realName ? 'real-name-error' : undefined"
              />
              <p v-if="errors.realName" id="real-name-error" class="field-error">
                {{ errors.realName }}
              </p>
            </div>

            <div class="field">
              <label for="idCard">身份证件号码 <span>*</span></label>
              <input
                id="idCard"
                v-model="form.idCard"
                type="text"
                maxlength="32"
                autocomplete="off"
                placeholder="请输入患者证件号码"
                :aria-invalid="Boolean(errors.idCard)"
                :aria-describedby="errors.idCard ? 'id-card-error' : undefined"
              />
              <p v-if="errors.idCard" id="id-card-error" class="field-error">
                {{ errors.idCard }}
              </p>
            </div>

            <fieldset class="field gender-field">
              <legend>性别</legend>
              <div class="segmented-control" :aria-invalid="Boolean(errors.gender)">
                <label :class="{ active: form.gender === 0 }">
                  <input v-model="form.gender" type="radio" :value="0" />
                  未说明
                </label>
                <label :class="{ active: form.gender === 1 }">
                  <input v-model="form.gender" type="radio" :value="1" />
                  男
                </label>
                <label :class="{ active: form.gender === 2 }">
                  <input v-model="form.gender" type="radio" :value="2" />
                  女
                </label>
              </div>
              <p v-if="errors.gender" class="field-error">{{ errors.gender }}</p>
            </fieldset>

            <div class="field birthday-field">
              <label id="birthday-label">出生日期</label>
              <div class="date-inputs" :class="{ invalid: birthdayError }">
                <div>
                  <input
                    id="birthdayYear"
                    v-model="form.birthdayYear"
                    type="text"
                    inputmode="numeric"
                    maxlength="4"
                    placeholder="YYYY"
                    aria-label="出生年份"
                    :aria-invalid="Boolean(birthdayError)"
                  />
                  <span>年</span>
                </div>
                <i></i>
                <div>
                  <input
                    id="birthdayMonth"
                    v-model="form.birthdayMonth"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="MM"
                    aria-label="出生月份"
                    :aria-invalid="Boolean(birthdayError)"
                  />
                  <span>月</span>
                </div>
                <i></i>
                <div>
                  <input
                    id="birthdayDay"
                    v-model="form.birthdayDay"
                    type="text"
                    inputmode="numeric"
                    maxlength="2"
                    placeholder="DD"
                    aria-label="出生日期"
                    :aria-invalid="Boolean(birthdayError)"
                  />
                  <span>日</span>
                </div>
              </div>
              <p v-if="birthdayError" class="field-error">{{ birthdayError }}</p>
            </div>
          </div>
        </section>

        <section class="form-section" aria-labelledby="contact-heading">
          <div class="section-heading">
            <span><ContactRound :size="18" :stroke-width="1.7" /></span>
            <div>
              <p>第三步</p>
              <h3 id="contact-heading">填写联系信息</h3>
            </div>
          </div>

          <div class="field-grid">
            <div class="field">
              <label for="phone">联系电话 <span>*</span></label>
              <input
                id="phone"
                v-model="form.phone"
                type="tel"
                maxlength="20"
                autocomplete="tel"
                placeholder="请输入常用联系电话"
                :aria-invalid="Boolean(errors.phone)"
                :aria-describedby="errors.phone ? 'phone-error' : undefined"
              />
              <p v-if="errors.phone" id="phone-error" class="field-error">
                {{ errors.phone }}
              </p>
            </div>

            <div class="field">
              <label for="address">联系地址</label>
              <input
                id="address"
                v-model="form.address"
                type="text"
                maxlength="255"
                autocomplete="street-address"
                placeholder="选填"
                :aria-invalid="Boolean(errors.address)"
                :aria-describedby="errors.address ? 'address-error' : undefined"
              />
              <p v-if="errors.address" id="address-error" class="field-error">
                {{ errors.address }}
              </p>
            </div>

            <div class="field">
              <label for="emergencyContact">紧急联系人</label>
              <input
                id="emergencyContact"
                v-model="form.emergencyContact"
                type="text"
                maxlength="50"
                placeholder="选填"
                :aria-invalid="Boolean(errors.emergencyContact)"
                :aria-describedby="errors.emergencyContact ? 'emergency-contact-error' : undefined"
              />
              <p v-if="errors.emergencyContact" id="emergency-contact-error" class="field-error">
                {{ errors.emergencyContact }}
              </p>
            </div>

            <div class="field">
              <label for="emergencyPhone">紧急联系电话</label>
              <input
                id="emergencyPhone"
                v-model="form.emergencyPhone"
                type="tel"
                maxlength="20"
                placeholder="选填"
                :aria-invalid="Boolean(errors.emergencyPhone)"
                :aria-describedby="errors.emergencyPhone ? 'emergency-phone-error' : undefined"
              />
              <p v-if="errors.emergencyPhone" id="emergency-phone-error" class="field-error">
                {{ errors.emergencyPhone }}
              </p>
            </div>
          </div>
        </section>

        <div class="form-actions">
          <label class="agreement" :class="{ invalid: errors.agreement }">
            <input id="agreement" v-model="form.agreement" type="checkbox" />
            <span></span>
            <p>我确认所填信息真实有效，并同意用于患者就诊建档。</p>
          </label>
          <p v-if="errors.agreement" class="field-error agreement-error">
            {{ errors.agreement }}
          </p>

          <div v-if="serverError" class="server-error" role="alert">
            <AlertCircle :size="19" :stroke-width="1.8" />
            <p>{{ serverError }}</p>
          </div>

          <button class="submit-button" type="submit" :disabled="isSubmitting">
            <LoaderCircle v-if="isSubmitting" class="spin" :size="19" :stroke-width="1.8" />
            <span>{{ isSubmitting ? '正在提交' : '完成注册' }}</span>
            <ArrowRight v-if="!isSubmitting" :size="19" :stroke-width="1.8" />
          </button>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.register-page {
  width: min(100% - 48px, 1120px);
  margin: 0 auto;
  padding: 52px 0 76px;
}

.page-heading {
  margin-bottom: 30px;
}

.page-heading > a {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  text-decoration: none;
}

.page-heading > a:hover {
  color: var(--primary);
}

.page-heading h1 {
  margin-top: 28px;
  font-family: var(--font-serif);
  font-size: 46px;
  font-weight: 500;
}

.page-heading > p {
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
}

.register-panel {
  padding: 54px 64px 62px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.form-header {
  padding-bottom: 30px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid var(--border-strong);
}

.form-header > div > p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 650;
}

.form-header h2,
.success-panel h2 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 500;
}

.form-header > p {
  color: var(--faint);
  font-size: 12px;
}

.form-header > p span,
.field label span {
  color: var(--danger);
}

.form-section {
  padding: 40px 0;
  display: grid;
  grid-template-columns: 156px 1fr;
  gap: 42px;
  border-bottom: 1px solid var(--border);
}

.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.section-heading > span {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 5px;
}

.section-heading p {
  color: var(--faint);
  font-size: 11px;
}

.section-heading h3 {
  margin-top: 4px;
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 600;
}

.field-grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px 24px;
}

.field {
  min-width: 0;
}

.field-wide {
  grid-column: 1 / -1;
}

.field label,
.field legend {
  display: block;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.field > input,
.password-input > input {
  width: 100%;
  height: 46px;
  padding: 0;
  color: var(--ink);
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--border-strong);
  border-radius: 0;
  font-family: var(--font-serif);
  font-size: 17px;
  transition: border-color 180ms ease;
}

.field input::placeholder {
  color: #adb4b0;
  font-family: var(--font-sans);
  font-size: 13px;
}

.field input:focus {
  border-color: var(--primary);
  outline: 0;
}

.field input[aria-invalid='true'] {
  border-color: var(--danger);
}

.field-error {
  margin-top: 8px;
  color: var(--danger);
  font-size: 11px;
  line-height: 1.5;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 42px;
}

.password-input button {
  position: absolute;
  right: 0;
  bottom: 1px;
  width: 40px;
  height: 44px;
  display: grid;
  place-items: center;
  color: var(--muted);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.password-strength {
  margin-top: 9px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.password-strength > span {
  width: 82px;
  height: 3px;
  background: var(--border);
  overflow: hidden;
}

.password-strength i {
  height: 100%;
  display: block;
  background: var(--primary);
  transition: width 180ms ease;
}

.password-strength small {
  color: var(--faint);
  font-size: 10px;
}

.gender-field {
  margin: 0;
  padding: 0;
  border: 0;
}

.segmented-control {
  height: 46px;
  padding: 3px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.segmented-control label {
  margin: 0;
  display: grid;
  place-items: center;
  color: var(--muted);
  border-radius: 4px;
  cursor: pointer;
}

.segmented-control label.active {
  color: var(--surface);
  background: var(--primary);
}

.segmented-control input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
}

.date-inputs {
  height: 46px;
  padding: 0 12px;
  display: grid;
  grid-template-columns: 1.5fr 1px 1fr 1px 1fr;
  align-items: center;
  gap: 10px;
  background: var(--canvas);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  transition: border-color 180ms ease;
}

.date-inputs:focus-within {
  border-color: var(--primary);
}

.date-inputs.invalid {
  border-color: var(--danger);
}

.date-inputs > div {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.date-inputs input {
  width: 100%;
  min-width: 0;
  padding: 0;
  color: var(--ink);
  background: transparent;
  border: 0;
  font-family: var(--font-serif);
  font-size: 16px;
  text-align: center;
  outline: 0;
}

.date-inputs input::placeholder {
  font-size: 12px;
}

.date-inputs span {
  color: var(--faint);
  font-size: 11px;
}

.date-inputs > i {
  width: 1px;
  height: 18px;
  background: var(--border);
}

.form-actions {
  padding-top: 36px;
  padding-left: 198px;
}

.agreement {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  color: var(--muted);
  cursor: pointer;
}

.agreement input {
  position: absolute;
  opacity: 0;
}

.agreement > span {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: 3px;
}

.agreement input:checked + span {
  background: var(--primary);
  border-color: var(--primary);
}

.agreement input:checked + span::after {
  content: '';
  width: 8px;
  height: 4px;
  border-bottom: 2px solid white;
  border-left: 2px solid white;
  transform: translateY(-1px) rotate(-45deg);
}

.agreement p {
  font-size: 12px;
  line-height: 1.6;
}

.agreement.invalid > span {
  border-color: var(--danger);
}

.agreement-error {
  margin-left: 29px;
}

.server-error {
  margin-top: 22px;
  padding: 13px 15px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--danger);
  background: var(--danger-soft);
  border: 1px solid color-mix(in srgb, var(--danger) 18%, var(--border));
  border-radius: 5px;
}

.server-error svg {
  flex: 0 0 auto;
}

.server-error p {
  font-size: 12px;
  line-height: 1.6;
}

.submit-button,
.secondary-button,
.primary-link {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 5px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease;
}

.submit-button {
  width: 100%;
  margin-top: 24px;
  padding: 0 24px;
  color: var(--surface);
  background: var(--primary);
  border: 1px solid var(--primary);
}

.submit-button:hover:not(:disabled),
.primary-link:hover {
  background: var(--primary-hover);
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.spin {
  animation: spin 900ms linear infinite;
}

.success-panel {
  min-height: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.success-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 22px;
  display: grid;
  place-items: center;
  color: var(--success);
  background: var(--primary-soft);
  border-radius: 8px;
}

.success-copy {
  margin-top: 14px;
  color: var(--muted);
  font-size: 14px;
}

.result-list {
  width: min(100%, 520px);
  margin: 36px 0 0;
  border-top: 1px solid var(--border-strong);
}

.result-list div {
  padding: 17px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid var(--border);
}

.result-list dt {
  color: var(--muted);
  font-size: 12px;
}

.result-list dd {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 18px;
}

.success-actions {
  margin-top: 34px;
  display: flex;
  gap: 12px;
}

.primary-link,
.secondary-button {
  padding: 0 20px;
}

.primary-link {
  color: var(--surface);
  background: var(--primary);
  border: 1px solid var(--primary);
}

.secondary-button {
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--primary);
}

.secondary-button:hover {
  color: var(--surface);
  background: var(--primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 860px) {
  .register-panel {
    padding: 46px 38px 52px;
  }

  .form-section {
    grid-template-columns: 132px 1fr;
    gap: 28px;
  }

  .form-actions {
    padding-left: 160px;
  }
}

@media (max-width: 680px) {
  .register-page {
    width: calc(100% - 28px);
    padding: 34px 0 48px;
  }

  .page-heading h1 {
    margin-top: 22px;
    font-size: 38px;
  }

  .register-panel {
    padding: 34px 24px 40px;
  }

  .form-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-section {
    padding: 32px 0;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    padding-left: 0;
  }

  .success-actions {
    width: 100%;
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
