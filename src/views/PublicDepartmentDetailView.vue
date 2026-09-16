<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, Building2, CircleAlert } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPublicDepartment } from '@/api/department'
import { getDepartmentDoctors } from '@/api/public-medical'
import type { Department, PublicDoctor } from '@/types/user'

const route = useRoute()
const department = ref<Department | null>(null)
const doctors = ref<PublicDoctor[]>([])
const loading = ref(true)
const errorMessage = ref('')
onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [departmentData, doctorData] = await Promise.all([getPublicDepartment(id), getDepartmentDoctors(id)])
    department.value = departmentData
    doctors.value = doctorData
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '科室信息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <div class="role-page"><RouterLink class="back" to="/patient/home"><ArrowLeft :size="16" />返回患者首页</RouterLink><div v-if="loading" class="state">正在加载科室信息…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><article v-else-if="department" class="department-card"><span class="department-icon"><Building2 :size="30" /></span><p>科室信息</p><h1>{{ department.name }}</h1><h2>{{ department.code }}</h2><div class="facts"><span>位置<strong>{{ department.location || '医院内' }}</strong></span><span>联系电话<strong>{{ department.contact_phone || '暂未提供' }}</strong></span></div><section><h3>科室介绍</h3><p>{{ department.description || '暂未填写科室介绍。' }}</p></section><RouterLink class="primary" :to="`/patient/doctors?department_id=${department.id}`">查看科室医生</RouterLink><section v-if="doctors.length" class="doctor-preview"><h3>在岗医生</h3><RouterLink v-for="doctor in doctors.slice(0, 4)" :key="doctor.id" :to="`/patient/doctors/${doctor.id}`">{{ doctor.real_name }} · {{ doctor.title || '医生' }}</RouterLink></section></article></div>
</template>
<style scoped>
.role-page{width:min(100% - 48px,760px);margin:0 auto;padding:60px 0 100px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.department-card{margin-top:28px;padding:36px;background:#fff;border:1px solid var(--border);border-radius:8px}.department-icon{width:60px;height:60px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:8px}.department-card>p{margin-top:30px;color:var(--primary);font-size:12px;font-weight:650}.department-card h1{margin-top:10px;font-family:var(--font-serif);font-size:42px;font-weight:500}.department-card h2{margin-top:8px;color:var(--muted);font-size:15px;font-weight:500}.facts{margin-top:28px;display:flex;gap:34px}.facts span,.facts strong{display:block}.facts span{color:var(--muted);font-size:12px}.facts strong{margin-top:5px;color:var(--ink);font-size:16px}.department-card section{margin-top:28px;padding-top:20px;border-top:1px solid var(--border)}.department-card h3{font-size:14px}.department-card section p{margin-top:9px;color:var(--muted);line-height:1.8;font-size:13px}.doctor-preview a{display:block;margin-top:8px;color:var(--primary);font-size:13px;text-decoration:none}.primary{margin-top:30px;min-height:44px;padding:0 18px;display:inline-flex;align-items:center;color:#fff;background:var(--primary);border-radius:5px;text-decoration:none}.state{padding:48px;color:var(--muted);text-align:center}.notice{margin-top:20px;padding:13px;display:flex;gap:8px;align-items:center;color:var(--danger);background:var(--danger-soft);border-radius:6px}@media(max-width:620px){.role-page{width:calc(100% - 28px);padding:42px 0 72px}.department-card{padding:24px}.department-card h1{font-size:36px}.facts{gap:20px;flex-wrap:wrap}}
</style>
