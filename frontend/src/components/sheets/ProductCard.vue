<template>
  <el-card class="product-card" shadow="hover">
    <div class="product-card__header">
      <span class="product-card__name">{{ product.name }}</span>
      <span v-if="auth.isLoggedIn && product.stock" class="product-card__stock" :class="stockClass">
        {{ product.stock.bottles }} {{ t('units.pcs') }}
      </span>
    </div>

    <div class="product-card__meta">
      <el-tag size="small" type="info" effect="plain">{{ product.brand }}</el-tag>
      <el-tag size="small" effect="plain">{{ product.segment }}</el-tag>
      <el-tag size="small" type="warning" effect="plain">
        {{ product.volume === 1 ? `1 ${t('units.unit')}` : `${product.volume} ${t('units.ml')}` }}
      </el-tag>
    </div>

    <ul class="product-card__prices">
      <li v-for="row in priceRows" :key="row.label" class="product-card__price-row">
        <span class="product-card__price-label">{{ row.label }}</span>
        <span class="product-card__price-value">{{ row.value }}</span>
      </li>
    </ul>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import type { Product } from '@/types/product'

const props = defineProps<{ product: Product }>()

const auth = useAuthStore()

const { t } = useI18n()

function formatPrice(val: number | null): string {
  if (val == null) return '—'
  return val.toLocaleString('uk-UA') + ' ' + t('units.currency')
}

const priceRows = computed(() =>
  [
    { label: t('columns.priceFull'), value: props.product.prices.full },
    { label: t('columns.priceRetail'), value: props.product.prices.retail },
    { label: t('columns.volumeSize', { size: 500 }), value: props.product.prices[500] },
    { label: t('columns.volumeSize', { size: 250 }), value: props.product.prices[250] },
    { label: t('columns.volumeSize', { size: 100 }), value: props.product.prices[100] },
    { label: t('columns.volumeSize', { size: 50 }), value: props.product.prices[50] },
  ]
    .filter((r) => r.value !== null)
    .map((r) => ({ label: r.label, value: formatPrice(r.value) })),
)

const stockClass = computed(() => {
  const b = props.product.stock?.bottles ?? 0
  if (b < 6) return 'product-card__stock--red'
  if (b <= 15) return 'product-card__stock--yellow'
  return 'product-card__stock--green'
})
</script>

<style lang="scss" scoped>
.product-card {
  overflow: visible;

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
  }

  &__name {
    font-size: var(--el-font-size-base);
    font-weight: 500;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  &__stock {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;

    &--red {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
    &--yellow {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning-dark-2);
    }
    &--green {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success-dark-2);
    }
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  &__prices {
    list-style: none;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--spacing-xs) var(--spacing-md);
  }

  &__price-row {
    display: contents;
  }

  &__price-label {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-secondary);
  }

  &__price-value {
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-primary);
    font-weight: 500;
    text-align: right;
    white-space: nowrap;
  }
}
</style>
