<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert, Clock3 } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getDoctorSlots } from '@/api/doctor'
import type { Slot } from '@/types/user'

/**
 * 医生排班时间段查看页面
 *
 * 时间段随正式排班生效，医生端只允许查看，不能直接新增、修改或删除。
 */
const route = useRoute()
const id = Number(route.params.id)
const items = ref<Slot[]>([])
const loading = ref(true)
const errorMessage = ref('')

const statusLabel = (status: number) =>
  status === 0 ? '可预约' : status === 1 ? '已预约' : '已锁定'

const load = async () => {
  try {
    items.value = await getDoctorSlots(id)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '时间段加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="portal-page">
      <RouterLink class="portal-back" to="/doctor/schedules">
        <ArrowLeft :size="16" />
        返回我的排班
      </RouterLink>

      <header class="portal-heading">
        <div>
        <p>门诊安排</p>
        <h1>时间段</h1>
        <span>时间段随正式排班生效，本页面仅提供查看。</span>
        </div>
      </header>

      <div v-if="errorMessage" class="portal-notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <section class="portal-card">
        <div class="portal-card-heading">
          <div>
            <p>号源明细</p>
            <h2>时间段</h2>
          </div>
          <span class="portal-chip">{{ items.length }} 个</span>
        </div>
      <div v-if="loading" class="portal-state">正在加载时间段…</div>
      <div v-else-if="!items.length" class="portal-state">暂无时间段。</div>
      <div v-else class="portal-list">
        <article v-for="item in items" :key="item.id" class="portal-list-item">
          <span class="portal-icon"><Clock3 :size="18" /></span>
          <div>
            <strong>第 {{ item.slot_no }} 号</strong>
            <small>{{ item.start_time.slice(0, 5) }}—{{ item.end_time.slice(0, 5) }}</small>
          </div>
          <span :class="{ busy: item.status !== 0 }">{{ statusLabel(item.status) }}</span>
        </article>
      </div>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.portal-list strong,
.portal-list small {
  display: block;
}

.portal-list small {
  margin-top: 4px;
  color: var(--muted);
  font-size: 12px;
}

.portal-list > article > span:last-child {
  margin-left: auto;
  color: #166534;
  font-size: 12px;
}

.portal-list > article > span.busy {
  color: var(--muted);
}
</style>
