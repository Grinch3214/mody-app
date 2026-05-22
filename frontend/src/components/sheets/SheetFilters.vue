<template>
  <div class="filters">
    <!-- Desktop -->
    <template v-if="!isMobile">
      <div class="filters__row">
        <el-input
          v-model="name"
          class="filters__name"
          :placeholder="t('filters.searchPlaceholder')"
          clearable
          @input="load"
          @clear="load"
        />
        <el-button @click="reset">{{ t('filters.reset') }}</el-button>
        <el-button
          v-if="auth.isLoggedIn"
          class="filters__refresh-btn"
          :loading="store.refreshing"
          :icon="Refresh"
          @click="handleRefresh"
          >{{ t('filters.refreshDb') }}</el-button
        >
      </div>

      <div class="filters__row">
        <el-select
          v-model="selectedBrand"
          filterable
          clearable
          :placeholder="t('filters.brand')"
          style="width: 200px"
          @change="load"
          @clear="load"
        >
          <el-option v-for="b in store.allBrands" :key="b" :label="b" :value="b" />
        </el-select>

        <el-dropdown trigger="click" :hide-on-click="false" @command="toggleSegment">
          <el-button :disabled="!store.allSegments.length">
            {{
              selectedSegments.length
                ? `${t('filters.category')} (${selectedSegments.length})`
                : t('filters.category')
            }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="seg in store.allSegments"
                :key="seg"
                :command="seg"
                class="dropdown-item"
              >
                <el-icon v-if="selectedSegments.includes(seg)" class="dropdown-item__check"
                  ><Check
                /></el-icon>
                <span v-else class="dropdown-item__spacer" />
                {{ seg }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div class="filters__tags">
          <el-tag
            v-for="seg in selectedSegments"
            :key="'s-' + seg"
            size="large"
            closable
            @close="removeSegment(seg)"
          >
            {{ seg }}
          </el-tag>
        </div>

        <span class="filters__count">{{
          t('filters.items', { count: store.products.length })
        }}</span>
      </div>
    </template>

    <!-- Mobile -->
    <template v-else>
      <div class="filters__row">
        <el-input
          v-model="name"
          class="filters__name"
          :placeholder="t('filters.searchPlaceholder')"
          clearable
          @input="load"
          @clear="load"
        />
        <el-badge :value="activeFiltersCount" :hidden="activeFiltersCount === 0">
          <el-button class="filters__open-btn" @click="drawerOpen = true">
            <el-icon><Filter /></el-icon>
            {{ t('filters.title') }}
          </el-button>
        </el-badge>
        <el-button v-if="activeFiltersCount > 0" @click="reset">{{ t('filters.reset') }}</el-button>
      </div>
      <span class="filters__count filters__count--mobile">
        {{ t('filters.items', { count: store.products.length }) }}
      </span>
    </template>
  </div>

  <!-- Drawer (mobile filters) -->
  <el-drawer v-model="drawerOpen" direction="btt" size="auto" :title="t('filters.title')">
    <div class="filters__drawer">
      <el-select
        v-model="selectedBrand"
        filterable
        clearable
        :placeholder="t('filters.brand')"
        style="width: 100%"
        @change="load"
        @clear="load"
      >
        <el-option v-for="b in store.allBrands" :key="b" :label="b" :value="b" />
      </el-select>

      <el-dropdown
        trigger="click"
        :hide-on-click="false"
        style="width: 100%"
        @command="toggleSegment"
      >
        <el-button class="filters__category-btn" :disabled="!store.allSegments.length">
          {{
            selectedSegments.length
              ? `${t('filters.category')} (${selectedSegments.length})`
              : t('filters.category')
          }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="seg in store.allSegments"
              :key="seg"
              :command="seg"
              class="dropdown-item"
            >
              <el-icon v-if="selectedSegments.includes(seg)" class="dropdown-item__check"
                ><Check
              /></el-icon>
              <span v-else class="dropdown-item__spacer" />
              {{ seg }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div v-if="selectedSegments.length" class="filters__tags">
        <el-tag
          v-for="seg in selectedSegments"
          :key="'s-' + seg"
          size="large"
          closable
          @close="removeSegment(seg)"
        >
          {{ seg }}
        </el-tag>
      </div>

      <el-button style="width: 100%" @click="resetAndClose">
        {{ t('filters.reset') }}
      </el-button>
      <el-button
        v-if="auth.isLoggedIn"
        style="width: 100%"
        :loading="store.refreshing"
        :icon="Refresh"
        @click="handleRefresh"
        >{{ t('filters.refreshDb') }}</el-button
      >
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElNotification } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Check, Filter, Refresh } from '@element-plus/icons-vue'
import { useGeneralStore } from '@/stores/general'
import { useAuthStore } from '@/stores/auth'
import { useBreakpoint } from '@/composables/useBreakpoint'

const route = useRoute()
const router = useRouter()

const store = useGeneralStore()
const auth = useAuthStore()

const { t } = useI18n()
const { isMobile } = useBreakpoint()

const name = ref('')
const selectedBrand = ref('')
const selectedSegments = ref<string[]>([])
const drawerOpen = ref(false)

const activeFiltersCount = computed(
  () => (selectedBrand.value ? 1 : 0) + selectedSegments.value.length,
)

function toggleSegment(seg: string) {
  const idx = selectedSegments.value.indexOf(seg)
  if (idx === -1) selectedSegments.value.push(seg)
  else selectedSegments.value.splice(idx, 1)
  load()
}

function removeSegment(seg: string) {
  selectedSegments.value = selectedSegments.value.filter((s) => s !== seg)
  load()
}

function reset() {
  name.value = ''
  selectedBrand.value = ''
  selectedSegments.value = []
  void router.replace({ query: {} })
  void store.fetchProducts()
}

function resetAndClose() {
  reset()
  drawerOpen.value = false
}

watch(
  () => route.query,
  (q) => {
    const hasState = name.value || selectedBrand.value || selectedSegments.value.length
    if (Object.keys(q).length === 0 && hasState) {
      name.value = ''
      selectedBrand.value = ''
      selectedSegments.value = []
      void store.fetchProducts()
    }
  },
)

async function handleRefresh() {
  const success = await store.refreshProducts()
  ElNotification({
    title: success ? t('filters.refreshSuccess') : t('filters.refreshError'),
    type: success ? 'success' : 'error',
    duration: 3000,
  })
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function load() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const trimmedName = name.value.trim()
    const query: Record<string, string> = {}
    if (trimmedName) query.name = trimmedName
    if (selectedBrand.value) query.brand = selectedBrand.value
    if (selectedSegments.value.length) query.segment = selectedSegments.value.join(',')
    void router.replace({ query })
    void store.fetchProducts({
      segments: selectedSegments.value.length ? selectedSegments.value : undefined,
      brand: selectedBrand.value || undefined,
      name: trimmedName || undefined,
    })
  }, 300)
}

onMounted(() => {
  const q = route.query
  name.value = typeof q.name === 'string' ? q.name : ''
  selectedBrand.value = typeof q.brand === 'string' ? q.brand : ''
  selectedSegments.value =
    typeof q.segment === 'string' && q.segment ? q.segment.split(',').filter(Boolean) : []

  const hasFilters = name.value || selectedBrand.value || selectedSegments.value.length
  if (hasFilters) {
    void store.fetchOptions()
    void store.fetchProducts({
      name: name.value || undefined,
      brand: selectedBrand.value || undefined,
      segments: selectedSegments.value.length ? selectedSegments.value : undefined,
    })
  } else {
    void store.fetchProducts()
  }
})
</script>

<style lang="scss" scoped>
.filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex-shrink: 0;

  &__row {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  &__name {
    max-width: 300px;
    flex: 1;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);

    &:empty {
      display: none;
    }
  }

  &__count {
    margin-left: auto;
    font-size: var(--el-font-size-small);
    color: var(--el-text-color-placeholder);
    white-space: nowrap;

    &--mobile {
      margin-left: 0;
    }
  }

  &__drawer {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding-bottom: var(--spacing-lg);
  }

  &__refresh-btn {
    margin-left: auto;
  }

  &__open-btn {
    :deep(span) {
      gap: var(--spacing-xs);
    }
  }

  &__category-btn {
    width: 100%;
    padding: 4px 12px;
    color: var(--el-text-color-placeholder);

    :deep(span) {
      width: 100%;
      justify-content: space-between;
    }
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);

  &__check {
    color: var(--el-color-primary);
    font-size: 14px;
  }

  &__spacer {
    display: inline-block;
    width: 14px;
  }
}
</style>
