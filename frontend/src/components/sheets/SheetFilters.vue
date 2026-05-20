<template>
  <div class="filters">
    <div class="filters__row">
      <el-input
        v-model="name"
        class="filters__name"
        placeholder="Поиск по названию"
        clearable
        @input="load"
        @clear="load"
      />
      <el-button @click="reset">Сбросить</el-button>
    </div>

    <div class="filters__row">
      <el-select
        v-model="selectedBrand"
        filterable
        clearable
        placeholder="Бренд"
        style="width: 200px"
        @change="load"
        @clear="load"
      >
        <el-option
          v-for="b in store.allBrands"
          :key="b"
          :label="b"
          :value="b"
        />
      </el-select>

      <el-dropdown trigger="click" :hide-on-click="false" @command="toggleSegment">
        <el-button>
          {{ selectedSegments.length ? `Сегмент (${selectedSegments.length})` : 'Сегмент' }}
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
              <el-icon v-if="selectedSegments.includes(seg)" class="dropdown-item__check"><Check /></el-icon>
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
          closable
          @close="removeSegment(seg)"
        >
          {{ seg }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDown, Check } from '@element-plus/icons-vue'
import { useGeneralStore } from '@/stores/general'

const store = useGeneralStore()

const name = ref('')
const selectedBrand = ref('')
const selectedSegments = ref<string[]>([])

function toggleSegment(seg: string) {
  const idx = selectedSegments.value.indexOf(seg)
  if (idx === -1) selectedSegments.value.push(seg)
  else selectedSegments.value.splice(idx, 1)
  load()
}

function removeSegment(seg: string) {
  selectedSegments.value = selectedSegments.value.filter(s => s !== seg)
  load()
}

function reset() {
  name.value = ''
  selectedBrand.value = ''
  selectedSegments.value = []
  void store.fetchProducts()
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function load() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    void store.fetchProducts({
      segments: selectedSegments.value.length ? selectedSegments.value : undefined,
      brand: selectedBrand.value || undefined,
      name: name.value || undefined,
    })
  }, 300)
}
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
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
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
