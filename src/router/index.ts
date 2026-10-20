import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

/**
 * 前端路由表
 *
 * 按公共站点、患者服务、医生工作台、管理工作台、科室、挂号工作和药房工作台
 * 分块声明页面，并通过 meta 配置登录状态、角色和权限要求。
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 公共站点与认证页面。
    {
      path: '/',
      name: 'home',
      component: () => import('../views/common/home/HomeView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/common/auth/RegisterView.vue'),
    },
    {
      path: '/announcements',
      name: 'public-announcements',
      component: () => import('../views/common/announcement/PublicAnnouncementsView.vue'),
    },
    {
      path: '/announcements/:id',
      name: 'public-announcement-detail',
      component: () => import('../views/common/announcement/PublicAnnouncementDetailView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/common/auth/LoginView.vue'),
    },
    // 患者服务页面，管理员也可进入用于查看业务效果。
    {
      path: '/patient/home',
      name: 'patient-home',
      component: () => import('../views/patient/home/PatientHomeView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/profile',
      name: 'patient-profile',
      component: () => import('../views/patient/profile/PatientProfileView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/doctors',
      name: 'patient-doctors',
      component: () => import('../views/patient/doctor/PublicDoctorsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/departments/:id',
      name: 'patient-department-detail',
      component: () => import('../views/patient/department/PublicDepartmentDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/doctors/:id',
      name: 'patient-doctor-detail',
      component: () => import('../views/patient/doctor/PublicDoctorDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/schedules',
      name: 'patient-schedules',
      component: () => import('../views/patient/schedule/PublicSchedulesView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/schedules/:id',
      name: 'patient-schedule-detail',
      component: () => import('../views/patient/schedule/PublicScheduleDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/appointments',
      name: 'patient-appointments',
      component: () => import('../views/patient/appointment/PatientAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/appointments/:id',
      name: 'patient-appointment-detail',
      component: () => import('../views/patient/appointment/PatientAppointmentDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/visits',
      name: 'patient-visits',
      component: () => import('../views/patient/visit/PatientVisitsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/visits/:id',
      name: 'patient-visit-detail',
      component: () => import('../views/patient/visit/PatientVisitDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/prescriptions/:id',
      name: 'patient-prescription-detail',
      component: () => import('../views/patient/prescription/PatientPrescriptionView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/payments/:id',
      name: 'patient-payment-detail',
      component: () => import('../views/patient/payment/PatientPaymentView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/payments',
      name: 'patient-payments',
      component: () => import('../views/patient/payment/PatientPaymentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/prescriptions',
      name: 'patient-prescriptions',
      component: () => import('../views/patient/prescription/PatientPrescriptionsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/diagnoses',
      name: 'patient-diagnoses',
      component: () => import('../views/patient/diagnosis/PatientDiagnosesView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/attachments',
      name: 'patient-attachments',
      component: () => import('../views/common/attachment/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/notifications',
      name: 'system-notifications',
      component: () => import('../views/common/notification/SystemNotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    // 医生工作台页面。
    {
      path: '/doctor/home',
      name: 'doctor-home',
      component: () => import('../views/doctor/home/DoctorHomeView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/workstation',
      name: 'doctor-workstation',
      component: () => import('../views/doctor/workstation/DoctorWorkstationView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/workstation/:id',
      name: 'doctor-workstation-detail',
      component: () => import('../views/doctor/workstation/DoctorVisitWorkflowView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: () => import('../views/doctor/profile/DoctorProfileView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedules',
      name: 'doctor-schedules',
      component: () => import('../views/doctor/schedule/DoctorSchedulesView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedules/:id/slots',
      name: 'doctor-schedule-slots',
      component: () => import('../views/doctor/schedule/DoctorScheduleSlotsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedule-requests/create',
      name: 'doctor-schedule-request-create',
      component: () => import('../views/doctor/schedule/DoctorScheduleRequestView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedule-requests/review',
      name: 'doctor-schedule-request-review',
      component: () => import('../views/department/schedule/ScheduleApprovalView.vue'),
      meta: {
        requiresAuth: true,
        role: ['DOCTOR', 'ADMIN'],
        permission: ['SCHEDULE_REQUEST_REVIEW', 'DEPARTMENT_MANAGE'],
      },
    },
    // 管理工作台页面。
    {
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('../views/admin/home/AdminHomeView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/admin/user/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/doctors',
      name: 'admin-doctors',
      component: () => import('../views/admin/doctor/AdminDoctorsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/patients',
      name: 'admin-patients',
      component: () => import('../views/admin/patient/AdminPatientsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/accounts',
      name: 'admin-user-accounts',
      component: () => import('../views/admin/user/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/:id',
      name: 'admin-user-detail',
      component: () => import('../views/admin/user/AdminUserDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-patient',
      name: 'admin-create-patient',
      component: () => import('../views/admin/user/AdminPatientCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-doctor',
      name: 'admin-create-doctor',
      component: () => import('../views/admin/user/AdminDoctorCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-registration',
      name: 'admin-create-registration',
      component: () => import('../views/admin/user/RegistrationAccountCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-pharmacy',
      name: 'admin-create-pharmacy',
      component: () => import('../views/admin/user/AdminPharmacyCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/notification-outbox',
      name: 'admin-notification-outbox',
      component: () => import('../views/admin/system/AdminNotificationOutboxView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/data-consistency',
      name: 'admin-data-consistency',
      component: () => import('../views/admin/system/AdminConsistencyView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/metrics',
      name: 'admin-metrics',
      component: () => import('../views/admin/system/AdminMetricsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/config',
      name: 'admin-config',
      component: () => import('../views/admin/system/AdminConfigView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/health',
      name: 'admin-health',
      component: () => import('../views/admin/system/SystemHealthView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/announcements',
      name: 'admin-announcements',
      component: () => import('../views/admin/announcement/AdminAnnouncementView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/permissions',
      name: 'admin-user-permissions',
      component: () => import('../views/admin/user/AdminRolesPermissionsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/manage',
      name: 'admin-users-manage',
      component: () => import('../views/admin/user/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/roles-permissions',
      name: 'admin-roles-permissions',
      component: () => import('../views/admin/user/AdminRolesPermissionsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/patients/:id/edit',
      name: 'admin-patient-edit',
      component: () => import('../views/admin/user/AdminPatientEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/doctors/:id/edit',
      name: 'admin-doctor-edit',
      component: () => import('../views/admin/user/AdminDoctorEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/departments',
      name: 'admin-departments',
      component: () => import('../views/admin/department/AdminDepartmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    // 科室管理页面，管理员和具备科室权限的账号均可访问。
    {
      path: '/department/home',
      name: 'department-manager-home',
      component: () => import('../views/department/home/DepartmentManagerView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/departments/create',
      name: 'department-create',
      component: () => import('../views/department/department/DepartmentCreateView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/departments/edit/:id',
      name: 'department-edit',
      component: () => import('../views/admin/department/AdminDepartmentEditView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/schedule-requests',
      name: 'department-schedule-requests',
      component: () => import('../views/department/schedule/ScheduleApprovalView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: ['SCHEDULE_REQUEST_REVIEW', 'DEPARTMENT_MANAGE'],
      },
    },
    {
      path: '/department/doctors',
      name: 'department-doctors',
      component: () => import('../views/department/doctor/DepartmentDoctorsView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/doctors/:id/edit',
      name: 'department-doctor-edit',
      component: () => import('../views/department/doctor/DepartmentDoctorEditView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/schedules',
      name: 'department-schedules',
      component: () => import('../views/department/schedule/DepartmentSchedulesView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/schedules/create',
      name: 'department-schedule-create',
      component: () => import('../views/department/schedule/DepartmentScheduleCreateView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/schedules/:id/edit',
      name: 'department-schedule-edit',
      component: () => import('../views/department/schedule/DepartmentScheduleEditView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/schedules/:id/slots',
      name: 'department-schedule-slots',
      component: () => import('../views/department/schedule/DepartmentScheduleSlotsView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/patients',
      name: 'department-patients',
      component: () => import('../views/department/patient/DepartmentPatientsView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/department/patients/:id',
      name: 'department-patient-detail',
      component: () => import('../views/department/patient/DepartmentPatientDetailView.vue'),
      meta: {
        requiresAuth: true,
        role: ['ADMIN', 'DOCTOR'],
        permission: 'DEPARTMENT_MANAGE',
      },
    },
    {
      path: '/admin/departments/create',
      name: 'admin-department-create',
      component: () => import('../views/department/department/DepartmentCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/departments/edit/:id',
      name: 'admin-department-edit',
      component: () => import('../views/admin/department/AdminDepartmentEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules',
      name: 'admin-schedules',
      redirect: '/admin/schedules/list',
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/list',
      name: 'admin-schedule-list',
      component: () => import('../views/admin/schedule/AdminScheduleListView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/create',
      name: 'admin-schedule-create',
      component: () => import('../views/admin/schedule/AdminScheduleCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id/edit',
      name: 'admin-schedule-edit',
      component: () => import('../views/admin/schedule/AdminScheduleEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id/slots',
      name: 'admin-schedule-slots',
      component: () => import('../views/admin/schedule/AdminScheduleSlotsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id',
      name: 'admin-schedule-detail',
      component: () => import('../views/admin/schedule/AdminScheduleDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedule-requests',
      name: 'admin-schedule-requests',
      component: () => import('../views/department/schedule/ScheduleApprovalView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments',
      name: 'admin-appointments',
      component: () => import('../views/admin/appointment/AdminAppointmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments/:id',
      name: 'admin-appointment-detail',
      component: () => import('../views/admin/appointment/AdminAppointmentDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments/:id/migrate',
      name: 'admin-appointment-migrate',
      component: () => import('../views/admin/appointment/AdminAppointmentMigrateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/operation-logs',
      name: 'admin-operation-logs',
      component: () => import('../views/admin/operation-log/OperationLogsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/operation-logs/:id',
      name: 'admin-operation-log-detail',
      component: () => import('../views/admin/operation-log/OperationLogDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/payments/refund',
      name: 'admin-payment-refund',
      component: () => import('../views/admin/payment/AdminPaymentRefundView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/payments',
      name: 'admin-payments',
      component: () => import('../views/admin/payment/AdminPaymentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/attachments',
      name: 'admin-attachments',
      component: () => import('../views/common/attachment/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/doctor/appointments',
      name: 'doctor-appointments',
      component: () => import('../views/doctor/appointment/DoctorAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/appointments/:id/edit',
      name: 'doctor-appointment-edit',
      component: () => import('../views/doctor/appointment/DoctorAppointmentEditView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits',
      name: 'doctor-visits',
      component: () => import('../views/doctor/visit/DoctorVisitsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits/:id',
      name: 'doctor-visit-detail',
      component: () => import('../views/doctor/visit/DoctorVisitDetailView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/patients',
      name: 'doctor-patients',
      component: () => import('../views/doctor/patient/DoctorPatientsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/patients/:id',
      name: 'doctor-patient-detail',
      component: () => import('../views/doctor/patient/DoctorPatientDetailView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/attachments',
      name: 'doctor-attachments',
      component: () => import('../views/common/attachment/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits/:visitId/diagnoses',
      name: 'doctor-visit-diagnoses',
      component: () => import('../views/doctor/diagnosis/DoctorDiagnosesView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits/:visitId/prescriptions/create',
      name: 'doctor-prescription-create',
      component: () => import('../views/doctor/prescription/DoctorPrescriptionCreateView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/prescriptions/:id',
      name: 'doctor-prescription-detail',
      component: () => import('../views/doctor/prescription/DoctorPrescriptionDetailView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    // 挂号员工作台页面。
    {
      path: '/registration/home',
      name: 'registration-home',
      component: () => import('../views/registration/home/RegistrationHomeView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/appointments',
      name: 'registration-appointments',
      component: () => import('../views/registration/appointment/RegistrationAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/queue',
      name: 'registration-queue',
      component: () => import('../views/registration/queue/RegistrationQueueView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/patients',
      name: 'registration-patients',
      component: () => import('../views/registration/patient/RegistrationPatientsView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/patients/:id',
      name: 'registration-patient-detail',
      component: () => import('../views/registration/patient/RegistrationPatientDetailView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/desk',
      name: 'registration-desk',
      component: () => import('../views/registration/appointment/RegistrationDeskView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    // 药房工作台页面。
    {
      path: '/pharmacy/home',
      name: 'pharmacy-home',
      component: () => import('../views/pharmacy/home/PharmacyHomeView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/medicines',
      name: 'pharmacy-medicines',
      component: () => import('../views/pharmacy/medicine/PharmacyMedicinesView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/medicines/create',
      name: 'pharmacy-medicine-create',
      component: () => import('../views/pharmacy/medicine/PharmacyMedicineCreateView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/medicines/:id/edit',
      name: 'pharmacy-medicine-edit',
      component: () => import('../views/pharmacy/medicine/PharmacyMedicineEditView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/medicines/:id/stock-in',
      name: 'pharmacy-medicine-stock-in',
      component: () => import('../views/pharmacy/medicine/PharmacyMedicineStockInView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/prescriptions',
      name: 'pharmacy-prescriptions',
      component: () => import('../views/pharmacy/prescription/PharmacyPrescriptionsView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/prescriptions/:id',
      name: 'pharmacy-prescription-detail',
      component: () => import('../views/pharmacy/prescription/PharmacyPrescriptionDetailView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/access-pending',
      name: 'access-pending',
      component: () => import('../views/common/auth/AccessPendingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

/**
 * 登录状态与角色权限守卫
 *
 * 受保护路由会先恢复登录会话；未登录用户跳转登录页，
 * 已登录但角色或权限不匹配的用户回到各自工作台首页。
 */
router.beforeEach(async (to) => {
  const {
    currentUser,
    departmentManageAccess,
    restoreSession,
    rolePath,
    scheduleReviewAccess,
  } = useAuth()

  if (to.meta.requiresAuth) {
    const user = await restoreSession()

    if (!user) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    const rawPermission = (to.meta as { permission?: string | string[] }).permission
    const requiredPermissions =
      typeof rawPermission === 'string'
        ? [rawPermission]
        : Array.isArray(rawPermission)
          ? rawPermission
          : []
    const hasDetectedPermission = requiredPermissions.some(
      (permission) =>
        (permission === 'DEPARTMENT_MANAGE' && departmentManageAccess.value) ||
        (permission === 'SCHEDULE_REQUEST_REVIEW' && scheduleReviewAccess.value),
    )
    const hasRequiredPermission =
      !requiredPermissions.length ||
      user.primary_role === 'ADMIN' ||
      user.role_codes.includes('ADMIN') ||
      hasDetectedPermission ||
      requiredPermissions.some(
        (permission) =>
          (user.permission_codes || []).includes(permission) ||
          user.role_codes.includes(permission),
      )

    const requiredRole = to.meta.role
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    const hasRequiredRole =
      !requiredRoles.some((role) => typeof role === 'string') ||
      requiredRoles.some((role) => typeof role === 'string' && user.role_codes.includes(role))

    if (!hasRequiredPermission || (!hasRequiredRole && !requiredPermissions.length)) {
      return rolePath(user.primary_role)
    }
  }

  // 已登录用户再次访问登录页时直接进入对应工作台。
  if (to.name === 'login') {
    const user = currentUser.value || (await restoreSession())

    if (user) {
      return rolePath(user.primary_role)
    }
  }
})

export default router
