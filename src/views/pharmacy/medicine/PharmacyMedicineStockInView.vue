<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, PackagePlus } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPharmacyMedicine, stockInPharmacyMedicine } from '@/api/medicine'
import type { Medicine } from '@/types/user'

const route = useRoute()
const router = useRouter()
const item = ref<Medicine | null>(null)
const quantity = ref(1)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    item.value = await getPharmacyMedicine(Number(route.params.id))
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '药品信息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})

const save = async () => {
  if (quantity.value <= 0) {
    errorMessage.value = '本次入库数量必须大于 0。'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    await stockInPharmacyMedicine(Number(route.params.id), quantity.value)
    await router.replace('/pharmacy/medicines')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '库存入库失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <WorkspaceLayout role="pharmacy">
    <div class="page">
      <RouterLink class="back" to="/pharmacy/medicines">
        <ArrowLeft :size="16" />
        返回药品库存
      </RouterLink>

      <header>
        <p>库存管理</p>
        <h1>药品入库</h1>
      </header>

      <div v-if="loading" class="state">正在加载药品信息…</div>
      <template v-else-if="item">
        <section class="summary">
          <div>
            <span>药品名称</span>
            <strong>{{ item.name }}</strong>
          </div>
          <div>
            <span>规格</span>
            <strong>{{ item.specification || '未填写' }}</strong>
          </div>
          <div>
            <span>现有库存</span>
            <strong>{{ item.stock_text }}</strong>
          </div>
        </section>

        <div v-if="errorMessage" class="notice error">
          <CircleAlert :size="16" />
          {{ errorMessage }}
        </div>

        <form class="form" @submit.prevent="save">
          <label>
            本次入库数量
            <input v-model.number="quantity" type="number" min="0.01" step="0.01" required />
          </label>
          <p>入库后库存将在现有 {{ item.stock_text }} 基础上追加。</p>
          <button class="primary" type="submit" :disabled="saving">
            <PackagePlus :size="16" />
            {{ saving ? '入库中' : '确认入库' }}
          </button>
        </form>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 760px;
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
  margin: 28px 0 24px;
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

.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.summary div {
  padding: 17px;
  background: var(--surface-strong);
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color: var(--muted);
  font-size: 12px;
}

.summary strong {
  margin-top: 6px;
}

.form {
  margin-top: 18px;
  padding: 24px;
  display: grid;
  gap: 15px;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.form label {
  display: grid;
  gap: 7px;
  color: var(--ink);
  font-size: 12px;
  font-weight: 650;
}

.form input {
  min-height: 42px;
  padding: 0 11px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
}

.form p {
  color: var(--muted);
  font-size: 13px;
}

.primary {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #fff;
  background: var(--primary);
  border: 0;
  border-radius: 5px;
  cursor: pointer;
}

.primary:disabled {
  opacity: 0.6;
}

.notice {
  margin-top: 14px;
  padding: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  border-radius: 6px;
}

.error {
  color: var(--danger);
  background: var(--danger-soft);
}

.state {
  padding: 42px;
  color: var(--muted);
  text-align: center;
}

@media (max-width: 620px) {
  .summary {
    grid-template-columns: 1fr;
  }
}
</style>
