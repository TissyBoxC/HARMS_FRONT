import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/announcements',
      name: 'public-announcements',
      component: () => import('../views/PublicAnnouncementsView.vue'),
    },
    {
      path: '/announcements/:id',
      name: 'public-announcement-detail',
      component: () => import('../views/PublicAnnouncementDetailView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/patient/home',
      name: 'patient-home',
      component: () => import('../views/PatientHomeView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/profile',
      name: 'patient-profile',
      component: () => import('../views/PatientProfileView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/doctors',
      name: 'patient-doctors',
      component: () => import('../views/PublicDoctorsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/departments/:id',
      name: 'patient-department-detail',
      component: () => import('../views/PublicDepartmentDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/doctors/:id',
      name: 'patient-doctor-detail',
      component: () => import('../views/PublicDoctorDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/schedules',
      name: 'patient-schedules',
      component: () => import('../views/PublicSchedulesView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/schedules/:id',
      name: 'patient-schedule-detail',
      component: () => import('../views/PublicScheduleDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/appointments',
      name: 'patient-appointments',
      component: () => import('../views/PatientAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/appointments/:id',
      name: 'patient-appointment-detail',
      component: () => import('../views/PatientAppointmentDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/visits',
      name: 'patient-visits',
      component: () => import('../views/PatientVisitsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/visits/:id',
      name: 'patient-visit-detail',
      component: () => import('../views/PatientVisitDetailView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/prescriptions/:id',
      name: 'patient-prescription-detail',
      component: () => import('../views/PatientPrescriptionView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/payments/:id',
      name: 'patient-payment-detail',
      component: () => import('../views/PatientPaymentView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/payments',
      name: 'patient-payments',
      component: () => import('../views/PatientPaymentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/prescriptions',
      name: 'patient-prescriptions',
      component: () => import('../views/PatientPrescriptionsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/diagnoses',
      name: 'patient-diagnoses',
      component: () => import('../views/PatientDiagnosesView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/patient/attachments',
      name: 'patient-attachments',
      component: () => import('../views/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: ['PATIENT', 'ADMIN'] },
    },
    {
      path: '/notifications',
      name: 'system-notifications',
      component: () => import('../views/SystemNotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/doctor/home',
      name: 'doctor-home',
      component: () => import('../views/DoctorHomeView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/profile',
      name: 'doctor-profile',
      component: () => import('../views/DoctorProfileView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedules',
      name: 'doctor-schedules',
      component: () => import('../views/DoctorSchedulesView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/schedules/:id/slots',
      name: 'doctor-schedule-slots',
      component: () => import('../views/DoctorScheduleSlotsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/admin/home',
      name: 'admin-home',
      component: () => import('../views/AdminHomeView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/accounts',
      name: 'admin-user-accounts',
      component: () => import('../views/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/:id',
      name: 'admin-user-detail',
      component: () => import('../views/AdminUserDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-patient',
      name: 'admin-create-patient',
      component: () => import('../views/AdminPatientCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-doctor',
      name: 'admin-create-doctor',
      component: () => import('../views/AdminDoctorCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-registration',
      name: 'admin-create-registration',
      component: () => import('../views/RegistrationAccountCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/create-pharmacy',
      name: 'admin-create-pharmacy',
      component: () => import('../views/AdminPharmacyCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/notification-outbox',
      name: 'admin-notification-outbox',
      component: () => import('../views/AdminNotificationOutboxView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/data-consistency',
      name: 'admin-data-consistency',
      component: () => import('../views/AdminConsistencyView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/metrics',
      name: 'admin-metrics',
      component: () => import('../views/AdminMetricsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/config',
      name: 'admin-config',
      component: () => import('../views/AdminConfigView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/health',
      name: 'admin-health',
      component: () => import('../views/SystemHealthView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/announcements',
      name: 'admin-announcements',
      component: () => import('../views/AdminAnnouncementView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/permissions',
      name: 'admin-user-permissions',
      component: () => import('../views/AdminRolesPermissionsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/users/manage',
      name: 'admin-users-manage',
      component: () => import('../views/AdminUsersManageView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/roles-permissions',
      name: 'admin-roles-permissions',
      component: () => import('../views/AdminRolesPermissionsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/patients/:id/edit',
      name: 'admin-patient-edit',
      component: () => import('../views/AdminPatientEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/doctors/:id/edit',
      name: 'admin-doctor-edit',
      component: () => import('../views/AdminDoctorEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/departments',
      name: 'admin-departments',
      component: () => import('../views/AdminDepartmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/department/home',
      name: 'department-manager-home',
      component: () => import('../views/DepartmentManagerView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'DEPARTMENT_MANAGER'], permission: 'DEPARTMENT_MANAGE' },
    },
    {
      path: '/department/departments/create',
      name: 'department-create',
      component: () => import('../views/DepartmentCreateView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'DEPARTMENT_MANAGER'], permission: 'DEPARTMENT_MANAGE' },
    },
    {
      path: '/department/departments/edit/:id',
      name: 'department-edit',
      component: () => import('../views/AdminDepartmentEditView.vue'),
      meta: { requiresAuth: true, role: ['ADMIN', 'DEPARTMENT_MANAGER'], permission: 'DEPARTMENT_MANAGE' },
    },
    {
      path: '/admin/departments/create',
      name: 'admin-department-create',
      component: () => import('../views/DepartmentCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/departments/edit/:id',
      name: 'admin-department-edit',
      component: () => import('../views/AdminDepartmentEditView.vue'),
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
      component: () => import('../views/AdminScheduleListView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/create',
      name: 'admin-schedule-create',
      component: () => import('../views/AdminScheduleCreateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id/edit',
      name: 'admin-schedule-edit',
      component: () => import('../views/AdminScheduleEditView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id/slots',
      name: 'admin-schedule-slots',
      component: () => import('../views/AdminScheduleSlotsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/schedules/:id',
      name: 'admin-schedule-detail',
      component: () => import('../views/AdminScheduleDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments',
      name: 'admin-appointments',
      component: () => import('../views/AdminAppointmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments/:id',
      name: 'admin-appointment-detail',
      component: () => import('../views/AdminAppointmentDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/appointments/:id/migrate',
      name: 'admin-appointment-migrate',
      component: () => import('../views/AdminAppointmentMigrateView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/operation-logs',
      name: 'admin-operation-logs',
      component: () => import('../views/OperationLogsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/operation-logs/:id',
      name: 'admin-operation-log-detail',
      component: () => import('../views/OperationLogDetailView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/payments/refund',
      name: 'admin-payment-refund',
      component: () => import('../views/AdminPaymentRefundView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/payments',
      name: 'admin-payments',
      component: () => import('../views/AdminPaymentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/admin/attachments',
      name: 'admin-attachments',
      component: () => import('../views/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' },
    },
    {
      path: '/doctor/appointments',
      name: 'doctor-appointments',
      component: () => import('../views/DoctorAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/appointments/:id/edit',
      name: 'doctor-appointment-edit',
      component: () => import('../views/DoctorAppointmentEditView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits',
      name: 'doctor-visits',
      component: () => import('../views/DoctorVisitsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/patients',
      name: 'doctor-patients',
      component: () => import('../views/DoctorPatientsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/patients/:id',
      name: 'doctor-patient-detail',
      component: () => import('../views/DoctorPatientDetailView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/attachments',
      name: 'doctor-attachments',
      component: () => import('../views/MedicalAttachmentsView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits/:visitId/diagnoses',
      name: 'doctor-visit-diagnoses',
      component: () => import('../views/DoctorDiagnosesView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/visits/:visitId/prescriptions/create',
      name: 'doctor-prescription-create',
      component: () => import('../views/DoctorPrescriptionCreateView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/doctor/prescriptions/:id',
      name: 'doctor-prescription-detail',
      component: () => import('../views/DoctorPrescriptionDetailView.vue'),
      meta: { requiresAuth: true, role: ['DOCTOR', 'ADMIN'] },
    },
    {
      path: '/registration/home',
      name: 'registration-home',
      component: () => import('../views/RegistrationHomeView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/appointments',
      name: 'registration-appointments',
      component: () => import('../views/RegistrationAppointmentsView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/queue',
      name: 'registration-queue',
      component: () => import('../views/RegistrationQueueView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/patients',
      name: 'registration-patients',
      component: () => import('../views/RegistrationPatientsView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/patients/:id',
      name: 'registration-patient-detail',
      component: () => import('../views/RegistrationPatientDetailView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/registration/desk',
      name: 'registration-desk',
      component: () => import('../views/RegistrationDeskView.vue'),
      meta: { requiresAuth: true, role: ['REGISTRATION', 'ADMIN'] },
    },
    {
      path: '/pharmacy/home',
      name: 'pharmacy-home',
      component: () => import('../views/PharmacyHomeView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/prescriptions',
      name: 'pharmacy-prescriptions',
      component: () => import('../views/PharmacyPrescriptionsView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/pharmacy/prescriptions/:id',
      name: 'pharmacy-prescription-detail',
      component: () => import('../views/PharmacyPrescriptionDetailView.vue'),
      meta: { requiresAuth: true, role: ['PHARMACY', 'ADMIN'] },
    },
    {
      path: '/access-pending',
      name: 'access-pending',
      component: () => import('../views/AccessPendingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const { currentUser, restoreSession, rolePath } = useAuth()

  if (to.meta.requiresAuth) {
    const user = await restoreSession()
    if (!user) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    const requiredRole = to.meta.role
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (requiredRoles.some((role) => typeof role === 'string') && !requiredRoles.some((role) => typeof role === 'string' && user.role_codes.includes(role))) {
      return rolePath(user.primary_role)
    }
    const requiredPermission = (to.meta as { permission?: string }).permission
    if (typeof requiredPermission === 'string' && user.primary_role !== 'ADMIN' && !(user.permission_codes || []).includes(requiredPermission) && !user.role_codes.includes(requiredPermission)) {
      return rolePath(user.primary_role)
    }
  }

  if (to.name === 'login') {
    const user = currentUser.value || (await restoreSession())
    if (user) return rolePath(user.primary_role)
  }
})

export default router
