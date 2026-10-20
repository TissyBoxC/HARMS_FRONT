<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowLeft, CircleAlert, PackagePlus, Pencil, Plus, Search } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getPharmacyMedicines } from '@/api/medicine'
import type { Medicine } from '@/types/user'

const items = ref<Medicine[]>([])
const loading = ref(true)
const errorMessage = ref('')
const keyword = ref('')
const status = ref<number | undefined>(undefined)
const lowStockOnly = ref(false)
const page = ref(1)
const pageSize = 20
const total = ref(0)
let searchTimer = 0

const pageCount = () => Math.max(1, Math.ceil(total.value / pageSize))

const load = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getPharmacyMedicines({
      page: page.value,
      page_size: pageSize,
      keyword: keyword.value.trim() || undefined,
      status: status.value,
      low_stock_only: lowStockOnly.value || undefined,
    })
    items.value = result.items
    total.value = result.total
  } catch (error) {
    errorMessage.value =
      error instanceof ApiError ? error.message : '药品库存加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  void load()
}

watch(keyword, () => {
  page.value = 1
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    void load()
  }, 300)
})

onBeforeUnmount(() => {
  window.clearTimeout(searchTimer)
})

const changePage = (delta: number) => {
  const next = page.value + delta

  if (next < 1 || next > pageCount()) {
    return
  }

  page.value = next
  void load()
}

onMounted(load)
</script>

<template>
  <WorkspaceLayout role="pharmacy">
    <div class="page">
      <RouterLink class="back" to="/pharmacy/home">
        <ArrowLeft :size="16" />
        返回药房首页
      </RouterLink>

      <header class="heading">
        <div>
          <p>库存管理</p>
          <h1>药品库存</h1>
        </div>
        <RouterLink class="primary" to="/pharmacy/medicines/create">
          <Plus :size="16" />
          新增药品
        </RouterLink>
      </header>

      <form class="filters" @submit.prevent="search">
        <label class="search-field">
          <Search :size="16" />
          <input
            v-model="keyword"
            placeholder="名称、拼音、首字母、编码、规格或厂家"
          />
        </label>
        <select v-model="status">
          <option :value="undefined">全部状态</option>
          <option :value="1">启用</option>
          <option :value="0">停用</option>
        </select>
        <label class="check-field">
          <input v-model="lowStockOnly" type="checkbox" />
          仅看低库存
        </label>
        <button class="primary" type="submit">查询</button>
      </form>

      <div v-if="errorMessage" class="notice error">
        <CircleAlert :size="16" />
        {{ errorMessage }}
      </div>
      <div v-if="loading" class="state">正在加载药品库存…</div>
      <div v-else-if="!items.length" class="state">暂无药品记录。</div>
      <div v-else class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>药品编码</th>
              <th>药品名称</th>
              <th>规格</th>
              <th>单价</th>
              <th>现有库存</th>
              <th>预警阈值</th>
              <th>状态</th>
              <th class="compact-cell">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.medicine_code }}</td>
              <td>
                <strong>{{ item.name }}</strong>
                <small v-if="item.manufacturer">{{ item.manufacturer }}</small>
              </td>
              <td>{{ item.specification || '—' }}</td>
              <td>¥{{ Number(item.unit_price || 0).toFixed(2) }}</td>
              <td>
                <span :class="{ low: item.low_stock }">{{ item.stock_text }}</span>
              </td>
              <td>{{ item.warning_quantity }} {{ item.unit }}</td>
              <td>
                <span :class="item.status === 1 ? 'table-status' : 'table-status muted'">
                  {{ item.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td class="compact-cell">
                <div class="actions">
                  <RouterLink
                    class="action"
                    :to="`/pharmacy/medicines/${item.id}/stock-in`"
                  >
                    <PackagePlus :size="14" />
                    入库
                  </RouterLink>
                  <RouterLink
                    class="action"
                    :to="`/pharmacy/medicines/${item.id}/edit`"
                  >
                    <Pencil :size="14" />
                    修改
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && items.length" class="pagination">
        <button type="button" :disabled="page <= 1" @click="changePage(-1)">上一页</button>
        <span>第 {{ page }} / {{ pageCount() }} 页，共 {{ total }} 条</span>
        <button type="button" :disabled="page >= pageCount()" @click="changePage(1)">
          下一页
        </button>
      </div>
    </div>
  </WorkspaceLayout>
</template>

<style scoped>
.page {
  max-width: 1120px;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--primary);
  font-size: 13px;
  text-decoration: none;
}

.heading {
  margin: 28px 0 22px;
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
}

.heading p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
}

.heading h1 {
  margin-top: 8px;
  font-size: 30px;
}

.filters {
  margin-bottom: 18px;
  display: grid;
  grid-template-columns: minmax(240px, 1fr) 150px auto auto;
  gap: 10px;
  align-items: center;
}

.filters input,
.filters select,
.filters button {
  min-height: 40px;
  border-radius: 6px;
}

.filters select {
  padding: 0 11px;
  background: #fff;
  border: 1px solid var(--border-strong);
}

.search-field {
  min-height: 40px;
  padding: 0 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
}

.search-field input {
  width: 100%;
  min-height: 36px;
  padding: 0;
  border: 0;
  outline: 0;
}

.check-field {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 13px;
  white-space: nowrap;
}

.check-field input {
  width: 16px;
  min-height: 16px;
}

.primary {
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #fff;
  background: var(--primary);
  border: 0;
  text-decoration: none;
  cursor: pointer;
}

.data-table small {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 11px;
}

.low {
  color: var(--danger);
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 6px;
}

.action {
  min-height: 31px;
  padding: 0 9px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 5px;
  text-decoration: none;
  font-size: 12px;
  white-space: nowrap;
}

.pagination {
  margin-top: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: var(--muted);
  font-size: 12px;
}

.pagination button {
  min-height: 34px;
  padding: 0 10px;
  background: #fff;
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
}

.notice {
  margin-bottom: 14px;
  padding: 11px;
  display: flex;
  gap: 7px;
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

@media (max-width: 820px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 620px) {
  .heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
