<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Clock3, Plus } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  createDepartmentManagerSlot,
  getDepartmentManagerSchedule,
  getDepartmentManagerSlots,
  updateDepartmentManagerSlotStatus,
} from '@/api/departmentManager'
import { useAuth } from '@/stores/auth'
import type { Schedule, Slot } from '@/types/user'
import { resolveWorkspaceRole } from '@/utils/workspace-role'

const route = useRoute()
const { currentUser } = useAuth()
const workspaceRole = computed(() => resolveWorkspaceRole(currentUser.value))
const scheduleId = Number(route.params.id)
const schedule = ref<Schedule | null>(null)
const slots = ref<Slot[]>([])
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const form = reactive({
  slot_no: 1,
  start_time: '08:00',
  end_time: '08:30',
})

const statusLabel = (status: number) =>
  status === 0 ? '可预约' : status === 1 ? '已预约' : '已锁定'

const load = async () => {
  loading.value = true

  try {
    const [scheduleData, slotData] = await Promise.all([
      getDepartmentManagerSchedule(scheduleId),
      getDepartmentManagerSlots(scheduleId),
    ])
    schedule.value = scheduleData
    slots.value = slotData
    form.slot_no = Math.max(0, ...slotData.map((item) => item.slot_no)) + 1
    form.start_time = scheduleData.start_time.slice(0, 5)
    form.end_time = scheduleData.end_time.slice(0, 5)
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '时间段加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const add = async () => {
  saving.value = true
  notice.value = ''
  errorMessage.value = ''

  try {
    await createDepartmentManagerSlot(scheduleId, form)
    notice.value = '时间段已添加'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '时间段添加失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

const updateStatus = async (item: Slot, event: Event) => {
  const target = event.target

  if (!(target instanceof HTMLSelectElement)) {
    return
  }

  try {
    await updateDepartmentManagerSlotStatus(item.id, Number(target.value))
    notice.value = '时间段状态已更新'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '时间段状态更新失败，请稍后重试。'
  }
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout :role="workspaceRole">
    <div class="portal-page">
      <RouterLink
        class="portal-back"
        to="/department/schedules"
      >
        <ArrowLeft :size="16" />
        返回科室排班
      </RouterLink>

      <header class="portal-heading">
        <div>
          <p>号源明细</p>
          <h1>时间段管理</h1>
          <span v-if="schedule">
            {{ schedule.schedule_date }} ·
            {{ schedule.start_time.slice(0, 5) }}—{{ schedule.end_time.slice(0, 5) }}
          </span>
        </div>
      </header>

      <div
        v-if="notice"
        class="portal-notice success"
      >
        <Check :size="16" />
        {{ notice }}
      </div>
      <div
        v-if="errorMessage"
        class="portal-notice error"
      >
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <form
        class="slot-form"
        @submit.prevent="add"
      >
        <label>
          序号
          <input
            v-model.number="form.slot_no"
            type="number"
            min="1"
            required
          />
        </label>
        <label>
          开始时间
          <input
            v-model="form.start_time"
            type="time"
            required
          />
        </label>
        <label>
          结束时间
          <input
            v-model="form.end_time"
            type="time"
            required
          />
        </label>
        <button
          class="portal-primary"
          type="submit"
          :disabled="saving"
        >
          <Plus :size="16" />
          {{ saving ? '添加中' : '添加时间段' }}
        </button>
      </form>

      <section class="table-section">
        <div class="table-section-header">
          <div>
            <h2>时间段列表</h2>
            <p>共 {{ slots.length }} 个时间段</p>
          </div>
          <Clock3 :size="18" />
        </div>
        <div
          v-if="loading"
          class="table-empty"
        >
          正在加载时间段…
        </div>
        <div
          v-else-if="!slots.length"
          class="table-empty"
        >
          暂无时间段。
        </div>
        <div
          v-else
          class="table-scroll"
        >
          <table class="data-table">
            <thead>
              <tr>
                <th>序号</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in slots"
                :key="item.id"
              >
                <td>第 {{ item.slot_no }} 号</td>
                <td>{{ item.start_time.slice(0, 5) }}</td>
                <td>{{ item.end_time.slice(0, 5) }}</td>
                <td>
                  <span class="table-status">{{ statusLabel(item.status) }}</span>
                </td>
                <td class="compact-cell">
                  <select
                    :value="item.status"
                    @change="updateStatus(item, $event)"
                  >
                    <option :value="0">可预约</option>
                    <option :value="1">已预约</option>
                    <option :value="2">已锁定</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.slot-form {
  margin-bottom: 16px;
  padding: 15px;
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.slot-form label {
  display: grid;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
}

.slot-form input,
.data-table select {
  min-height: 40px;
  padding: 0 10px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

@media (max-width: 620px) {
  .slot-form {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
