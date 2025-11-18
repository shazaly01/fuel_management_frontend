<!-- src/views/trucks/TrucksFilter.vue -->
<template>
  <AppCard class="mb-6">
    <form @submit.prevent="applyFilters" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- فلتر رقم الشاحنة -->
      <AppInput
        id="filter-truck-number"
        v-model="filters.truck_number"
        label="رقم الشاحنة"
        placeholder="ابحث بالرقم..."
      />

      <!-- فلتر رقم المقطورة -->
      <AppInput
        id="filter-trailer-number"
        v-model="filters.trailer_number"
        label="رقم المقطورة"
        placeholder="ابحث بالرقم..."
      />

      <!-- فلتر السائق -->
      <!-- نفترض وجود هذا المكون ويعمل كباقي القوائم المنسدلة -->
      <DriversDropdown id="filter-driver" v-model="filters.driver_id" />

      <!-- أزرار التحكم -->
      <div class="flex items-end space-x-2 space-x-reverse">
        <AppButton type="submit" variant="primary" class="flex-grow">
          <MagnifyingGlassIcon class="w-5 h-5 ml-1" />
          بحث
        </AppButton>
        <AppButton @click="resetFilters" variant="secondary" class="flex-grow">
          <ArrowPathIcon class="w-5 h-5 ml-1" />
          إعادة تعيين
        </AppButton>
      </div>
    </form>
  </AppCard>
</template>

<script setup>
import { ref } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import DriversDropdown from '@/components/forms/DriversDropdown.vue' // مسار افتراضي
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['filters-applied'])

const filters = ref({
  truck_number: '',
  trailer_number: '',
  driver_id: '',
})

const applyFilters = () => {
  const activeFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([, value]) => value !== '' && value !== null),
  )
  emit('filters-applied', activeFilters)
}

const resetFilters = () => {
  filters.value = {
    truck_number: '',
    trailer_number: '',
    driver_id: '',
  }
  applyFilters()
}
</script>
