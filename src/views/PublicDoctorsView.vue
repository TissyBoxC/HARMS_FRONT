<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { CircleAlert, Search, Stethoscope } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPublicDepartments } from '@/api/department'
import { getPublicDoctors } from '@/api/public-medical'
import type { Department, PublicDoctor } from '@/types/user'
const departments = ref<Department[]>([]); const doctors = ref<PublicDoctor[]>([]); const loading = ref(true); const errorMessage = ref(''); const keyword = ref(''); const departmentId = ref<number | undefined>(undefined)
const load = async () => { loading.value = true; errorMessage.value = ''; try { doctors.value = await getPublicDoctors({ keyword: keyword.value, department_id: departmentId.value }) } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '医生信息加载失败，请稍后重试。' } finally { loading.value = false } }
onMounted(async () => { try { departments.value = await getPublicDepartments() } catch {} await load() })
</script>
<template>
  <div class="role-page"><header class="role-heading"><p>医生服务</p><h1>选择医生</h1><span>按科室或关键词查找在岗医生。</span></header>
    <form class="filters" @submit.prevent="load"><label><Search :size="17" /><input v-model="keyword" placeholder="搜索姓名、工号或擅长方向" /></label><select v-model.number="departmentId"><option :value="undefined">全部科室</option><option v-for="item in departments" :key="item.id" :value="item.id">{{ item.name }}</option></select><button class="primary" type="submit">查找</button></form>
    <div v-if="loading" class="state">正在加载医生信息…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-else-if="!doctors.length" class="state">暂无符合条件的医生。</div>
    <div v-else class="doctor-list"><RouterLink v-for="doctor in doctors" :key="doctor.id" class="doctor-item" :to="`/patient/doctors/${doctor.id}`"><span class="doctor-icon"><Stethoscope :size="22" /></span><span><strong>{{ doctor.real_name }}</strong><small>{{ doctor.title || '医生' }} · {{ doctor.specialty || '综合诊疗' }}</small><p>{{ doctor.introduction || '欢迎查看医生详情。' }}</p></span><em>查看详情</em></RouterLink></div>
  </div>
</template>
<style scoped>
.role-page{width:min(100% - 48px,960px);margin:0 auto;padding:72px 0 110px}.role-heading p{color:var(--primary);font-size:12px;font-weight:650}.role-heading h1{margin-top:12px;font-family:var(--font-serif);font-size:46px;font-weight:500}.role-heading span{display:block;margin-top:12px;color:var(--muted);font-size:14px}.filters{margin-top:36px;display:grid;grid-template-columns:1fr 220px auto;gap:10px}.filters label{min-height:44px;padding:0 12px;display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--border);border-radius:5px}.filters input,.filters select{width:100%;height:44px;border:0;background:transparent;outline:0;color:var(--ink)}.primary{min-height:44px;padding:0 22px;color:#fff;background:var(--primary);border:0;border-radius:5px;cursor:pointer}.doctor-list{margin-top:24px;display:grid;gap:10px}.doctor-item{padding:20px;display:grid;grid-template-columns:42px 1fr auto;gap:14px;align-items:center;color:var(--ink);background:#fff;border:1px solid var(--border);border-radius:7px;text-decoration:none}.doctor-icon{width:42px;height:42px;display:grid;place-items:center;color:var(--primary);background:var(--primary-soft);border-radius:6px}.doctor-item strong,.doctor-item small,.doctor-item p{display:block}.doctor-item small,.doctor-item p,.doctor-item em{margin-top:5px;color:var(--muted);font-size:12px;font-style:normal}.doctor-item em{color:var(--primary)}.state{padding:48px;color:var(--muted);text-align:center}.notice{margin-top:20px;padding:13px;display:flex;gap:8px;align-items:center;color:var(--danger);background:var(--danger-soft);border-radius:6px}@media(max-width:680px){.role-page{width:calc(100% - 28px);padding:48px 0 72px}.role-heading h1{font-size:38px}.filters{grid-template-columns:1fr}.doctor-item{grid-template-columns:42px 1fr}.doctor-item em{grid-column:2}}
</style>
