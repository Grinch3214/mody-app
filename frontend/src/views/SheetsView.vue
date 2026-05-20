<template>
  <div class="sheets container">
    <SheetFilters />

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
import { h, computed } from 'vue'
import { useGeneralStore } from '@/stores/general'
import { useAuthStore } from '@/stores/auth'
import SheetFilters from '@/components/sheets/SheetFilters.vue'
import type { Product, Stock } from '@/types/product'

const store = useGeneralStore()
const auth = useAuthStore()

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
    {
      style: {
        background: bg,
        color,
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
      },
    },
    `${stock.bottles} шт`,
  )
}

// --- columns ---

type CellProps = { rowData: Product }
type IndexCellProps = { rowIndex: number }

const baseColumns = [
  {
    key: 'index',
    title: '№',
    width: 55,
    align: 'center',
    cellRenderer: ({ rowIndex }: IndexCellProps) =>
      h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, rowIndex + 1),
  },
  { key: 'segment', dataKey: 'segment', title: 'Сегмент', width: 150 },
  { key: 'brand', dataKey: 'brand', title: 'Бренд', width: 130 },
  { key: 'name', dataKey: 'name', title: 'Название', width: 220, flexGrow: 1 },
  {
    key: 'volume',
    title: 'Объём',
    width: 90,
    align: 'center',
    cellRenderer: ({ rowData }: CellProps) => h('span', `${rowData.volume} мл`),
  },
  {
    key: 'p_full',
    title: 'Мастерам',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices.full)),
  },
  {
    key: 'p_retail',
    title: 'Розница',
    width: 120,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices.retail)),
  },
  {
    key: 'p_500',
    title: '500 мл',
    width: 110,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[500])),
  },
  {
    key: 'p_250',
    title: '250 мл',
    width: 110,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[250])),
  },
  {
    key: 'p_100',
    title: '100 мл',
    width: 110,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[100])),
  },
  {
    key: 'p_50',
    title: '50 мл',
    width: 110,
    align: 'right',
    cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[50])),
  },
]

const stockColumn = {
  key: 'stock',
  title: 'Остаток',
  width: 110,
  align: 'center',
  cellRenderer: ({ rowData }: CellProps) =>
    rowData.stock
      ? stockBadge(rowData.stock)
      : h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, '—'),
}

const columns = computed(() => (auth.isLoggedIn ? [...baseColumns, stockColumn] : baseColumns))

</script>

<style lang="scss" scoped>
.sheets {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 64px) - var(--footer-height, 72px));
  padding-block: var(--spacing-lg);
  gap: var(--spacing-md);

  &__table {
    flex: 1;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      background: linear-gradient(to bottom, transparent, var(--el-bg-color));
      pointer-events: none;
    }
  }

  :deep(.el-table-v2__empty) {
    display: flex;

    > * {
      margin: auto;
    }
  }
}
</style>
