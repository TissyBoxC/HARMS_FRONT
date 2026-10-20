<script setup lang="ts">
/**
 * 服务准备页面
 *
 * 用于登录成功但当前账号尚未匹配到可访问工作台时的提示页面。
 */
</script>

<template>
  <div class="pending-page">
    <h1>服务准备中</h1>
    <p>当前账号对应的服务页面正在准备，请稍后再来。</p>
  </div>
</template>

<style scoped>
.pending-page {
  width: min(100% - 48px, 720px);
  margin: 0 auto;
  padding: 120px 0;
  text-align: center;
}

.pending-page h1 {
  font-family: var(--font-serif);
  font-size: 40px;
  font-weight: 500;
}

.pending-page p {
  margin-top: 14px;
  color: var(--muted);
  font-size: 14px;
}
</style>
