<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Eye, Pill } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPharmacyPrescriptions } from '@/api/pharmacy'

/**
 * 药房处方列表页面
 *
 * 支持按处方状态筛选，并进入详情完成核对和取药操作。
 */
const route = useRoute()
const items = ref<Record<string, unknown>[]>([])
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')
const status = ref(Number(route.query.status) || 0)
const paymentStatus = ref(Number(route.query.paymentStatus) || 0)

// 把处方状态码显示为药房人员可读文案。
const statusLabel = (value: number) =>
  value === 1
    ? '草稿'
    : value === 2
      ? '待取药'
      : value === 3
        ? '已取药'
        : '处理中'

const paymentStatusLabel = (value: number) =>
  value === 1
    ? '待支付'
    : value === 2
      ? '已支付'
      : value === 3
        ? '已退款'
        : '未知'

// 只有已提交且已支付处方才进入确认发药范围。
const canDispense = (item: Record<string, unknown>) =>
  Number(item.status) === 2 && Number(item.payment_status) === 2

// 根据筛选状态查询处方列表。
const load = async () => {
  loading.value = true

  try {
    items.value = await getPharmacyPrescriptions({
      status: status.value || undefined,
      payment_status: paymentStatus.value || undefined,
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方列表加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const rows = items

onMounted(load)
</script>
<template>
  <WorkspaceLayout role="pharmacy">
    <div class="page">
      <RouterLink class="back" to="/pharmacy/home">
        <ArrowLeft :size="16" />
        返回药房首页
      </RouterLink>
      <header>
        <p>药房服务</p>
        <h1>处方取药</h1>
      </header>
      <div class="toolbar">
        <select v-model.number="status" @change="load">
          <option :value="0">全部状态</option>
          <option :value="2">待取药</option>
          <option :value="3">已取药</option>
        </select>
        <select v-model.number="paymentStatus" @change="load">
          <option :value="0">全部支付状态</option>
          <option :value="1">待支付</option>
          <option :value="2">已支付</option>
          <option :value="3">已退款</option>
        </select>
      </div>
      <div v-if="notice" class="notice success">
        <Check :size="16" />
        {{ notice }}
      </div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <div v-if="loading" class="state">正在加载处方…</div>
      <div v-else-if="!rows.length" class="state">暂无处方记录。</div>
      <div v-else class="list">
        <article v-for="entry in rows" :key="Number(entry.id)">
          <Pill :size="20" />
          <div>
            <strong>{{ entry.prescription_no || `处方 ${entry.id}` }}</strong>
            <small>
              {{ entry.patient_name || '患者' }} ·
              {{ entry.doctor_name || '医生' }} ·
              {{ statusLabel(Number(entry.status)) }} ·
              {{ paymentStatusLabel(Number(entry.payment_status)) }}
            </small>
          </div>
          <span
            v-if="!canDispense(entry) && Number(entry.status) === 2"
            class="pending"
          >
            等待支付
          </span>
          <RouterLink
            class="icon"
            :to="`/pharmacy/prescriptions/${entry.id}`"
            title="查看处方"
          >
            <Eye :size="16" />
          </RouterLink>
        </article>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 980px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--primary);
  font-size: 13px;
  text-decoration: none;
}

.page header {
  margin: 28px 0 20px;
}

.page header p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.toolbar select {
  min-height: 40px;
  padding: 0 11px;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.list {
  margin-top: 18px;
  display: grid;
  gap: 8px;
}

.list article {
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.pending {
  margin-left: auto;
  color: #92400e;
  font-size: 12px;
}

.list article > svg {
  color: var(--primary);
}

.list strong,
.list small {
  display: block;
}

.list small {
  margin-top: 5px;
  color: var(--muted);
  font-size: 12px;
}

.icon {
  margin-left: auto;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.notice {
  margin-top: 16px;
  padding: 11px;
  display: flex;
  gap: 7px;
  align-items: center;
  border-radius: 6px;
}

.notice.success {
  color: #166534;
  background: #dcfce7;
}

.notice.error {
  color: #b91c1c;
  background: var(--danger-soft);
}

.state {
  padding: 42px;
  color: var(--muted);
  text-align: center;
}
</style>
