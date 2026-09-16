<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPatientPrescription, getPatientPrescriptionItems } from '@/api/clinical'
import type { PrescriptionRecord } from '@/types/user'
const route=useRoute();const item=ref<PrescriptionRecord|null>(null);const loading=ref(true);const errorMessage=ref('');const statusLabel=(status:number)=>status===1?'草稿':status===2?'已提交':'已取药'
onMounted(async()=>{try{const id=Number(route.params.id);const [detail,items]=await Promise.all([getPatientPrescription(id),getPatientPrescriptionItems(id)]);item.value={...detail,items}}catch(error){errorMessage.value=error instanceof ApiError?error.message:'处方加载失败，请稍后重试。'}finally{loading.value=false}})
</script>
<template><div class="page"><RouterLink class="back" to="/patient/visits"><ArrowLeft :size="16"/>返回我的就诊</RouterLink><header><p>就诊记录</p><h1>处方详情</h1></header><div v-if="loading" class="state">正在加载处方…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16"/>{{errorMessage}}</div><template v-else-if="item"><section class="summary"><div><span>处方编号</span><strong>{{item.prescription_no}}</strong></div><div><span>状态</span><strong>{{statusLabel(item.status)}}</strong></div></section><section class="items"><h2>药品明细</h2><div v-if="!item.items.length" class="state">暂无药品明细。</div><article v-for="entry in item.items" :key="entry.id"><strong>{{entry.drug_name}}</strong><span>{{entry.specification||'未填写规格'}} · {{entry.dosage}} · {{entry.frequency}} · {{entry.days}} 天 · {{entry.quantity}}</span><p v-if="entry.remark">{{entry.remark}}</p></article></section></template></div></template>
<style scoped>.page{width:min(100% - 48px,820px);margin:0 auto;padding:72px 0 110px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;font-size:13px;text-decoration:none}.page header{margin:28px 0 24px}.page header p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.summary{padding:18px;display:flex;gap:38px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.summary span,.summary strong{display:block}.summary span{color:#64748b;font-size:12px}.summary strong{margin-top:5px}.items{margin-top:20px;padding:22px;background:#fff;border:1px solid #e2e8f0;border-radius:8px}.items h2{font-size:19px}.items article{margin-top:12px;padding:14px;background:#f8fafc;border-radius:6px}.items strong,.items span,.items p{display:block}.items span,.items p{margin-top:5px;color:#64748b;font-size:12px}.state{padding:42px;color:#64748b;text-align:center}.notice{padding:12px;display:flex;gap:7px;color:#b91c1c;background:#fee2e2;border-radius:6px}
</style>


