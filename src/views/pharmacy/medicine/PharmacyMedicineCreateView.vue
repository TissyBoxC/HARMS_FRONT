<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { createPharmacyMedicine, type MedicinePayload } from '@/api/medicine'

const router = useRouter()
const saving = ref(false)
const errorMessage = ref('')

const form = reactive<MedicinePayload>({
  medicine_code: '',
  name: '',
  specification: '',
  unit: '盒',
  unit_price: 0,
  stock_quantity: 0,
  warning_quantity: 0,
  manufacturer: '',
  status: 1,
  remark: '',
})

const save = async () => {
  saving.value = true
  errorMessage.value = ''

  try {
    await createPharmacyMedicine(form)
    await router.replace('/pharmacy/medicines')
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '药品新增失败，请稍后重试。'
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
        <h1>新增药品</h1>
      </header>

      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>

      <form class="form" @submit.prevent="save">
        <label>
          药品编码
          <input v-model.trim="form.medicine_code" required maxlength="50" />
        </label>
        <label>
          药品名称
          <input v-model.trim="form.name" required maxlength="255" />
        </label>
        <label>
          规格
          <input v-model.trim="form.specification" maxlength="100" />
        </label>
        <label>
          单位
          <input v-model.trim="form.unit" required maxlength="20" />
        </label>
        <label>
          单价
          <input v-model.number="form.unit_price" type="number" min="0" step="0.01" required />
        </label>
        <label>
          初始库存
          <input
            v-model.number="form.stock_quantity"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
        <label>
          低库存预警值
          <input
            v-model.number="form.warning_quantity"
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
        <label>
          药品状态
          <select v-model.number="form.status">
            <option :value="1">启用</option>
            <option :value="0">停用</option>
          </select>
        </label>
        <label class="wide">
          生产厂家
          <input v-model.trim="form.manufacturer" maxlength="255" />
        </label>
        <label class="wide">
          备注
          <textarea v-model.trim="form.remark" maxlength="255" rows="3"></textarea>
        </label>
        <button class="primary wide" type="submit" :disabled="saving">
          <Save :size="16" />
          {{ saving ? '保存中' : '保存药品' }}
        </button>
      </form>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 900px;
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

.form {
  padding: 26px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
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

.form input,
.form select,
.form textarea {
  min-height: 42px;
  padding: 0 11px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  font: inherit;
}

.form textarea {
  padding-top: 10px;
  resize: vertical;
}

.wide {
  grid-column: 1 / -1;
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
  margin-bottom: 14px;
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

@media (max-width: 620px) {
  .form {
    grid-template-columns: 1fr;
  }

  .wide {
    grid-column: auto;
  }
}
</style>
