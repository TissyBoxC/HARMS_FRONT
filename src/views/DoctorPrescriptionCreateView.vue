<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert, FilePlus2 } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createPrescription } from '@/api/clinical'
const route=useRoute();const router=useRouter();const loading=ref(true);const saving=ref(false);const errorMessage=ref('');const visitId=Number(route.params.visitId)
onMounted(()=>{loading.value=false})
const create=async()=>{saving.value=true;errorMessage.value='';try{const item=await createPrescription(visitId);await router.replace(`/doctor/prescriptions/${item.id}`)}catch(error){errorMessage.value=error instanceof ApiError?error.message:'处方创建失败，请稍后重试。'}finally{saving.value=false}}
</script>
<template><WorkspaceLayout role="doctor"><div class="page"><RouterLink class="back" to="/doctor/visits"><ArrowLeft :size="16"/>返回就诊记录</RouterLink><header><p>临床记录</p><h1>创建处方</h1></header><div v-if="loading" class="state">正在准备处方…</div><section v-else class="card"><FilePlus2 :size="34"/><h2>新建一份处方</h2><p>创建后可继续填写药品明细，并提交处方状态。</p><div v-if="errorMessage" class="notice"><CircleAlert :size="16"/>{{errorMessage}}</div><button class="primary" type="button" :disabled="saving" @click="create">{{saving?'创建中':'创建处方'}}</button></section></div></WorkspaceLayout></template>
<style scoped>.page{max-width:820px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;text-decoration:none;font-size:13px}.page header{margin:28px 0 22px}.page header p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.card{padding:34px;display:grid;justify-items:start;gap:13px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.card>svg{color:#2563eb}.card h2{font-size:20px}.card p{color:#64748b;font-size:13px}.primary{min-height:42px;padding:0 17px;color:#fff;background:#2563eb;border:0;border-radius:6px;cursor:pointer}.primary:disabled{opacity:.6}.notice{padding:11px;display:flex;gap:7px;color:#b91c1c;background:#fee2e2;border-radius:6px}.state{padding:42px;color:#64748b;text-align:center}
</style>
