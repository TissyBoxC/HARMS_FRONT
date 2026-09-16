<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert, UserRound } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getRegistrationPatient } from '@/api/registration-extended'
const route=useRoute();const item=ref<Record<string,unknown>|null>(null);const loading=ref(true);const errorMessage=ref('')
onMounted(async()=>{try{item.value=await getRegistrationPatient(Number(route.params.id))}catch(error){errorMessage.value=error instanceof ApiError?error.message:'患者资料加载失败，请稍后重试。'}finally{loading.value=false}})
</script>
<template><WorkspaceLayout role="registration"><div class="page"><RouterLink class="back" to="/registration/patients"><ArrowLeft :size="16" />返回患者检索</RouterLink><header><p>挂号服务</p><h1>患者详情</h1></header><div v-if="loading" class="state">正在加载患者资料…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16" />{{errorMessage}}</div><section v-else-if="item" class="card"><UserRound :size="28" /><div class="facts"><h2>{{item.real_name}}</h2><p>患者编号：{{item.id}}</p><p>联系电话：{{item.phone||'未填写'}}</p><p>身份证号：{{item.id_card||'未返回'}}</p><p>联系地址：{{item.address||'未填写'}}</p><p>紧急联系人：{{item.emergency_contact||'未填写'}} {{item.emergency_phone||''}}</p></div></section></div></WorkspaceLayout></template>
<style scoped>.page{max-width:820px}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.card{padding:24px;display:flex;gap:14px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.card>svg{color:var(--primary)}.facts h2{font-family:var(--font-serif);font-size:24px}.facts p{margin-top:9px;color:var(--muted);font-size:13px}.state{padding:45px;color:var(--muted);text-align:center}.notice{padding:12px;display:flex;gap:8px;color:var(--danger);background:var(--danger-soft);border-radius:6px}</style>
