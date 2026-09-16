import type { PatientRegisterRequest, RegisterFormErrors, RegisterFormState } from '@/types/user'

const USERNAME_PATTERN = /^[A-Za-z0-9_]+$/
const PHONE_PATTERN = /^[0-9+()\-\s]+$/

const optionalValue = (value: string) => {
  const normalized = value.trim()
  return normalized || null
}

const getLocalDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createBirthday = (form: RegisterFormState) => {
  const yearText = form.birthdayYear.trim()
  const monthText = form.birthdayMonth.trim()
  const dayText = form.birthdayDay.trim()

  if (!yearText && !monthText && !dayText) {
    return null
  }

  if (!yearText || !monthText || !dayText) {
    return ''
  }

  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day)
  const isValid =
    /^\d{4}$/.test(yearText) &&
    /^\d{1,2}$/.test(monthText) &&
    /^\d{1,2}$/.test(dayText) &&
    year >= 1900 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  if (!isValid) {
    return ''
  }

  return `${yearText}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export const validateRegisterForm = (form: RegisterFormState): RegisterFormErrors => {
  const errors: RegisterFormErrors = {}
  const username = form.username.trim()
  const realName = form.realName.trim()
  const idCard = form.idCard.trim()
  const phone = form.phone.trim()
  const birthday = createBirthday(form)

  if (username.length < 4 || username.length > 50) {
    errors.username = '用户名长度应为 4 至 50 个字符。'
  } else if (!USERNAME_PATTERN.test(username)) {
    errors.username = '用户名只能包含字母、数字和下划线。'
  }

  if (form.password.length < 8 || form.password.length > 64) {
    errors.password = '密码长度应为 8 至 64 个字符。'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码。'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致。'
  }

  if (!realName) {
    errors.realName = '请输入患者真实姓名。'
  } else if (realName.length > 50) {
    errors.realName = '真实姓名不能超过 50 个字符。'
  }

  if (!idCard) {
    errors.idCard = '请输入身份证件号码。'
  } else if (idCard.length > 32) {
    errors.idCard = '身份证件号码不能超过 32 个字符。'
  }

  if (![0, 1, 2].includes(form.gender)) {
    errors.gender = '请选择有效的性别信息。'
  }

  if (birthday === '') {
    errors.birthdayYear = '请填写有效的出生年月日。'
  } else if (birthday && birthday >= getLocalDate()) {
    errors.birthdayYear = '出生日期必须早于今天。'
  }

  if (!phone) {
    errors.phone = '请输入联系电话。'
  } else if (phone.length > 20 || !PHONE_PATTERN.test(phone)) {
    errors.phone = '请输入不超过 20 位的有效联系电话。'
  }

  if (form.address.trim().length > 255) {
    errors.address = '联系地址不能超过 255 个字符。'
  }

  if (form.emergencyContact.trim().length > 50) {
    errors.emergencyContact = '紧急联系人不能超过 50 个字符。'
  }

  if (form.emergencyPhone.trim().length > 20) {
    errors.emergencyPhone = '紧急联系电话不能超过 20 个字符。'
  }

  if (form.emergencyPhone && !PHONE_PATTERN.test(form.emergencyPhone.trim())) {
    errors.emergencyPhone = '请输入有效的紧急联系电话。'
  }

  if (!form.agreement) {
    errors.agreement = '请先确认信息真实性与隐私提示。'
  }

  return errors
}

export const createRegisterPayload = (form: RegisterFormState): PatientRegisterRequest => ({
  username: form.username.trim(),
  password: form.password,
  confirm_password: form.confirmPassword,
  real_name: form.realName.trim(),
  id_card: form.idCard.trim(),
  gender: form.gender,
  birthday: createBirthday(form),
  phone: form.phone.trim(),
  address: optionalValue(form.address),
  emergency_contact: optionalValue(form.emergencyContact),
  emergency_phone: optionalValue(form.emergencyPhone),
})
