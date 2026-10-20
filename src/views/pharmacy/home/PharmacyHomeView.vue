<script setup lang="ts">
/**
 * 药房工作台首页
 *
 * 提供待取药处方和已完成取药记录两个入口，
 * 方便药房人员按照处方状态进入对应的处理页面。
 */
import { ClipboardList, Package, Pill } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
</script>

<template>
  <WorkspaceLayout role="pharmacy">
    <div class="page">
      <p>药房服务</p>
      <h1>工作概览</h1>
      <div class="grid">
        <RouterLink to="/pharmacy/medicines">
          <Package :size="22" />
          <strong>药品库存</strong>
          <span>查看现有药品、剩余量、低库存并办理入库</span>
        </RouterLink>
        <RouterLink to="/pharmacy/prescriptions">
          <Pill :size="22" />
          <strong>处方取药</strong>
          <span>查询待取药处方、查看明细并确认发药</span>
        </RouterLink>
        <RouterLink to="/pharmacy/prescriptions?status=3">
          <ClipboardList :size="22" />
          <strong>已取药记录</strong>
          <span>查看已经完成取药的处方</span>
        </RouterLink>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 960px;
}

.page > p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.grid a {
  padding: 24px;
  display: grid;
  gap: 10px;
  color: var(--ink);
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
}

.grid a:hover {
  border-color: var(--primary);
}

.grid span {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 620px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
