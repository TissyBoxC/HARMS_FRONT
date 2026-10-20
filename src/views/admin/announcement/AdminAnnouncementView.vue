<script setup lang="ts">
/**
 * 管理员公告管理页
 *
 * 负责公告草稿的创建、修改、发布和撤回，
 * 页面内同时展示当前全部公告及其状态。
 */
import { onMounted, reactive, ref } from 'vue'
import {
  Bell,
  Check,
  CircleAlert,
  Pencil,
  Plus,
  Send,
  Undo2,
} from 'lucide-vue-next'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  createAdminAnnouncement,
  getAdminAnnouncements,
  publishAdminAnnouncement,
  retractAdminAnnouncement,
  updateAdminAnnouncement,
} from '@/api/announcement'

// 公告列表和公告编辑表单。
const items = ref<Record<string, unknown>[]>([])
const form = reactive({
  id: 0,
  title: '',
  content: '',
})
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')

// 读取管理员可见的公告列表。
const load = async () => {
  try {
    items.value = await getAdminAnnouncements()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '公告加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// 将选中的公告内容填入编辑表单。
const edit = (item: Record<string, unknown>) =>
  Object.assign(form, {
    id: Number(item.id),
    title: String(item.title || ''),
    content: String(item.content || ''),
  })

// 清空表单并恢复为新建公告状态。
const reset = () =>
  Object.assign(form, {
    id: 0,
    title: '',
    content: '',
  })

// 根据表单编号决定创建草稿或更新已有公告。
const save = async () => {
  saving.value = true
  errorMessage.value = ''

  try {
    if (form.id) {
      await updateAdminAnnouncement(form.id, {
        title: form.title,
        content: form.content,
      })
    } else {
      await createAdminAnnouncement({
        title: form.title,
        content: form.content,
      })
    }

    notice.value = form.id ? '公告已更新' : '公告草稿已创建'
    reset()
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '公告保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 发布或撤回指定公告，并在操作完成后刷新列表。
const action = async (id: number, type: 'publish' | 'retract') => {
  try {
    if (type === 'publish') {
      await publishAdminAnnouncement(id)
    } else {
      await retractAdminAnnouncement(id)
    }

    notice.value = type === 'publish' ? '公告已发布' : '公告已撤回'
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '公告操作失败，请稍后重试。'
  }
}

// 将公告状态转换为页面标签。
const label = (status: number) =>
  status === 0 ? '草稿' : status === 1 ? '已发布' : '已撤回'

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="admin">
    <div class="page">
      <header>
        <p>内容管理</p>
        <h1>公告管理</h1>
      </header>
      <form class="form" @submit.prevent="save">
        <input
          v-model="form.title"
          required
          maxlength="200"
          placeholder="公告标题"
        />
        <textarea
          v-model="form.content"
          required
          rows="4"
          maxlength="5000"
          placeholder="公告内容"
        ></textarea>
        <div class="actions">
          <button class="primary" type="submit" :disabled="saving">
            <Plus v-if="!form.id" :size="16" />
            <Pencil v-else :size="16" />
            {{ form.id ? '保存修改' : '创建草稿' }}
          </button>
          <button
            v-if="form.id"
            class="secondary"
            type="button"
            @click="reset"
          >
            取消编辑
          </button>
        </div>
      </form>
      <div v-if="notice" class="notice success">
        <Check :size="16" />
        {{ notice }}
      </div>
      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <div v-if="loading" class="state">正在加载公告…</div>
      <div v-else class="list">
        <article v-for="item in items" :key="Number(item.id)">
          <Bell :size="18" />
          <div>
            <strong>{{ item.title }}</strong>
            <small>
              {{ label(Number(item.status)) }} ·
              {{ item.published_at || item.created_at || '' }}
            </small>
            <p>{{ item.content }}</p>
          </div>
          <div class="actions">
            <button
              v-if="Number(item.status) === 0"
              class="icon"
              type="button"
              title="编辑公告"
              @click="edit(item)"
            >
              <Pencil :size="15" />
            </button>
            <button
              v-if="Number(item.status) === 0"
              class="icon"
              type="button"
              title="发布公告"
              @click="action(Number(item.id), 'publish')"
            >
              <Send :size="15" />
            </button>
            <button
              v-if="Number(item.status) === 1"
              class="icon"
              type="button"
              title="撤回公告"
              @click="action(Number(item.id), 'retract')"
            >
              <Undo2 :size="15" />
            </button>
          </div>
        </article>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1000px;
}

.page header {
  margin-bottom: 20px;
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

.form {
  padding: 18px;
  display: grid;
  gap: 10px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.form input,
.form textarea {
  padding: 11px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.actions {
  display: flex;
  gap: 7px;
}

.primary,
.secondary {
  min-height: 38px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 5px;
  cursor: pointer;
}

.primary {
  color: #fff;
  background: var(--primary);
  border: 1px solid var(--primary);
}

.secondary {
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--border-strong);
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
  gap: 10px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 7px;
}

.list article > svg {
  color: var(--primary);
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
  font-size: 13px;
  white-space: pre-wrap;
}

.list .actions {
  margin-left: auto;
}

.icon {
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
  padding: 38px;
  color: var(--muted);
  text-align: center;
}
</style>
