<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert, Stethoscope } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPatientDiagnoses } from '@/api/clinical'
import type { DiagnosisRecord } from '@/types/user'
const items = ref<DiagnosisRecord[]>([]); const loading = ref(true); const errorMessage = ref('')
onMounted(async () => { try { items.value = await getPatientDiagnoses() } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '诊断记录加载失败，请稍后重试。' } finally { loading.value = false } })
</script>
<template><div class="page"><RouterLink class="back" to="/patient/visits"><ArrowLeft :size="16" />返回我的就诊</RouterLink><header><p>就诊记录</p><h1>诊断记录</h1></header><div v-if="loading" class="state">正在加载诊断记录…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><div v-else-if="!items.length" class="state">暂无诊断记录。</div><div v-else class="list"><article v-for="item in items" :key="item.id"><Stethoscope :size="19" /><div><strong>{{ item.diagnosis_name }}</strong><small>{{ item.diagnosis_type === 2 ? '确诊' : '初步诊断' }} · {{ item.diagnosis_code || '暂无编码' }}</small><p v-if="item.remark">{{ item.remark }}</p></div></article></div></div></template>
<style scoped>.page{width:min(100% - 48px,900px);margin:0 auto;padding:70px 0}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);text-decoration:none;font-size:13px}.page header{margin:28px 0 22px}.page header p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-family:var(--font-serif);font-size:32px}.list{display:grid;gap:9px}.list article{padding:16px;display:flex;gap:11px;background:var(--surface-strong);border:1px solid var(--border);border-radius:7px}.list article>svg{color:var(--primary)}.list strong,.list small,.list p{display:block}.list small{margin-top:5px;color:var(--muted);font-size:12px}.list p{margin-top:8px;color:var(--ink);font-size:13px;line-height:1.6}.state{padding:42px;color:var(--muted);text-align:center}.notice{padding:12px;display:flex;gap:7px;color:var(--danger);background:var(--danger-soft);border-radius:6px}</style>
