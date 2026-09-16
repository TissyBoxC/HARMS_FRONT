<script setup lang="ts">
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
</script>
<template><WorkspaceLayout role="registration"><div class="page"><p>挂号服务</p><h1>工作概览</h1><div class="grid"><RouterLink to="/registration/appointments"><strong>预约处理</strong><span>查看待处理预约并完成签到或取消</span></RouterLink><RouterLink to="/registration/queue"><strong>候诊队列</strong><span>查看已签到患者的当前队列</span></RouterLink></div></div></WorkspaceLayout></template>
<style scoped>.page{max-width:960px}.page>p{color:#2563eb;font-size:12px;font-weight:700}.page h1{margin-top:8px;font-size:30px}.grid{margin-top:28px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.grid a{padding:24px;display:grid;gap:8px;color:#1e293b;background:#fff;border:1px solid #e2e8f0;border-radius:9px;text-decoration:none}.grid a:hover{border-color:#93c5fd;background:#eff6ff}.grid span{color:#64748b;font-size:13px}@media(max-width:620px){.grid{grid-template-columns:1fr}}
</style>
