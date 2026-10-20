/**
 * 业务类型定义
 *
 * 集中描述认证、账号、患者、医生、排班、预约、支付、就诊、
 * 诊断、处方和操作日志等接口使用的数据结构。
 */
export interface PatientRegisterRequest {
  username: string
  password: string
  confirm_password: string
  real_name: string
  id_card: string
  gender: number
  birthday: string | null
  phone: string
  address: string | null
  emergency_contact: string | null
  emergency_phone: string | null
}

export interface RegisterResult {
  user_id: number
  patient_id: number
  username: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResult {
  user_id: number
  username: string
  display_name: string | null
  user_type: number
  primary_role: string
  role_codes: string[]
  permission_codes?: string[]
  patient_id: number | null
  doctor_id: number | null
  department_id?: number | null
  redirect_path: string
  session_timeout_seconds: number
  long_time?: string
  login_time?: string
}

export interface RegisterFormState {
  username: string
  password: string
  confirmPassword: string
  realName: string
  idCard: string
  gender: number
  birthdayYear: string
  birthdayMonth: string
  birthdayDay: string
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  agreement: boolean
}

export type RegisterField = keyof RegisterFormState

export type RegisterFormErrors = Partial<Record<RegisterField, string>>

export interface Department {
  id: number
  parent_id: number | null
  name: string
  code: string
  description: string | null
  location: string | null
  contact_phone: string | null
  sort_no: number
  status: number
  created_at?: string
  updated_at?: string
}

export interface DoctorProfile {
  id: number
  user_id: number
  department_id: number
  department_name?: string | null
  doctor_no: string
  real_name: string
  title: string | null
  specialty: string | null
  introduction: string | null
  avatar_url: string | null
  consultation_fee: number
  status: number
}

export interface Schedule {
  id: number
  doctor_id: number
  department_id: number
  department_name?: string | null
  schedule_date: string
  period: number
  start_time: string
  end_time: string
  total_count: number
  booked_count: number
  fee: number
  status: number
  remark: string | null
}

export interface Slot {
  id: number
  schedule_id: number
  slot_no: number
  start_time: string
  end_time: string
  status: number
}

export interface DoctorProfileUpdateRequest {
  real_name: string
  title: string
  specialty: string
  introduction: string
  avatar_url: string
  consultation_fee: number
}

export interface ScheduleRequest {
  doctor_id?: number | null
  department_id: number
  schedule_date: string
  period: number
  start_time: string
  end_time: string
  total_count: number
  fee: number
  remark: string
}

export interface ScheduleRequestPayload {
  department_id: number
  schedule_date: string
  period: number
  start_time: string
  end_time: string
  total_count: number
  fee: number
  remark?: string
}

export interface ScheduleRequestRecord extends ScheduleRequestPayload {
  id: number
  doctor_id: number
  doctor_name?: string
  department_name?: string
  target_schedule_id?: number | null
  applied_schedule_id?: number | null
  request_type: number
  status: number
  review_remark?: string | null
  created_at?: string
  reviewed_at?: string | null
}

export interface SlotRequest {
  slot_no: number
  start_time: string
  end_time: string
}

export interface AdminCreatePatientRequest {
  username: string
  password: string
  real_name: string
  id_card: string
  gender: number
  birthday: string | null
  phone: string
  address: string
  emergency_contact: string
  emergency_phone: string
}

export interface AdminCreateDoctorRequest {
  username: string
  password: string
  department_id: number
  doctor_no: string
  real_name: string
  title: string
  specialty: string
  introduction: string
  avatar_url: string
  consultation_fee: number
}

export interface AdminCreateRegistrationRequest {
  username: string
  password: string
}

export interface AdminCreateAccountResult {
  user_id: number
  profile_id: number | null
  username: string
  role_code: string
}

export interface AdminUserSummary {
  user_id: number
  username: string
  user_type: number
  status: number
  display_name: string | null
  patient_id: number | null
  doctor_id: number | null
  role_codes: string[]
  permission_codes: string[]
  real_name?: string | null
  phone?: string | null
  address?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  department_id?: number | null
  department_name?: string | null
  doctor_no?: string | null
  title?: string | null
  specialty?: string | null
  introduction?: string | null
  avatar_url?: string | null
  consultation_fee?: number | null
}

export interface PatientProfile {
  id: number
  user_id: number
  real_name: string
  id_card: string
  gender: number
  birthday: string | null
  phone: string
  address: string | null
  emergency_contact: string | null
  emergency_phone: string | null
}

export interface PatientProfileUpdateRequest {
  real_name: string
  phone: string
  address: string
  emergency_contact: string
  emergency_phone: string
}

export interface PublicDoctor {
  id: number
  department_id: number
  department_name?: string | null
  doctor_no: string
  real_name: string
  title: string | null
  specialty: string | null
  introduction: string | null
  avatar_url: string | null
  consultation_fee: number
  status: number
}

export interface PublicSchedule {
  id: number
  doctor_id: number
  department_id: number
  doctor_name: string
  department_name?: string | null
  schedule_date: string
  period: number
  start_time: string
  end_time: string
  total_count: number
  booked_count: number
  remaining_count: number
  fee: number
  status: number
  remark: string | null
}

export interface PermissionCatalogItem {
  id: number
  permission_code: string
  permission_name: string
  type: number
}

export interface DirectPermissionRecord {
  permission_id: number
  permission_code: string
  permission_name: string
  type: number
  created_at: string
}

export interface DoctorPatientRecord {
  id: number
  user_id: number
  real_name: string
  gender: number | null
  birthday: string | null
  phone: string | null
  address?: string | null
  id_card?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
}

export interface PatientHistoryRecord {
  appointments: AppointmentRecord[]
  visits: VisitRecord[]
  diagnoses: DiagnosisRecord[]
  prescriptions: PrescriptionRecord[]
}

export interface MedicalAttachment {
  id: number
  patient_id: number
  visit_id: number | null
  uploader_user_id: number
  attachment_type: string
  original_name: string
  content_type: string | null
  file_size: number
  description: string | null
  created_at: string
}

export interface PublicSlot {
  id: number
  schedule_id: number
  slot_no: number
  start_time: string
  end_time: string
  status: number
}

export interface AppointmentRecord {
  id: number
  doctor_id: number | null
  appointment_no: string | null
  patient_id: number | null
  department_id: number | null
  schedule_id: number | null
  slot_id: number | null
  appointment_date: string | null
  period: number | null
  queue_no: number | null
  fee: number | null
  status: number
  remark: string | null
  cancel_reason: string | null
  cancelled_at: string | null
  created_at: string | null
  updated_at: string | null
  doctor_name?: string | null
  department_name?: string | null
  patient_name?: string | null
  patient_phone?: string | null
  patient_gender?: number | null
  patient_birthday?: string | null
  check_in_at?: string | null
}

export interface PaymentRecord {
  id: number
  payment_no: string
  appointment_id: number
  patient_id: number
  amount: number
  payment_method: number
  status: number
  third_party_no: string | null
  paid_at: string | null
}

export interface VisitRecord {
  id: number
  appointment_id: number
  patient_id: number
  doctor_id: number
  visit_no: string
  check_in_at: string | null
  visit_start_at: string | null
  visit_end_at: string | null
  chief_complaint: string | null
  present_illness: string | null
  medical_advice: string | null
  status: number
  patient_name?: string | null
  doctor_name?: string | null
  department_name?: string | null
  appointment_no?: string | null
}

export interface DiagnosisRecord {
  id: number
  visit_id: number
  diagnosis_name: string
  diagnosis_code: string | null
  diagnosis_type: number
  remark: string | null
}

export interface PrescriptionItem {
  id: number
  prescription_id: number
  medicine_id?: number | null
  drug_name: string
  specification: string | null
  dosage: string
  frequency: string
  days: number
  quantity: number
  unit_price: number
  amount: number
  remark: string | null
}

export interface Medicine {
  id: number
  medicine_code: string
  name: string
  specification: string | null
  unit: string
  unit_price: number
  stock_quantity: number
  warning_quantity: number
  manufacturer: string | null
  status: number
  remark: string | null
  low_stock: boolean
  stock_text: string
  created_at?: string | null
  updated_at?: string | null
}

export interface PrescriptionRecord {
  id: number
  visit_id: number
  prescription_no: string
  doctor_id: number
  status: number
  payment_status: number
  total_amount: number
  payment_no?: string | null
  paid_at?: string | null
  items: PrescriptionItem[]
}

export interface OperationLogRecord {
  id: number
  user_id: number
  operation_type: string
  target_type: string
  target_id: number
  description: string
  ip_address: string | null
  created_at: string
}

export interface AdminPatientUpdateRequest {
  real_name: string
  phone: string
  address: string
  emergency_contact: string
  emergency_phone: string
}

export interface AdminDoctorUpdateRequest {
  department_id: number
  real_name: string
  title: string
  specialty: string
  introduction: string
  avatar_url: string
  consultation_fee: number
}

export interface DepartmentManagerScope {
  department_ids: number[]
  departments: Department[]
}

export interface DepartmentManagerDoctor {
  id: number
  user_id: number
  department_id: number
  department_name: string
  doctor_no: string
  real_name: string
  title: string | null
  specialty: string | null
  introduction: string | null
  avatar_url: string | null
  consultation_fee: number
  status: number
  username: string
  account_status: number
}

export interface DepartmentManagerDoctorUpdateRequest {
  real_name: string
  title: string
  specialty: string
  introduction: string
  avatar_url: string
  consultation_fee: number
  status: number
}

export interface DepartmentManagerPatient {
  id: number
  user_id: number
  real_name: string
  gender: number | null
  birthday: string | null
  phone: string | null
  address: string | null
  emergency_contact: string | null
  emergency_phone: string | null
}

export interface DepartmentManagerPatientDetail extends DepartmentManagerPatient {
  id_card: string
  appointments: AppointmentRecord[]
  visits: VisitRecord[]
}
