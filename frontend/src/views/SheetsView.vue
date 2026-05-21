<template>
  <div class="sheets container">
    <SheetFilters />

    <!-- Desktop: virtual table -->
    <el-auto-resizer v-if="!isMobile" class="sheets__table">
      <template #default="{ height, width }">
        <el-table-v2
          v-loading="store.loading"
          :columns="columns"
          :data="store.products"
          :width="width"
          :height="height"
          :row-height="60"
        />
      </template>
    </el-auto-resizer>

    <!-- Mobile: card grid -->
    <div v-else v-loading="store.loading" class="sheets__cards">
      <div v-for="(product, i) in store.products" :key="i" class="sheets__card-item">
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGeneralStore } from '@/stores/general'
import { useAuthStore } from '@/stores/auth'
import { useBreakpoint } from '@/composables/useBreakpoint'
import SheetFilters from '@/components/sheets/SheetFilters.vue'
import ProductCard from '@/components/sheets/ProductCard.vue'
import type { Product, Stock } from '@/types/product'

const store = useGeneralStore()
const auth = useAuthStore()
const { t } = useI18n()
const { isMobile } = useBreakpoint()

// --- helpers ---

function price(val: number | null): string {
  if (val == null) return '—'
  return val.toLocaleString('uk-UA') + ' ' + t('units.currency')
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
    `${stock.bottles} ${t('units.pcs')}`,
  )
}

// --- columns ---

type CellProps = { rowData: Product }
type IndexCellProps = { rowIndex: number }

const columns = computed(() => {
  const base = [
    {
      key: 'index',
      title: t('columns.index'),
      width: 55,
      align: 'center',
      cellRenderer: ({ rowIndex }: IndexCellProps) =>
        h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, rowIndex + 1),
    },
    { key: 'segment', dataKey: 'segment', title: t('columns.category'), width: 130 },
    { key: 'brand', dataKey: 'brand', title: t('columns.brand'), width: 120 },
    {
      key: 'name',
      title: t('columns.name'),
      width: 220,
      flexGrow: 1,
      cellRenderer: ({ rowData }: CellProps) =>
        h(
          'span',
          {
            style: {
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            },
          },
          rowData.name,
        ),
    },
    {
      key: 'volume',
      title: t('columns.volume'),
      width: 90,
      align: 'center',
      cellRenderer: ({ rowData }: CellProps) =>
        h(
          'span',
          rowData.volume === 1 ? `1 ${t('units.unit')}` : `${rowData.volume} ${t('units.ml')}`,
        ),
    },
    {
      key: 'p_full',
      title: t('columns.priceFull'),
      width: 110,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices.full)),
    },
    {
      key: 'p_retail',
      title: t('columns.priceRetail'),
      width: 110,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices.retail)),
    },
    {
      key: 'p_500',
      title: t('columns.volumeSize', { size: 500 }),
      width: 100,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[500])),
    },
    {
      key: 'p_250',
      title: t('columns.volumeSize', { size: 250 }),
      width: 100,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[250])),
    },
    {
      key: 'p_100',
      title: t('columns.volumeSize', { size: 100 }),
      width: 100,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[100])),
    },
    {
      key: 'p_50',
      title: t('columns.volumeSize', { size: 50 }),
      width: 100,
      align: 'right',
      cellRenderer: ({ rowData }: CellProps) => h('span', price(rowData.prices[50])),
    },
  ]

  if (!auth.isLoggedIn) return base

  return [
    ...base,
    {
      key: 'stock',
      title: t('columns.stock'),
      width: 110,
      align: 'center',
      cellRenderer: ({ rowData }: CellProps) =>
        rowData.stock
          ? stockBadge(rowData.stock)
          : h('span', { style: { color: 'var(--el-text-color-placeholder)' } }, '—'),
    },
  ]
})
</script>

<style lang="scss" scoped>
.sheets {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--header-height, 64px) - var(--footer-height, 72px));
  padding-block: var(--spacing-lg);
  gap: var(--spacing-md);

  &__cards {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    align-content: start;
    padding-bottom: var(--spacing-lg);

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  &__card-item {
    content-visibility: auto;
    contain-intrinsic-size: 0 240px;
  }

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
