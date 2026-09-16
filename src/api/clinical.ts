import { requestJson } from './http'
import type { AppointmentRecord, DiagnosisRecord, PrescriptionItem, PrescriptionRecord, VisitRecord } from '@/types/user'

export interface DoctorAppointmentUpdateRequest { patient_name: string; appointment_date: string; status?: number; queue_no: number; department_id: number; period: number; remark?: string }
export interface VisitUpdateRequest { chief_complaint?: string; present_illness?: string; medical_advice?: string }
export interface DiagnosisRequest { diagnosis_name: string; diagnosis_code?: string; diagnosis_type: number; remark?: string }
export interface PrescriptionItemRequest { drug_name: string; specification?: string; dosage: string; frequency: string; days: number; quantity: number; remark?: string }

export const getDoctorAppointments = () => requestJson<AppointmentRecord[]>('/api/doctor/appointments', { method: 'GET' })
export const getDoctorAppointmentsPage = (page = 1, page_size = 20, status?: number) => requestJson<{ page: number; page_size: number; total: number; items: AppointmentRecord[] }>(`/api/doctor/appointments/page?page=${page}&page_size=${page_size}${status === undefined ? '' : `&status=${status}`}`, { method: 'GET' })
export const getDoctorAppointment = (id: number) => requestJson<AppointmentRecord>(`/api/doctor/appointments/${id}`, { method: 'GET' })
export const updateDoctorAppointment = (id: number, payload: DoctorAppointmentUpdateRequest) => requestJson<AppointmentRecord>(`/api/doctor/appointments/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const startVisit = (id: number) => requestJson<VisitRecord>(`/api/doctor/appointments/${id}/start-visit`, { method: 'POST' })
export const completeVisit = (id: number) => requestJson<VisitRecord>(`/api/doctor/appointments/${id}/complete`, { method: 'POST' })
export const getDoctorVisits = () => requestJson<VisitRecord[]>('/api/doctor/visits', { method: 'GET' })
export const getPatientVisits = () => requestJson<VisitRecord[]>('/api/patient/visits', { method: 'GET' })
export const getDoctorVisit = (id: number) => requestJson<VisitRecord>(`/api/doctor/visits/${id}`, { method: 'GET' })
export const getPatientVisit = (id: number) => requestJson<VisitRecord>(`/api/patient/visits/${id}`, { method: 'GET' })
export const updateDoctorVisit = (id: number, payload: VisitUpdateRequest) => requestJson<VisitRecord>(`/api/doctor/visits/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const getDiagnoses = (visitId: number, role: 'doctor' | 'patient') => requestJson<DiagnosisRecord[]>(`/api/${role}/visits/${visitId}/diagnoses`, { method: 'GET' })
export const createDiagnosis = (visitId: number, payload: DiagnosisRequest) => requestJson<DiagnosisRecord>(`/api/doctor/visits/${visitId}/diagnoses`, { method: 'POST', body: JSON.stringify(payload) })
export const updateDiagnosis = (id: number, payload: DiagnosisRequest) => requestJson<DiagnosisRecord>(`/api/doctor/diagnoses/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deleteDiagnosis = (id: number) => requestJson<null>(`/api/doctor/diagnoses/${id}`, { method: 'DELETE' })
export const createPrescription = (visitId: number) => requestJson<PrescriptionRecord>('/api/doctor/prescriptions', { method: 'POST', body: JSON.stringify({ visit_id: visitId }) })
export const getDoctorPrescription = (id: number) => requestJson<PrescriptionRecord>(`/api/doctor/prescriptions/${id}`, { method: 'GET' })
export const getPatientPrescription = (id: number) => requestJson<PrescriptionRecord>(`/api/patient/prescriptions/${id}`, { method: 'GET' })
export const updatePrescriptionStatus = (id: number, status: number) => requestJson<PrescriptionRecord>(`/api/doctor/prescriptions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
export const addPrescriptionItem = (id: number, payload: PrescriptionItemRequest) => requestJson<PrescriptionItem>(`/api/doctor/prescriptions/${id}/items`, { method: 'POST', body: JSON.stringify(payload) })
export const updatePrescriptionItem = (id: number, payload: PrescriptionItemRequest) => requestJson<PrescriptionItem>(`/api/doctor/prescription-items/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
export const deletePrescriptionItem = (id: number) => requestJson<null>(`/api/doctor/prescription-items/${id}`, { method: 'DELETE' })
export const getDoctorPatients = (keyword?: string) => requestJson<Record<string, unknown>[]>(`/api/doctor/patients${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`, { method: 'GET' })
export const getDoctorPatient = (id: number) => requestJson<Record<string, unknown>>(`/api/doctor/patients/${id}`, { method: 'GET' })
export const getDoctorPatientHistory = (id: number) => requestJson<Record<string, unknown>>(`/api/doctor/patients/${id}/history`, { method: 'GET' })
export const getPatientPrescriptions = () => requestJson<Record<string, unknown>[]>('/api/patient/prescriptions', { method: 'GET' })
export const getPatientPrescriptionItems = (id: number) => requestJson<PrescriptionItem[]>(`/api/patient/prescriptions/${id}/items`, { method: 'GET' })
export const getPatientDiagnoses = (visitId?: number) => requestJson<DiagnosisRecord[]>(`/api/patient/diagnoses${visitId ? `?visit_id=${visitId}` : ''}`, { method: 'GET' })
