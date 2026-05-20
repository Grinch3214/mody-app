<template>
  <div class="sheets container">
    <div class="sheets__filters">
      <el-input
        v-model="filters.segment"
        placeholder="Сегмент"
        clearable
        @input="load"
        @clear="load"
      />
      <el-input
        v-model="filters.brand"
        placeholder="Бренд"
        clearable
        @input="load"
        @clear="load"
      />
      <el-input
        v-model="filters.name"
        placeholder="Название"
        clearable
        @input="load"
        @clear="load"
      />
    </div>

    <el-auto-resizer class="sheets__table">
      <template #default="{ height, width }">
        <el-table-v2
          v-loading="store.loading"
          :columns="columns"
          :data="store.products"
          :width="width"
          :height="height"
        />
      </template>
    </el-auto-resizer>
  </div>
</template>

<script setup lang="ts">
import { h, reactive, computed, onMounted } from 'vue'
import { useGeneralStore } from '@/stores/general'
import { useAuthStore } from '@/stores/auth'
import type { Product, Stock } from '@/types/product'

const store = useGeneralStore()
const auth = useAuthStore()

const filters = reactive({ segment: '', brand: '', name: '' })

// --- helpers ---

function price(val: number | null): string {
  if (val == null) return '—'
  return val.toLocaleString('uk-UA') + ' грн'
}

function stockBadge(stock: Stock) {
  const isRed = stock.bottles < 6
  const isYellow = stock.bottles >= 6 && stock.bottles <= 15
  const bg = isRed
    ? 'var(--el-color-danger-light-9)'
    : isYellow
      ? 'var(--el-color-warning-light-9)'
      : 'var(--el-color-success-light-9)'
  const color = isRed
    ? 'var(--el-color-danger)'
    : isYellow
      ? 'var(--el-color-warning-dark-2)'
      : 'var(--el-color-success-dark-2)'

  return h(
    'span',
    { style: { background: bg, color, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 } },
    `${stock.bottles} шт`,
  )
}

// --- columns ---

type CellProps = { rowData: Product }

type IndexCellProps = { rowIndex: number }

const baseColumns = [
  {
    key: 'index', title: '№', width: 55, align: 'center',
    cellRenderer: ({ rowIndex }: IndexCellProps) =>
      h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, rowIndex + 1),
  },
  { key: 'segment', dataKey: 'segment', title: 'Сегмент', width: 150 },
  { key: 'brand',   dataKey: 'brand',   title: 'Бренд',   width: 130 },
  { key: 'name',    dataKey: 'name',    title: 'Название', width: 220, flexGrow: 1 },
  {
    key: 'volume', title: 'Объём', width: 90, align: 'center',
    cellRenderer: ({ rowData }: CellProps) => h('span', `${rowData.volume} мл`),
  },
  {
    key: 'p_full', title: 'Полный', width: 120, align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices.full)),
  },
  {
    key: 'p_500', title: '500 мл', width: 110, align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[500])),
  },
  {
    key: 'p_250', title: '250 мл', width: 110, align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[250])),
  },
  {
    key: 'p_100', title: '100 мл', width: 110, align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[100])),
  },
  {
    key: 'p_50', title: '50 мл', width: 110, align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[50])),
  },
]

const stockColumn = {
  key: 'stock', title: 'Остаток', width: 110, align: 'center',
  cellRenderer: ({ rowData }: CellProps) =>
    rowData.stock
      ? stockBadge(rowData.stock)
      : h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, '—'),
}

const columns = computed(() =>
  auth.isLoggedIn ? [...baseColumns, stockColumn] : baseColumns,
)

// --- debounce ---

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function load() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void store.fetchProducts({
      segment: filters.segment || undefined,
      brand: filters.brand || undefined,
      name: filters.name || undefined,
    })
  }, 300)
}

onMounted(load)
</script>

<style lang="scss" scoped>
.sheets {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 64px));
  padding-block: var(--spacing-lg);
  gap: var(--spacing-md);

  &__filters {
    display: flex;
    gap: var(--spacing-md);
    flex-shrink: 0;
  }

  &__table {
    flex: 1;
  }
}
</style>
