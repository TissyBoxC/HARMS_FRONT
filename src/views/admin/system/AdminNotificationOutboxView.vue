<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Bell, Check, CircleAlert, RefreshCw, Send } from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  getNotificationOutbox,
  retryNotificationOutbox,
  sendNotificationOutbox,
} from '@/api/admin-extended'

/**
 * 管理员外部通知队列页面
 *
 * 可按状态查看预约、取消和退款产生的通知出队记录，
 * 并支持模拟发送待处理通知或重新排队失败通知。
 */
const items = ref<Record<string, unknown>[]>([])
const status = ref('')
const loading = ref(true)
const errorMessage = ref('')
const notice = ref('')

// 按当前状态筛选通知队列，最多一次读取 500 条。
const load = async () => {
  loading.value = true

  try {
    items.value = await getNotificationOutbox({
      status: status.value === '' ? undefined : Number(status.value),
      limit: 500,
    })
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '通知队列加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

/**
 * 执行通知操作。
 *
 * `send` 模拟发送待处理通知，`retry` 将失败通知重新排队。
 */
const act = async (id: number, type: 'send' | 'retry') => {
  try {
    if (type === 'send') {
      await sendNotificationOutbox(id)
    } else {
      await retryNotificationOutbox(id)
    }

    notice.value = type === 'send' ? '通知已模拟发送' : '失败通知已重新排队'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '操作失败，请稍后重试。'
  }
}

// 队列状态编码转换为页面可读名称。
const label = (status: number) =>
  status === 0 ? '待发送' : status === 1 ? '已发送' : '失败'

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header>
        <p>系统维护</p>
        <h1>外部通知队列</h1>
      </header>

      <div class="filters">
        <select
          v-model="status"
          @change="load"
        >
          <option value="">全部状态</option>
          <option value="0">待发送</option>
          <option value="1">已发送</option>
          <option value="2">失败</option>
        </select>
        <button
          type="button"
          @click="load"
        >
          <RefreshCw :size="16" />
          刷新
        </button>
      </div>

      <div
        v-if="notice"
        class="notice success"
      >
        <Check :size="16" />
        {{ notice }}
      </div>
      <div
        v-if="errorMessage"
        class="notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <div
        v-if="loading"
        class="state"
      >
        正在加载通知…
      </div>
      <div
        v-else-if="!items.length"
        class="state"
      >
        暂无通知记录。
      </div>
      <div
        v-else
        class="list"
      >
        <article
          v-for="item in items"
          :key="Number(item.id)"
        >
          <Bell :size="18" />
          <div>
            <strong>{{ item.event_type || item.notification_type || '系统通知' }}</strong>
            <small>
              目标 {{ item.target_id || '—' }} · {{ label(Number(item.status)) }} ·
              {{ item.created_at || '' }}
            </small>
            <p>{{ item.content || item.message || item.error_message || '暂无内容' }}</p>
          </div>
          <button
            v-if="Number(item.status) !== 1"
            class="icon"
            type="button"
            title="模拟发送"
            @click="act(Number(item.id), 'send')"
          >
            <Send :size="15" />
          </button>
          <button
            v-if="Number(item.status) === 2"
            class="icon"
            type="button"
            title="重新排队"
            @click="act(Number(item.id), 'retry')"
          >
            <RefreshCw :size="15" />
          </button>
        </article>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1060px;
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
  font-size: 30px;
}

.filters {
  display: flex;
  gap: 8px;
}

.filters select,
.filters button {
  min-height: 40px;
  padding: 0 11px;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.filters button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  cursor: pointer;
}

.list {
  margin-top: 18px;
  display: grid;
  gap: 8px;
}

.list article {
  padding: 15px;
  display: flex;
  align-items: flex-start;
  gap: 11px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.list article > svg {
  color: var(--primary);
  margin-top: 2px;
}

.list strong,
.list small,
.list p {
  display: block;
}

.list small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.list p {
  margin-top: 8px;
  color: var(--ink);
  font-size: 13px;
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
  cursor: pointer;
}

.notice {
  margin-top: 14px;
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
  color: var(--danger);
  background: var(--danger-soft);
}

.state {
  padding: 40px;
  color: var(--muted);
  text-align: center;
}
</style>
