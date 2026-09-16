<script setup lang="ts">
import { Pill, ClipboardList } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
</script>
<template><WorkspaceLayout role="pharmacy"><div class="page"><p>药房服务</p><h1>工作概览</h1><div class="grid"><RouterLink to="/pharmacy/prescriptions"><Pill :size="22"/><strong>处方取药</strong><span>查询待取药处方、查看明细并确认发药</span></RouterLink><RouterLink to="/pharmacy/prescriptions?status=3"><ClipboardList :size="22"/><strong>已取药记录</strong><span>查看已经完成取药的处方</span></RouterLink></div></div></WorkspaceLayout></template>
<style scoped>.page{max-width:960px}.page>p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.grid{margin-top:28px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.grid a{padding:24px;display:grid;gap:10px;color:var(--ink);background:var(--surface-strong);border:1px solid var(--border);border-radius:8px;text-decoration:none}.grid a:hover{border-color:var(--primary)}.grid span{color:var(--muted);font-size:13px}@media(max-width:620px){.grid{grid-template-columns:1fr}}</style>
