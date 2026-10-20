<script setup lang="ts">
/**
 * 患者处方列表页
 *
 * 查询当前患者的全部处方，并展示处方编号、医生和处方状态。
 */
import { onMounted, ref } from 'vue'
import { CircleAlert, Eye, Pill } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPatientPrescriptions } from '@/api/clinical'

// 处方接口当前返回通用记录，页面按实际字段读取展示所需内容。
const items = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const errorMessage = ref('')

// 将处方状态编码转换为患者可读的文本。
const statusLabel = (status: number) =>
  status === 1 ? '草稿' : status === 2 ? '待取药' : '已取药'

const paymentStatusLabel = (status: number) =>
  status === 1 ? '待支付' : status === 2 ? '已支付' : status === 3 ? '已退款' : '未知'

onMounted(async () => {
  try {
    items.value = await getPatientPrescriptions()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <header>
      <p>就诊记录</p>
      <h1>我的处方</h1>
    </header>
    <div v-if="errorMessage" class="notice">
      <CircleAlert :size="16" />
      {{ errorMessage }}
    </div>
    <div v-if="loading" class="state">正在加载处方…</div>
    <div v-else-if="!items.length" class="state">暂无处方记录。</div>
    <div v-else class="list">
      <article v-for="item in items" :key="Number(item.id)">
        <Pill :size="19" />
        <div>
          <strong>{{ item.prescription_no || `处方 ${item.id}` }}</strong>
          <small>
            {{ item.doctor_name || '医生' }} · {{ statusLabel(Number(item.status)) }} ·
            {{ paymentStatusLabel(Number(item.payment_status)) }} ·
            ¥{{ Number(item.total_amount || 0).toFixed(2) }}
          </small>
        </div>
        <RouterLink
          class="icon"
          :to="`/patient/prescriptions/${item.id}`"
          title="查看处方"
        >
          <Eye :size="15" />
        </RouterLink>
      </article>
    </div>
  </div>
</template>

<style scoped>
.page {
  width: min(100% - 48px, 900px);
  margin: 0 auto;
  padding: 72px 0;
}

.page header {
  margin-bottom: 22px;
}

.page header p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-family: var(--font-serif);
  font-size: 32px;
}

.list {
  display: grid;
  gap: 8px;
}

.list article {
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.list article > svg {
  color: var(--primary);
}

.list strong,
.list small {
  display: block;
}

.list small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.icon {
  margin-left: auto;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.notice {
  padding: 11px;
  display: flex;
  gap: 7px;
  color: var(--danger);
  background: var(--danger-soft);
  border-radius: 6px;
}

.state {
  padding: 40px;
  color: var(--muted);
}
</style>
