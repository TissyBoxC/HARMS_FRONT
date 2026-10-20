<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { ArrowLeft, CircleAlert, Pencil, Save, Search, Send, Trash2 } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import {
  addPrescriptionItem,
  deletePrescriptionItem,
  getDoctorPrescription,
  submitPrescription,
  updatePrescriptionItem,
} from '@/api/clinical'
import { searchDoctorMedicines } from '@/api/medicine'
import type { Medicine, PrescriptionItem, PrescriptionRecord } from '@/types/user'

/**
 * 医生处方详情页面
 *
 * 展示处方状态和药品明细，草稿状态允许维护明细并提交处方。
 */
const route = useRoute()
const item = ref<PrescriptionRecord | null>(null)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const notice = ref('')
const editingId = ref(0)
const medicineKeyword = ref('')
const medicineOptions = ref<Medicine[]>([])
const selectedMedicine = ref<Medicine | null>(null)
const medicineSearching = ref(false)
const medicineError = ref('')
const medicineDropdownOpen = ref(false)
let medicineTimer = 0
let medicineRequest = 0
let medicineAbortController: AbortController | null = null

const itemAmount = (entry: PrescriptionItem) =>
  Number(entry.quantity || 0) * Number(entry.unit_price || 0)

// 药品明细表单同时用于新增和编辑。
const form = reactive({
  medicine_id: 0,
  dosage: '',
  frequency: '',
  days: 1,
  quantity: 1,
  remark: '',
})

// 将处方状态转换为页面展示文案。
const statusLabel = (status: number) =>
  status === 1 ? '草稿' : status === 2 ? '已提交' : '已取药'

const paymentStatusLabel = (status: number) =>
  status === 1 ? '待支付' : status === 2 ? '已支付' : status === 3 ? '已退款' : '未知'

// 只有草稿且未支付的处方允许继续编辑明细。
const editable = computed(
  () => item.value?.status === 1 && item.value?.payment_status === 1,
)

// 读取处方及其全部药品明细。
const load = async () => {
  try {
    item.value = await getDoctorPrescription(Number(route.params.id))
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

// 检索可开药药品，并在下拉项中显示药品名称和当前库存。
const searchMedicines = async (keyword = medicineKeyword.value) => {
  const requestId = ++medicineRequest
  medicineAbortController?.abort()
  medicineAbortController = new AbortController()
  medicineSearching.value = true
  medicineError.value = ''

  try {
    const result = await searchDoctorMedicines(keyword, medicineAbortController.signal)

    if (requestId === medicineRequest) {
      medicineOptions.value = result
    }
  } catch (error) {
    if (
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      return
    }

    if (requestId === medicineRequest) {
      medicineError.value = error instanceof ApiError ? error.message : '药品列表加载失败。'
    }
  } finally {
    if (requestId === medicineRequest) {
      medicineSearching.value = false
    }
  }
}

watch(medicineKeyword, (value) => {
  window.clearTimeout(medicineTimer)
  medicineTimer = window.setTimeout(() => {
    void searchMedicines(value)
  }, 250)
})

watch(
  () => form.medicine_id,
  (id) => {
    selectedMedicine.value = medicineOptions.value.find((medicine) => medicine.id === id) || null
  },
)

onBeforeUnmount(() => {
  window.clearTimeout(medicineTimer)
  medicineAbortController?.abort()
})

// 清空编辑状态，恢复新增药品明细表单。
const reset = () => {
  editingId.value = 0
  Object.assign(form, {
    medicine_id: 0,
    dosage: '',
    frequency: '',
    days: 1,
    quantity: 1,
    remark: '',
  })
  selectedMedicine.value = null
  medicineKeyword.value = ''
  medicineDropdownOpen.value = false
}

// 把药品明细回填到表单，供医生修改。
const edit = (entry: PrescriptionItem) => {
  editingId.value = entry.id

  if (!entry.medicine_id) {
    errorMessage.value = '该明细未关联库存药品，不能修改；请删除后重新选择药品。'
    return
  }

  Object.assign(form, {
    medicine_id: entry.medicine_id || 0,
    dosage: entry.dosage,
    frequency: entry.frequency,
    days: entry.days,
    quantity: entry.quantity,
    remark: entry.remark || '',
  })
  selectedMedicine.value =
    medicineOptions.value.find((medicine) => medicine.id === entry.medicine_id) ||
    (entry.medicine_id
      ? {
          id: entry.medicine_id,
          medicine_code: '',
          name: entry.drug_name,
          specification: entry.specification,
          unit: '',
          unit_price: entry.unit_price,
          stock_quantity: 0,
          warning_quantity: 0,
          manufacturer: null,
          status: 1,
          remark: null,
          low_stock: false,
          stock_text: '库存待查询',
        }
      : null)
  medicineKeyword.value = entry.drug_name
}

const selectMedicine = (medicine: Medicine) => {
  form.medicine_id = medicine.id
  selectedMedicine.value = medicine
  medicineKeyword.value = medicine.name
  medicineDropdownOpen.value = false
}

// 保存当前药品明细，并根据是否存在编辑编号调用新增或更新接口。
const save = async () => {
  if (!form.medicine_id) {
    errorMessage.value = '请选择药品。'
    return
  }

  saving.value = true
  errorMessage.value = ''

  try {
    if (editingId.value) {
      await updatePrescriptionItem(editingId.value, { ...form })
    } else {
      await addPrescriptionItem(Number(route.params.id), { ...form })
    }

    notice.value = editingId.value ? '明细已更新' : '药品明细已添加'
    reset()
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '明细保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

// 删除药品明细前确认，完成后重新读取处方。
const remove = async (id: number) => {
  if (!window.confirm('确定删除这条药品明细吗？')) {
    return
  }

  try {
    await deletePrescriptionItem(id)
    await load()
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '明细删除失败，请稍后重试。'
  }
}

// 处方草稿至少包含一条明细后即可提交。
const submit = async () => {
  if (!item.value) {
    return
  }

  saving.value = true

  try {
    item.value = await submitPrescription(item.value.id)
    notice.value = '处方已提交，等待患者支付'
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '处方提交失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await load()
  await searchMedicines('')
})
</script>

<template>
  <WorkspaceLayout role="doctor">
    <div class="page">
      <RouterLink class="back" to="/doctor/visits">
        <ArrowLeft :size="16" />
        返回就诊记录
      </RouterLink>
      <header>
        <p>临床记录</p>
        <h1>处方详情</h1>
      </header>
      <div v-if="loading" class="state">正在加载处方…</div>
      <template v-else-if="item">
        <div v-if="notice" class="notice success">{{ notice }}</div>
        <div v-if="errorMessage" class="notice error">
          <CircleAlert :size="16" />
          {{ errorMessage }}
        </div>
        <section class="summary">
          <div>
            <span>处方编号</span>
            <strong>{{ item.prescription_no }}</strong>
          </div>
          <div>
            <span>状态</span>
            <strong>{{ statusLabel(item.status) }}</strong>
          </div>
          <div>
            <span>支付状态</span>
            <strong>{{ paymentStatusLabel(item.payment_status) }}</strong>
          </div>
          <div>
            <span>处方金额</span>
            <strong>¥{{ Number(item.total_amount || 0).toFixed(2) }}</strong>
          </div>
        </section>
        <form v-if="editable" class="form" @submit.prevent="save">
          <label class="wide medicine-field">
            选择药品
            <div class="medicine-combobox">
              <button
                class="medicine-trigger"
                type="button"
                :aria-expanded="medicineDropdownOpen"
                @click="medicineDropdownOpen = !medicineDropdownOpen"
              >
                <span>
                  {{ selectedMedicine ? selectedMedicine.name : '请选择药品' }}
                  <small v-if="selectedMedicine">
                    {{ selectedMedicine.specification || '未填写规格' }}
                  </small>
                </span>
                <strong v-if="selectedMedicine">余量 {{ selectedMedicine.stock_text }}</strong>
                <Search :size="16" />
              </button>
              <div v-if="medicineDropdownOpen" class="medicine-menu">
                <label class="medicine-search">
                  <Search :size="15" />
                  <input
                    v-model="medicineKeyword"
                    placeholder="名称、拼音、首字母、编码、规格或厂家"
                    autocomplete="off"
                    @input="medicineDropdownOpen = true"
                  />
                  <small v-if="medicineSearching">检索中…</small>
                </label>
                <button
                  v-for="medicine in medicineOptions"
                  :key="medicine.id"
                  class="medicine-option"
                  type="button"
                  @click="selectMedicine(medicine)"
                >
                  <span>
                    <strong>{{ medicine.name }}</strong>
                    <small>{{ medicine.specification || '未填写规格' }}</small>
                  </span>
                  <em :class="{ low: medicine.low_stock }">余量 {{ medicine.stock_text }}</em>
                </button>
                <p v-if="!medicineSearching && !medicineOptions.length">
                  未找到药品，可尝试首字母、编码、规格或厂家关键词。
                </p>
              </div>
            </div>
            <small v-if="medicineError" class="field-error">{{ medicineError }}</small>
            <small v-else-if="selectedMedicine" class="selected-medicine">
              单价 ¥{{ Number(selectedMedicine.unit_price || 0).toFixed(2) }} · 余量
              {{ selectedMedicine.stock_text }}
            </small>
          </label>
          <label>
            单次用量
            <input v-model="form.dosage" required maxlength="100" />
          </label>
          <label>
            用药频率
            <input v-model="form.frequency" required maxlength="100" />
          </label>
          <label>
            用药天数
            <input v-model.number="form.days" type="number" min="1" required />
          </label>
          <label>
            开具数量（盒）
            <input
              v-model.number="form.quantity"
              type="number"
              min="1"
              step="1"
              required
            />
            <small class="field-hint">
              按整盒开方，填写 2 即开具 2 盒，不会根据用药频率和天数自动换算。
            </small>
          </label>
          <label class="wide">
            备注
            <textarea v-model="form.remark" rows="2" maxlength="255"></textarea>
          </label>
          <div class="form-actions">
            <button class="primary" type="submit" :disabled="saving">
              <Save :size="16" />
              {{ editingId ? '保存明细' : '添加明细' }}
            </button>
            <button
              v-if="editingId"
              class="secondary"
              type="button"
              @click="reset"
            >
              取消编辑
            </button>
          </div>
        </form>
        <div class="items">
          <div class="items-heading">
            <h2>药品明细</h2>
            <button
              v-if="editable"
              class="submit"
              type="button"
              :disabled="saving || !item.items.length"
              @click="submit"
            >
              <Send :size="15" />
              提交处方
            </button>
          </div>
          <div v-if="!item.items.length" class="state">暂无药品明细。</div>
          <article v-for="entry in item.items" :key="entry.id">
            <div>
              <strong>{{ entry.drug_name }}</strong>
              <small>
                {{ entry.specification || '未填写规格' }} · {{ entry.dosage }} ·
                {{ entry.frequency }} · {{ entry.days }} 天 · 开具 {{ entry.quantity }} 盒 ·
                单价 ¥{{ Number(entry.unit_price || 0).toFixed(2) }} ·
                金额 ¥{{ itemAmount(entry).toFixed(2) }}
              </small>
            </div>
            <div v-if="editable" class="actions">
              <button
                class="icon-button"
                type="button"
                title="编辑明细"
                @click="edit(entry)"
              >
                <Pencil :size="15" />
              </button>
              <button
                class="icon-button danger"
                type="button"
                title="删除明细"
                @click="remove(entry.id)"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </article>
        </div>
      </template>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1000px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #2563eb;
  text-decoration: none;
  font-size: 13px;
}

.page header {
  margin: 28px 0 22px;
}

.page header p {
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.page h1 {
  margin-top: 8px;
  font-size: 30px;
}

.summary {
  padding: 18px;
  display: flex;
  gap: 38px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.summary span,
.summary strong {
  display: block;
}

.summary span {
  color: #64748b;
  font-size: 12px;
}

.summary strong {
  margin-top: 5px;
}

.form {
  margin-top: 16px;
  padding: 22px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.form label {
  display: grid;
  gap: 7px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

.form input,
.form textarea {
  min-height: 40px;
  padding: 0 10px;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
}

.field-hint {
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.5;
}

.medicine-field {
  gap: 9px;
}

.medicine-combobox {
  position: relative;
}

.medicine-trigger {
  width: 100%;
  min-height: 44px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}

.medicine-trigger > span {
  flex: 1;
  min-width: 0;
}

.medicine-trigger > span strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medicine-trigger > span small,
.medicine-option small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 11px;
  font-weight: 500;
}

.medicine-trigger > strong {
  color: #166534;
  font-size: 12px;
  white-space: nowrap;
}

.medicine-menu {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 310px;
  padding: 8px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #dbe3ec;
  border-radius: 7px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
}

.medicine-search {
  min-height: 40px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #dbe3ec;
  border-radius: 6px;
}

.medicine-search input {
  width: 100%;
  min-height: 36px;
  padding: 0;
  background: transparent;
  border: 0;
  outline: 0;
}

.medicine-search small {
  color: #64748b;
  white-space: nowrap;
}

.medicine-option {
  width: 100%;
  min-height: 48px;
  margin-top: 4px;
  padding: 8px 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #17212b;
  background: transparent;
  border: 0;
  border-radius: 5px;
  cursor: pointer;
  text-align: left;
}

.medicine-option:hover {
  background: #eff6ff;
}

.medicine-option > span {
  min-width: 0;
}

.medicine-option > span strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medicine-option em {
  color: #166534;
  font-size: 12px;
  font-style: normal;
  white-space: nowrap;
}

.medicine-option em.low {
  color: #b91c1c;
  font-weight: 700;
}

.medicine-menu p {
  padding: 18px 8px;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.selected-medicine {
  color: #166534;
  font-size: 12px;
  font-weight: 500;
}

.field-error {
  color: #b91c1c;
  font-size: 12px;
}

.form textarea {
  padding-top: 9px;
  resize: vertical;
}

.wide {
  grid-column: 1 / -1;
}

.form-actions,
.items-heading,
.actions {
  display: flex;
  gap: 8px;
}

.primary,
.secondary,
.submit {
  min-height: 38px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.primary,
.submit {
  color: #fff;
  background: #2563eb;
}

.secondary {
  color: #334155;
  background: #e2e8f0;
}

.items {
  margin-top: 22px;
}

.items-heading {
  align-items: center;
  justify-content: space-between;
}

.items h2 {
  font-size: 19px;
}

.items article {
  margin-top: 9px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
}

.items strong,
.items small {
  display: block;
}

.items small {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.icon-button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  color: #2563eb;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
}

.icon-button.danger {
  color: #b91c1c;
  background: #fee2e2;
  border-color: #fecaca;
}

.notice {
  margin-bottom: 14px;
  padding: 11px;
  display: flex;
  gap: 7px;
  border-radius: 6px;
}

.notice.success {
  color: #166534;
  background: #dcfce7;
}

.notice.error {
  color: #b91c1c;
  background: #fee2e2;
}

.state {
  padding: 38px;
  color: #64748b;
  text-align: center;
}

@media (max-width: 620px) {
  .summary {
    flex-wrap: wrap;
  }

  .form {
    grid-template-columns: 1fr;
  }

  .wide {
    grid-column: auto;
  }

  .items-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
